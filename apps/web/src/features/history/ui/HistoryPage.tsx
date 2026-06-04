import { type ReactNode, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, FileText, MinusCircle, Ship } from "lucide-react";
import type { ShiftSummary } from "@smartpatrol/contracts";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { useAuthStore } from "../../auth/model/authStore";
import { useShipStore } from "../../ship/model/shipStore";
import { useHistoryStore } from "../model/historyStore";
import { formatTimeAgo, parseShiftKey } from "../lib/shiftLabel";

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
        active
          ? "border border-cyan-500/30 bg-cyan-600/20 text-cyan-300"
          : "border border-cyan-800/50 text-cyan-700 hover:text-cyan-500"
      }`}
    >
      {children}
    </button>
  );
}

function Tally({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-2 text-center">
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {icon}
        <span className="text-lg font-black">{value}</span>
      </div>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-600">{label}</p>
    </div>
  );
}

function ShiftCard({
  summary,
  shipName,
  showShip,
}: {
  summary: ShiftSummary;
  shipName: string;
  showShip: boolean;
}) {
  const { dateLabel, slot, slotLabel } = parseShiftKey(summary.shiftKey);
  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showShip && (
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
              <Ship className="h-3 w-3" /> {shipName}
            </p>
          )}
          <p className="mt-0.5 font-bold text-cyan-50">{dateLabel}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
            slot === "NIGHT"
              ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {slotLabel}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-600">
          <span>{pct}% selesai</span>
          <span>
            {summary.done}/{summary.total} titik
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cyan-950/60">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Tally
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Selesai"
          value={summary.done}
          className="text-emerald-400"
        />
        <Tally
          icon={<MinusCircle className="h-4 w-4" />}
          label="Dilewati"
          value={summary.skipped}
          className="text-amber-400"
        />
        <Tally
          icon={<CircleDashed className="h-4 w-4" />}
          label="Tertunda"
          value={summary.pending}
          className="text-rose-300"
        />
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-widest text-cyan-700">
        Aktivitas terakhir: {formatTimeAgo(summary.lastActivityAt)}
      </p>
    </div>
  );
}

export function HistoryPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { summaries, status, error, load } = useHistoryStore();
  const ships = useShipStore((s) => s.ships);
  const loadShips = useShipStore((s) => s.load);
  const [shipFilter, setShipFilter] = useState<string>("ALL");

  useEffect(() => {
    void load();
    void loadShips();
  }, [load, loadShips]);

  const isAdmin = role === "ADMIN";
  const shipName = (id: string) =>
    ships.find((s) => s.id === id)?.name ?? `Kapal ${id.slice(0, 6)}`;

  const distinctShips = useMemo(
    () => Array.from(new Set(summaries.map((s) => s.shipId))),
    [summaries],
  );
  const showFilter = distinctShips.length > 1;

  const visible = useMemo(
    () => (shipFilter === "ALL" ? summaries : summaries.filter((s) => s.shipId === shipFilter)),
    [summaries, shipFilter],
  );

  return (
    <div className="mx-auto max-w-2xl p-4">
      <PageHeader
        eyebrow="Laporan"
        title="Riwayat Patroli"
        subtitle={isAdmin ? "Rekap shift seluruh armada" : "Rekap shift kapal Anda"}
      />

      {showFilter && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <FilterChip active={shipFilter === "ALL"} onClick={() => setShipFilter("ALL")}>
            Semua
          </FilterChip>
          {distinctShips.map((id) => (
            <FilterChip key={id} active={shipFilter === id} onClick={() => setShipFilter(id)}>
              {shipName(id)}
            </FilterChip>
          ))}
        </div>
      )}

      {status === "loading" && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && visible.length === 0 && (
        <div className="rounded-2xl border border-cyan-900/40 bg-[#0b1229] p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-cyan-700" />
          <p className="mt-3 text-sm text-cyan-600">Belum ada riwayat patroli.</p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((s) => (
          <ShiftCard
            key={`${s.shipId}-${s.shiftKey}`}
            summary={s}
            shipName={shipName(s.shipId)}
            showShip={isAdmin || showFilter}
          />
        ))}
      </div>
    </div>
  );
}
