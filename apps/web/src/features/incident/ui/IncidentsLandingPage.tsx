import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { AlertOctagon, ChevronRight, Ship as ShipIcon } from "lucide-react";
import { useShipStore } from "../../ship/model/shipStore";
import { PageHeader } from "../../../shared/ui/PageHeader";

/**
 * Global "Temuan" entry point. A user assigned to a single ship is taken
 * straight to that ship's incidents; otherwise they pick a ship first.
 */
export function IncidentsLandingPage() {
  const ships = useShipStore((s) => s.ships);
  const status = useShipStore((s) => s.status);
  const load = useShipStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "ready" && ships.length === 1) {
    return <Navigate to={`/incidents/${ships[0].id}`} replace />;
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <PageHeader
        eyebrow="Temuan"
        title="Temuan per Kapal"
        subtitle="Pilih kapal untuk melihat temuan."
      />

      {status === "loading" && <p className="text-sm text-cyan-300/75">Memuat…</p>}

      {status === "ready" && ships.length === 0 ? (
        <p className="rounded-xl border border-dashed border-cyan-900/50 p-4 text-center text-sm text-cyan-700">
          Belum ada kapal yang ditugaskan.
        </p>
      ) : (
        <div className="space-y-3">
          {ships.map((ship) => (
            <Link
              key={ship.id}
              to={`/incidents/${ship.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4 transition hover:border-cyan-500/40"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/30">
                  <ShipIcon className="h-4 w-4 text-cyan-400" />
                </span>
                <span className="truncate text-sm font-bold text-white">{ship.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                <AlertOctagon className="h-3.5 w-3.5" /> Temuan
                <ChevronRight className="h-4 w-4 text-cyan-700" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
