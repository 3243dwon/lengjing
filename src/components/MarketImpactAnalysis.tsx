import type { MarketImpactAnalysis as Data } from "@/types/edition";
import SectionCard from "./SectionCard";

const sentimentClasses: Record<string, string> = {
  positive: "bg-cn-red/10 text-cn-red dark:bg-cn-red/20",
  negative: "bg-cn-green/10 text-cn-green dark:bg-cn-green/20",
  neutral: "bg-gray-100 text-muted dark:bg-gray-800 dark:text-gray-400",
};

const sentimentLabel: Record<string, string> = {
  positive: "利好",
  negative: "利空",
  neutral: "中性",
};

export default function MarketImpactAnalysis({ data }: { data?: Data }) {
  if (!data || !data.items?.length) return null;

  return (
    <SectionCard title="🎯 A股/港股影响分析">
      <p className="text-xs italic text-muted dark:text-gray-400 mb-3 pl-0.5">
        {data.summary}
      </p>
      <div className="space-y-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="border-l-2 border-amber-accent/40 pl-3"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="font-semibold text-heading dark:text-gray-100 text-sm">
                {item.event}
              </h4>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                  sentimentClasses[item.sentiment] ?? sentimentClasses.neutral
                }`}
              >
                {sentimentLabel[item.sentiment] ?? item.sentiment}
              </span>
            </div>

            <div className="space-y-1.5 text-xs leading-relaxed">
              <p className="text-body dark:text-gray-300">
                <span className="font-medium mr-1">🇨🇳 A股:</span>
                {item.chinaImpact}
              </p>
              <p className="text-body dark:text-gray-300">
                <span className="font-medium mr-1">🇭🇰 港股:</span>
                {item.hkImpact}
              </p>
            </div>

            {item.affectedSectors?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.affectedSectors.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-accent/10 text-amber-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
