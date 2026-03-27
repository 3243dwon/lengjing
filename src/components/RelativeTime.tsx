"use client";

import { useEffect, useState } from "react";

function formatRelative(isoString: string): string {
  const published = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHr < 24) return `${diffHr}小时前`;

  // Show as CST time for older items: "昨日 22:30" or "3月25日 14:00"
  const cst = new Date(published.getTime() + 8 * 3_600_000);
  const nowCst = new Date(now.getTime() + 8 * 3_600_000);
  const hh = cst.getUTCHours().toString().padStart(2, "0");
  const mm = cst.getUTCMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;

  const publishedDay = cst.toISOString().slice(0, 10);
  const yesterdayCst = new Date(nowCst.getTime() - 86_400_000);
  const yesterdayDay = yesterdayCst.toISOString().slice(0, 10);

  if (publishedDay === yesterdayDay) return `昨日 ${time}`;

  const month = cst.getUTCMonth() + 1;
  const day = cst.getUTCDate();
  return `${month}月${day}日 ${time}`;
}

export default function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => formatRelative(iso));

  useEffect(() => {
    setText(formatRelative(iso));
    const timer = setInterval(() => setText(formatRelative(iso)), 60_000);
    return () => clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} className="text-xs text-muted whitespace-nowrap">
      {text}
    </time>
  );
}
