const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** Local `YYYY-MM-DD` for the given date (defaults to now). */
export function todayDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a `YYYY-MM-DD` as e.g. "4 Jun 2026"; passthrough if unparseable. */
export function formatDateKey(key: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return key;
  const [, y, mo, d] = m;
  return `${Number(d)} ${MONTHS_ID[Number(mo) - 1] ?? mo} ${y}`;
}

/** Tailwind text tone for a completion percentage. */
export function completionTone(pct: number): string {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 50) return "text-amber-400";
  return "text-rose-300";
}
