import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Incident, IncidentSeverity, IncidentStatus } from "@smartpatrol/contracts";
import { useIncidentStore } from "../model/incidentStore";
import { CreateIncidentModal } from "./CreateIncidentModal";

const STATUS_FILTERS = ["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

function severityBadgeClass(severity: IncidentSeverity): string {
  switch (severity) {
    case "LOW":
      return "bg-slate-100 text-slate-700";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "CRITICAL":
      return "bg-red-100 text-red-700";
  }
}

function statusBadgeClass(status: IncidentStatus): string {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-700";
    case "ACKNOWLEDGED":
      return "bg-amber-100 text-amber-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
  }
}

function IncidentCard({ incident }: { incident: Incident }) {
  const timeAgo = (() => {
    const diffMs = Date.now() - incident.createdAt;
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  })();

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{incident.title}</p>
          {incident.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{incident.description}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">{timeAgo}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(incident.status)}`}
          >
            {incident.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityBadgeClass(incident.severity)}`}
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
    return <p className="p-6 text-red-600">Missing ship ID.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/" className="text-sm text-brand-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Incidents</h1>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                filter === f
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 whitespace-nowrap"
        >
          + Report Incident
        </button>
      </div>

      {status === "loading" && <p className="text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      {status === "ready" && incidents.length === 0 && (
        <p className="text-sm text-slate-400">No incidents found.</p>
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
    </main>
  );
}
