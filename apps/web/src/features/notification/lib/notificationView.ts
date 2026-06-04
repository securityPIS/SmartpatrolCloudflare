import type { NotificationKind } from "@smartpatrol/contracts";

export interface KindMeta {
  /** Short human label for the kind chip. */
  label: string;
  /** Tailwind classes for the icon badge / chip (border + bg + text). */
  className: string;
  /** Lucide icon name used by the page to pick a glyph. */
  icon: "siren" | "alert" | "map-pin" | "clipboard" | "bell";
}

const META: Record<NotificationKind, KindMeta> = {
  SOS: {
    label: "SOS",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    icon: "siren",
  },
  INCIDENT: {
    label: "Temuan",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    icon: "alert",
  },
  CHECKPOINT_PENDING: {
    label: "Checkpoint",
    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    icon: "map-pin",
  },
  SHIFT_WRAP_UP: {
    label: "Shift",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    icon: "clipboard",
  },
  SYSTEM: {
    label: "Sistem",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    icon: "bell",
  },
};

/** Visual metadata for a notification kind; falls back to SYSTEM if unknown. */
export function kindMeta(kind: NotificationKind): KindMeta {
  return META[kind] ?? META.SYSTEM;
}

/** Compact Indonesian relative time, e.g. "baru saja", "5m lalu", "3j lalu". */
export function formatTimeAgo(ts: number, now: number = Date.now()): string {
  const diffMins = Math.floor((now - ts) / 60_000);
  if (diffMins < 1) return "baru saja";
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}j lalu`;
  return `${Math.floor(diffHrs / 24)}h lalu`;
}
