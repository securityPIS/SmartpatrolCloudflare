/**
 * Compute the current shift key as `YYYY-MM-DD-DAY|NIGHT`. Day shift is
 * 06:00–17:59 local time; everything else is the night shift.
 */
export function currentShiftKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hour = now.getHours();
  const slot = hour >= 6 && hour < 18 ? "DAY" : "NIGHT";
  return `${y}-${m}-${d}-${slot}`;
}
