import { type ReactNode, useEffect, useState } from "react";
import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  MinusCircle,
  Ship,
  Siren,
} from "lucide-react";
import type { DailyShipReport } from "@smartpatrol/contracts";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { useReportStore } from "../model/reportStore";
import { completionTone, formatDateKey, todayDateKey } from "../lib/reportView";

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className={`flex items-center gap-1.5 ${tone}`}>
        {icon}
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600">{label}</p>
    </div>
  );
}

function ShipRow({ ship }: { ship: DailyShipReport }) {
  const pct = ship.total > 0 ? Math.round((ship.done / ship.total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-bold text-cyan-50">
          <Ship className="h-4 w-4 text-cyan-400" /> {ship.shipName}
        </p>
        <span className={`text-sm font-black ${completionTone(pct)}`}>{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cyan-950/60">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest">
        <span className="text-emerald-400">{ship.done} selesai</span>
        <span className="text-amber-400">{ship.skipped} lewat</span>
        <span className="text-rose-300">{ship.pending} tertunda</span>
      </div>
    </div>
  );
}

export function DailyReportPage() {
  const [date, setDate] = useState(() => todayDateKey());
  const { report, status, error, load } = useReportStore();

  useEffect(() => {
    void load(date);
  }, [date, load]);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <PageHeader
        eyebrow="Report"
        title="Daily Report"
        subtitle={formatDateKey(date)}
        action={
          <input
            type="date"
            value={date}
            max={todayDateKey()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-cyan-700 bg-[#0b1229] px-3 py-2 text-xs font-bold text-cyan-200 [color-scheme:dark]"
          />
        }
      />

      {status === "loading" && !report && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}

      {report && (
        <>
          <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
              Penyelesaian Patroli
            </p>
            <p
              className={`mt-1 text-5xl font-black ${completionTone(report.patrol.completionPct)}`}
            >
              {report.patrol.completionPct}%
            </p>
            <p className="mt-1 text-sm text-cyan-300/75">
              {report.patrol.done}/{report.patrol.total} titik · {report.shipsTotal} kapal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Selesai"
              value={report.patrol.done}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="text-emerald-400"
            />
            <MetricCard
              label="Dilewati"
              value={report.patrol.skipped}
              icon={<MinusCircle className="h-5 w-5" />}
              tone="text-amber-400"
            />
            <MetricCard
              label="Tertunda"
              value={report.patrol.pending}
              icon={<CircleDashed className="h-5 w-5" />}
              tone="text-rose-300"
            />
            <MetricCard
              label="SOS Aktif"
              value={report.activeSos}
              icon={<Siren className="h-5 w-5" />}
              tone="text-rose-400"
            />
            <MetricCard
              label="Temuan Terbuka"
              value={report.openIncidents}
              icon={<AlertOctagon className="h-5 w-5" />}
              tone="text-yellow-400"
            />
            <MetricCard
              label="Kapal"
              value={report.shipsTotal}
              icon={<Ship className="h-5 w-5" />}
              tone="text-cyan-300"
            />
          </div>

          <h2 className="mb-2 mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
            <BarChart3 className="h-3.5 w-3.5" /> Per Kapal
          </h2>
          {report.perShip.length === 0 ? (
            <p className="text-sm text-cyan-600">Tidak ada kapal.</p>
          ) : (
            <div className="space-y-3">
              {report.perShip.map((s) => (
                <ShipRow key={s.shipId} ship={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
