import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Check, CircleOff, Clock, WifiOff } from "lucide-react";
import type { CheckpointVisitStatus, PatrolReport } from "@smartpatrol/contracts";
import { usePatrolStore } from "../model/patrolStore";
import { currentShiftKey } from "../lib/shift";
import { PatrolCameraModal } from "./PatrolCameraModal";

const STATUS_META: Record<
  CheckpointVisitStatus,
  { label: string; badge: string; icon: typeof Check }
> = {
  DONE: {
    label: "DONE",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    icon: Check,
  },
  SKIPPED: {
    label: "SKIPPED",
    badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    icon: CircleOff,
  },
  PENDING: {
    label: "PENDING",
    badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    icon: Clock,
  },
};

function CheckpointCard({ report, onOpen }: { report: PatrolReport; onOpen: () => void }) {
  const meta = STATUS_META[report.status];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="content-auto flex w-full items-center justify-between gap-3 rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4 text-left transition hover:border-cyan-500/40"
    >
      <div className="min-w-0">
        <p className="truncate font-bold text-white">{report.checkpointName}</p>
        {report.note && (
          <p className="mt-0.5 line-clamp-2 text-xs text-cyan-300/75">{report.note}</p>
        )}
        {report.media.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-cyan-500">
            <Camera className="h-3 w-3" /> {report.media.length} foto
          </p>
        )}
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${meta.badge}`}
      >
        <Icon className="h-3 w-3" />
        {meta.label}
      </span>
    </button>
  );
}

export function PatrolPage() {
  const { shipId } = useParams<{ shipId: string }>();
  const shiftKey = useMemo(() => currentShiftKey(), []);
  const { reports, status, error, pendingKeys, load } = usePatrolStore();
  const [active, setActive] = useState<PatrolReport | null>(null);

  useEffect(() => {
    if (shipId) void load(shipId, shiftKey);
  }, [shipId, shiftKey, load]);

  // Flush the outbox whenever connectivity returns.
  useEffect(() => {
    const onOnline = () => void usePatrolStore.getState().flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const list = Object.values(reports).sort((a, b) =>
    a.checkpointName.localeCompare(b.checkpointName),
  );
  const done = list.filter((r) => r.status === "DONE").length;

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <h1 className="mt-1 text-2xl font-black text-white">Patroli</h1>
          <p className="mt-0.5 text-sm text-cyan-300/75">
            Shift {shiftKey} ·{" "}
            <span className="font-black text-cyan-100">
              {done}/{list.length}
            </span>{" "}
            selesai
          </p>
        </div>
        {status === "offline" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-300">
            <WifiOff className="h-3 w-3" /> Offline
          </span>
        )}
      </div>

      {pendingKeys.length > 0 && (
        <p className="mb-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-300">
          {pendingKeys.length} laporan menunggu — akan tersinkron saat online.
        </p>
      )}

      {status === "loading" && <p className="text-sm text-cyan-300/75">Memuat…</p>}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}

      <div className="space-y-3">
        {list.map((r) => (
          <CheckpointCard key={r.checkpointId} report={r} onOpen={() => setActive(r)} />
        ))}
      </div>

      {active && <PatrolCameraModal report={active} onClose={() => setActive(null)} />}
    </div>
  );
}
