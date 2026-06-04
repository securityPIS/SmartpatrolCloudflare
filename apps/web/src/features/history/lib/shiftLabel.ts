export type ShiftSlot = "DAY" | "NIGHT";

export interface ShiftLabel {
  /** e.g. "3 Jun 2026" */
  dateLabel: string;
  slot: ShiftSlot | null;
  /** "Siang" | "Malam", or the raw key when unparseable. */
  slotLabel: string;
}

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

/** Parse a `YYYY-MM-DD-DAY|NIGHT` shift key into display parts. */
export function parseShiftKey(shiftKey: string): ShiftLabel {
  const m = /^(\d{4})-(\d{2})-(\d{2})-(DAY|NIGHT)$/.exec(shiftKey);
  if (!m) return { dateLabel: shiftKey, slot: null, slotLabel: shiftKey };
  const [, year, month, day, slot] = m;
  const monthName = MONTHS_ID[Number(month) - 1] ?? month;
  return {
    dateLabel: `${Number(day)} ${monthName} ${year}`,
    slot: slot as ShiftSlot,
    slotLabel: slot === "DAY" ? "Siang" : "Malam",
  };
}

/** Compact Indonesian relative time; "—" for a null timestamp. */
export function formatTimeAgo(ts: number | null, now: number = Date.now()): string {
  if (ts === null) return "—";
  const diffMins = Math.floor((now - ts) / 60_000);
  if (diffMins < 1) return "baru saja";
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}j lalu`;
  return `${Math.floor(diffHrs / 24)}h lalu`;
}
