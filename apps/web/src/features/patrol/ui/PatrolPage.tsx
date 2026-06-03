import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CheckpointVisitStatus, PatrolReport } from "@smartpatrol/contracts";
import { usePatrolStore } from "../model/patrolStore";
import { currentShiftKey } from "../lib/shift";
import { PatrolCameraModal } from "./PatrolCameraModal";

const STATUS_STYLES: Record<CheckpointVisitStatus, string> = {
  DONE: "bg-green-100 text-green-700",
  SKIPPED: "bg-amber-100 text-amber-700",
  PENDING: "bg-slate-100 text-slate-500",
};

function CheckpointCard({ report, onOpen }: { report: PatrolReport; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-300"
    >
      <div>
        <p className="font-medium text-slate-800">{report.checkpointName}</p>
        {report.note && <p className="mt-0.5 text-xs text-slate-400">{report.note}</p>}
        {report.media.length > 0 && (
          <p className="mt-0.5 text-xs text-slate-400">{report.media.length} photo(s)</p>
        )}
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[report.status]}`}
      >
        {report.status}
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
    <main className="mx-auto max-w-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-brand-600 hover:underline">
            ← Back
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Patrol</h1>
          <p className="text-sm text-slate-500">
            Shift {shiftKey} · {done}/{list.length} done
          </p>
        </div>
        {status === "offline" && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            Offline
          </span>
        )}
      </div>

      {pendingKeys.length > 0 && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {pendingKeys.length} report(s) queued — will sync when online.
        </p>
      )}

      {status === "loading" && <p className="text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {list.map((r) => (
          <CheckpointCard key={r.checkpointId} report={r} onOpen={() => setActive(r)} />
        ))}
      </div>

      {active && <PatrolCameraModal report={active} onClose={() => setActive(null)} />}
    </main>
  );
}
