import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  /** Optional "back" link target rendered above the title. */
  backTo?: string;
  backLabel?: string;
  /** Optional right-aligned action(s). */
  action?: ReactNode;
}

/** Consistent page heading used across the authenticated screens. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel = "Kembali",
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">{title}</h1>
        {subtitle && <div className="mt-0.5 text-sm text-cyan-300/75">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
