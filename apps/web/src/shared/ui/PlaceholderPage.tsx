import type { ReactNode } from "react";

interface PlaceholderPageProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * On-brand "feature in progress" screen. Used by routes whose full
 * implementation is scheduled for a later vertical slice (Laporan, Daily
 * Report, Notifikasi) so the navigation is complete and never dead-ends.
 */
export function PlaceholderPage({ icon, eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-md p-4">
      <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-950/30 text-cyan-400">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-cyan-300/75">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
          Segera Hadir
        </span>
      </div>
    </div>
  );
}
