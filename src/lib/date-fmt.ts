const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/**
 * "2026-03-27" → "3月27日 星期五"
 */
export function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  return `${month}月${day}日 ${weekday}`;
}
