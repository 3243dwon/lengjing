/**
 * notify-feishu.ts
 *
 * Reads today's edition and sends a filtered, concise briefing card
 * to a Feishu (Lark) webhook. Weekend runs get a lighter "weekend prep" card.
 *
 * Usage:  npx tsx scripts/notify-feishu.ts
 * Env:    FEISHU_WEBHOOK_URL  (loaded from .env)
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Edition, MarketItem } from "../src/types/edition";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_URL = process.env.SITE_URL ?? "https://lengjing.vercel.app";

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00+08:00");
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

// ──────────────────────────────────────────────
// Formatting helpers
// ──────────────────────────────────────────────

function fmtMarket(m: MarketItem): string {
  if (m.price == null || m.change == null) return `${m.name}: —`;
  const arrow = m.change > 0 ? "🔴" : m.change < 0 ? "🟢" : "⚪️"; // CN convention: red up, green down
  const sign = m.change > 0 ? "+" : "";
  const price = typeof m.price === "number" ? m.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : m.price;
  return `${arrow} **${m.name}** ${price}  ${sign}${m.change.toFixed(2)}%`;
}

function sentimentHeaderColor(emoji?: string): "red" | "orange" | "yellow" | "green" | "blue" | "grey" {
  // Feishu header template colors
  switch (emoji) {
    case "☀️":
      return "red"; // optimistic (CN: red = up)
    case "⛅":
      return "yellow";
    case "🌧️":
      return "green"; // pessimistic (CN: green = down)
    case "⛈️":
      return "blue"; // panic
    default:
      return "grey";
  }
}

// ──────────────────────────────────────────────
// Card builders
// ──────────────────────────────────────────────

interface FeishuCard {
  msg_type: "interactive";
  card: Record<string, unknown>;
}

function buildWeekdayCard(ed: Edition): FeishuCard {
  const { meta, overallSentiment, todayHighlights, globalMarkets, marketImpactAnalysis } = ed;

  // Pick key markets for CN/HK focus
  const keyRegions = ["cn", "hk", "us"];
  const keyMarkets = globalMarkets
    .filter((m) => keyRegions.includes(m.region) && m.price != null)
    .slice(0, 9);

  const marketsByRegion: Record<string, MarketItem[]> = {};
  for (const m of keyMarkets) {
    marketsByRegion[m.region] = marketsByRegion[m.region] || [];
    marketsByRegion[m.region].push(m);
  }

  const elements: Record<string, unknown>[] = [];

  // Sentiment banner
  if (overallSentiment) {
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `${overallSentiment.emoji} **${overallSentiment.phrase}**\n${meta.greeting}`,
      },
    });
    elements.push({ tag: "hr" });
  }

  // Top 3 highlights
  if (todayHighlights?.length) {
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: "📌 **今日要点**",
      },
    });
    for (const h of todayHighlights.slice(0, 3)) {
      elements.push({
        tag: "div",
        text: {
          tag: "lark_md",
          content: `${h.emoji} **${h.title}**\n${h.summary}`,
        },
      });
    }
    elements.push({ tag: "hr" });
  }

  // Key markets (CN + HK first, then US)
  elements.push({
    tag: "div",
    text: {
      tag: "lark_md",
      content: "🌐 **关键市场**",
    },
  });
  const regionOrder: Array<{ key: string; label: string }> = [
    { key: "cn", label: "🇨🇳 A股" },
    { key: "hk", label: "🇭🇰 港股" },
    { key: "us", label: "🇺🇸 美股" },
  ];
  for (const { key, label } of regionOrder) {
    const items = marketsByRegion[key];
    if (!items?.length) continue;
    const lines = items.map(fmtMarket).join("\n");
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**${label}**\n${lines}`,
      },
    });
  }

  // Market impact analysis (the key new section)
  if (marketImpactAnalysis?.items?.length) {
    elements.push({ tag: "hr" });
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `🎯 **A股/港股影响分析**\n_${marketImpactAnalysis.summary}_`,
      },
    });
    for (const item of marketImpactAnalysis.items.slice(0, 3)) {
      const sectorTags = item.affectedSectors?.length
        ? `\n🏷️ ${item.affectedSectors.map((s) => `\`${s}\``).join(" ")}`
        : "";
      elements.push({
        tag: "div",
        text: {
          tag: "lark_md",
          content: `▫️ **${item.event}**\n🇨🇳 ${item.chinaImpact}\n🇭🇰 ${item.hkImpact}${sectorTags}`,
        },
      });
    }
  }

  // Footer CTA
  elements.push({ tag: "hr" });
  elements.push({
    tag: "action",
    actions: [
      {
        tag: "button",
        text: { tag: "lark_md", content: "📖 查看完整简报" },
        type: "primary",
        url: `${SITE_URL}/archive/${meta.date}`,
      },
    ],
  });

  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        template: sentimentHeaderColor(overallSentiment?.emoji),
        title: {
          tag: "plain_text",
          content: `🔷 ${meta.edition}`,
        },
      },
      elements,
    },
  };
}

function buildWeekendCard(ed: Edition): FeishuCard {
  const { meta, overallSentiment, todayHighlights, marketImpactAnalysis } = ed;

  const elements: Record<string, unknown>[] = [];

  elements.push({
    tag: "div",
    text: {
      tag: "lark_md",
      content: `☕️ **周末轻简报** · ${meta.date}\n${meta.greeting ?? "周末愉快，市场休市，用轻简报回顾一周。"}`,
    },
  });
  elements.push({ tag: "hr" });

  // Top 2 highlights only (lighter)
  if (todayHighlights?.length) {
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: "📌 **本周关注**",
      },
    });
    for (const h of todayHighlights.slice(0, 2)) {
      elements.push({
        tag: "div",
        text: {
          tag: "lark_md",
          content: `${h.emoji} **${h.title}**\n${h.summary}`,
        },
      });
    }
  }

  // Just 1 impact analysis for weekend
  if (marketImpactAnalysis?.items?.[0]) {
    elements.push({ tag: "hr" });
    const item = marketImpactAnalysis.items[0];
    elements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `🎯 **下周展望**\n**${item.event}**\n🇨🇳🇭🇰 ${item.chinaImpact}`,
      },
    });
  }

  elements.push({ tag: "hr" });
  elements.push({
    tag: "action",
    actions: [
      {
        tag: "button",
        text: { tag: "lark_md", content: "📖 查看完整简报" },
        type: "default",
        url: `${SITE_URL}/archive/${meta.date}`,
      },
    ],
  });

  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        template: "grey",
        title: {
          tag: "plain_text",
          content: `☕️ ${meta.edition} · 周末版`,
        },
      },
      elements,
    },
  };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("ℹ  FEISHU_WEBHOOK_URL not set — skipping Feishu notification.");
    return;
  }

  const date = today();
  const editionPath = path.join(ROOT, "data", "editions", `${date}.json`);
  if (!fs.existsSync(editionPath)) {
    console.error(`✗ Edition not found: ${editionPath}`);
    process.exit(1);
  }

  const edition = JSON.parse(fs.readFileSync(editionPath, "utf-8")) as Edition;
  const card = isWeekend(date) ? buildWeekendCard(edition) : buildWeekdayCard(edition);

  console.log(`📤 Posting ${isWeekend(date) ? "weekend" : "weekday"} card to Feishu …`);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`✗ Feishu webhook failed: HTTP ${res.status}\n${body}`);
    process.exit(1);
  }

  const json = JSON.parse(body) as { code?: number; msg?: string };
  if (json.code && json.code !== 0) {
    console.error(`✗ Feishu error: code=${json.code} msg=${json.msg}`);
    process.exit(1);
  }

  console.log(`✅ Feishu notification sent.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
