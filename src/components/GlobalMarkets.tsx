import type { MarketItem } from "@/types/edition";
import SectionCard from "./SectionCard";

function formatPrice(price: number): string {
  if (price >= 10000) return price.toFixed(2);
  if (price >= 100) return price.toFixed(2);
  return price.toFixed(4);
}

function MarketRow({ item }: { item: MarketItem }) {
  const isUp = item.change > 0;
  const isDown = item.change < 0;
  const color = isUp ? "text-cn-red" : isDown ? "text-cn-green" : "text-muted";
  const sign = isUp ? "+" : "";
  const arrow = isUp ? "▲" : isDown ? "▼" : "–";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-heading truncate block">
          {item.name}
        </span>
      </div>
      <div className="text-right flex items-center gap-3">
        <span className="text-base font-medium text-heading tabular-nums">
          {formatPrice(item.price)}
        </span>
        <span className={`text-base font-semibold tabular-nums min-w-[72px] text-right ${color}`}>
          {arrow} {sign}{item.change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export default function GlobalMarkets({ items }: { items: MarketItem[] }) {
  const groups: Record<string, { label: string; items: MarketItem[] }> = {};
  const groupOrder = [
    { key: "cn", label: "🇨🇳 A股" },
    { key: "hk", label: "🇭🇰 港股" },
    { key: "us", label: "🇺🇸 美股" },
    { key: "jp", label: "🇯🇵 日股" },
    { key: "fx", label: "💱 外汇" },
    { key: "commodity", label: "🛢️ 大宗商品" },
    { key: "crypto", label: "₿ 加密货币" },
  ];

  for (const g of groupOrder) {
    const filtered = items.filter((i) => i.region === g.key);
    if (filtered.length > 0) {
      groups[g.key] = { label: g.label, items: filtered };
    }
  }

  return (
    <SectionCard title="全球市场速览" icon="🌍">
      <div className="space-y-3">
        {groupOrder.map((g) => {
          const group = groups[g.key];
          if (!group) return null;
          return (
            <div key={g.key}>
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                {group.label}
              </div>
              <div>
                {group.items.map((item) => (
                  <MarketRow key={item.code} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-cn-red" />
          涨
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-cn-green" />
          跌
        </span>
      </div>
    </SectionCard>
  );
}
