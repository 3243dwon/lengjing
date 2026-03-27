import Link from "next/link";
import { loadEdition } from "@/lib/load-edition";
import BriefingView from "@/components/BriefingView";

export const dynamic = "force-dynamic";

export default function Home() {
  const { data, source } = loadEdition();

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-5 pt-8 pb-4 sm:px-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-heading tracking-tight">
            ☀️ 晨风早报
          </h1>
          <Link
            href="/archive"
            className="text-xs text-amber-accent hover:underline underline-offset-2"
          >
            查看往期 →
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted">{data.meta.edition}</p>
          {source === "mock" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
              示例数据
            </span>
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">{data.meta.date}</p>
        <p className="text-sm text-body mt-2">{data.meta.greeting}</p>
      </header>

      <BriefingView data={data} />
    </div>
  );
}
