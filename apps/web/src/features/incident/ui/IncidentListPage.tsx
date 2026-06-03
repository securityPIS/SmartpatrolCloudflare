import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertOctagon, ArrowLeft, Plus } from "lucide-react";
import type { Incident, IncidentSeverity, IncidentStatus } from "@smartpatrol/contracts";
import { useIncidentStore } from "../model/incidentStore";
import { CreateIncidentModal } from "./CreateIncidentModal";

const STATUS_FILTERS = ["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

function severityBadgeClass(severity: IncidentSeverity): string {
  switch (severity) {
    case "LOW":
      return "bg-slate-500/10 text-slate-300 border border-slate-500/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
    case "HIGH":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/30";
    case "CRITICAL":
      return "bg-rose-500/10 text-rose-300 border border-rose-500/30";
  }
}

function statusBadgeClass(status: IncidentStatus): string {
  switch (status) {
    case "OPEN":
      return "bg-rose-500/10 text-rose-300 border border-rose-500/30";
    case "ACKNOWLEDGED":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
    case "RESOLVED":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
  }
}

function IncidentCard({ incident }: { incident: Incident }) {
  const timeAgo = (() => {
    const diffMs = Date.now() - incident.createdAt;
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    return `${Math.floor(diffHrs / 24)}h lalu`;
  })();

  return (
    <div className="content-auto rounded-2xl border border-yellow-500/20 bg-cyan-950/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-cyan-50">{incident.title}</p>
          {incident.description && (
            <p className="mt-1 line-clamp-2 text-sm text-cyan-300/75">{incident.description}</p>
          )}
          <p className="mt-1 text-[10px] uppercase tracking-widest text-cyan-600">{timeAgo}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(incident.status)}`}
          >
            {incident.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${severityBadgeClass(incident.severity)}`}
          >
            {incident.severity}
          </span>
        </div>
      </div>
    </div>
  );
}

export function IncidentListPage() {
  const { shipId } = useParams<{ shipId: string }>();
  const { incidents, status, error, load } = useIncidentStore();
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!shipId) return;
    void load(shipId, filter === "ALL" ? undefined : filter);
  }, [shipId, filter, load]);

  if (!shipId) {
    return <p className="p-6 text-rose-300">ID kapal tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <div className="mt-2 mb-5 flex items-center gap-2">
        <AlertOctagon className="h-6 w-6 text-yellow-400" />
        <h1 className="text-xl font-black text-white">Temuan</h1>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
                filter === f
                  ? "border border-cyan-500/30 bg-cyan-600/20 text-cyan-300"
                  : "border border-cyan-800/50 text-cyan-700 hover:text-cyan-500"
              }`}
            >
              {f === "ALL" ? "Semua" : f}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500"
        >
          <Plus className="h-4 w-4" /> Lapor
        </button>
      </div>

      {status === "loading" && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && incidents.length === 0 && (
        <p className="text-sm text-cyan-600">Belum ada temuan.</p>
      )}

      <div className="space-y-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      {showCreate && (
        <CreateIncidentModal
          shipId={shipId}
          onClose={() => {
            setShowCreate(false);
            void load(shipId, filter === "ALL" ? undefined : filter);
          }}
        />
      )}
    </div>
  );
}
