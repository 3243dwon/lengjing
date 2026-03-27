import Link from "next/link";
import { listEditions, loadEditionByDate } from "@/lib/load-edition";
import { formatDateCN } from "@/lib/date-fmt";

export const dynamic = "force-dynamic";

export default function ArchivePage() {
  const dates = listEditions(30);

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-5 pt-8 pb-4 sm:px-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-heading tracking-tight">
            📚 往期早报
          </h1>
          <Link
            href="/"
            className="text-xs text-amber-accent hover:underline underline-offset-2"
          >
            ← 返回今日
          </Link>
        </div>
        <p className="text-sm text-muted mt-1">最近 30 期</p>
      </header>

      <main className="px-4 sm:px-6 pb-10 max-w-lg mx-auto">
        {dates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center">
            <p className="text-muted text-sm">暂无往期数据</p>
            <p className="text-muted text-xs mt-1">
              运行 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">npm run generate</code> 生成第一期
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map((date) => {
              const edition = loadEditionByDate(date);
              const preview =
                edition?.todayHighlights?.[0]?.title ?? "—";
              const emoji =
                edition?.todayHighlights?.[0]?.emoji ?? "📰";

              return (
                <Link
                  key={date}
                  href={`/archive/${date}`}
                  className="block bg-white rounded-2xl shadow-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading">
                        {formatDateCN(date)}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{date}</p>
                      <p className="text-sm text-body mt-1.5 truncate">
                        {emoji} {preview}
                      </p>
                    </div>
                    <span className="text-muted text-sm shrink-0 mt-0.5">›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
