import type { OverseasItem } from "@/types/edition";
import SectionCard from "./SectionCard";

export default function OverseasPerspective({ items }: { items: OverseasItem[] }) {
  return (
    <SectionCard title="海外视角" icon="🔭">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-cream/60 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs text-muted">
              <span className="font-medium">{item.source}</span>
              <span>·</span>
              <span>{item.region}</span>
            </div>
            <h3 className="font-semibold text-heading text-[15px] mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-body leading-relaxed">{item.summary}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
