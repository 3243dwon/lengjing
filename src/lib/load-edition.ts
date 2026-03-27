import fs from "node:fs";
import path from "node:path";
import type { Edition } from "@/types/edition";
import mockEdition from "@/data/mock/edition.json";

const EDITIONS_DIR = path.join(process.cwd(), "data", "editions");

function listEditionFiles(): string[] {
  if (!fs.existsSync(EDITIONS_DIR)) return [];
  return fs
    .readdirSync(EDITIONS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse();
}

/**
 * Finds the latest edition JSON in data/editions/, falling back to mock data.
 */
export function loadEdition(): { data: Edition; source: "live" | "mock" } {
  try {
    const files = listEditionFiles();
    if (files.length > 0) {
      const latest = path.join(EDITIONS_DIR, files[0]);
      const raw = fs.readFileSync(latest, "utf-8");
      return { data: JSON.parse(raw) as Edition, source: "live" };
    }
  } catch (err) {
    console.warn("⚠ Failed to load live edition, falling back to mock:", (err as Error).message);
  }
  return { data: mockEdition as Edition, source: "mock" };
}

/**
 * Load a specific edition by date string (YYYY-MM-DD).
 */
export function loadEditionByDate(date: string): Edition | null {
  try {
    const filePath = path.join(EDITIONS_DIR, `${date}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as Edition;
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * List all available edition dates, newest first, capped at `limit`.
 * Returns date strings like "2026-03-27".
 */
export function listEditions(limit = 30): string[] {
  return listEditionFiles()
    .map((f) => f.replace(".json", ""))
    .slice(0, limit);
}
