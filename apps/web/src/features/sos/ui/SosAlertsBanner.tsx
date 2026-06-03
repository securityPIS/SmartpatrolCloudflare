import { useEffect, useRef } from "react";
import { Check, MapPin, Siren } from "lucide-react";
import { useAuthStore } from "../../auth/model/authStore";
import { useSosStore } from "../model/sosStore";

interface SosAlertsBannerProps {
  shipId?: string;
}

function timeAgo(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "baru saja";
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}j lalu`;
  return `${Math.floor(diffHrs / 24)}h lalu`;
}

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export function SosAlertsBanner({ shipId }: SosAlertsBannerProps) {
  const { alerts, load, acknowledge, resolve } = useSosStore();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void load(shipId);

    intervalRef.current = setInterval(() => {
      void load(shipId);
    }, 30_000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [load, shipId]);

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE" || a.status === "ACKNOWLEDGED");

  if (activeAlerts.length === 0) return null;

  return (
    <div className="mb-4 animate-sos-flash rounded-2xl border border-red-500/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Siren className="h-5 w-5 animate-pulse text-red-400" />
        <p className="text-sm font-black uppercase tracking-widest text-rose-200">
          {activeAlerts.length} SOS aktif
        </p>
      </div>

      <div className="space-y-2">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border p-3 ${
              alert.status === "ACTIVE"
                ? "border-rose-500/30 bg-rose-500/10"
                : "border-yellow-500/30 bg-yellow-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      alert.status === "ACTIVE"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {alert.status}
                  </span>
                  <span className="text-xs text-cyan-300/80">
                    Oleh {truncateId(alert.raisedBy)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-cyan-600">
                    {timeAgo(alert.createdAt)}
                  </span>
                </div>

                {alert.message && <p className="mt-1 text-sm text-cyan-100">{alert.message}</p>}

                {(alert.lat !== null || alert.lng !== null) && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-cyan-400">
                    <MapPin className="h-3 w-3" />
                    {alert.lat !== null && alert.lng !== null
                      ? `${alert.lat.toFixed(4)}, ${alert.lng.toFixed(4)}`
                      : "lokasi sebagian"}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                {alert.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => void acknowledge(alert.id)}
                    className="rounded-lg border border-yellow-500/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-yellow-400 transition hover:bg-yellow-500/10"
                  >
                    Tanggapi
                  </button>
                )}
                {isAdmin && alert.status !== "RESOLVED" && (
                  <button
                    type="button"
                    onClick={() => void resolve(alert.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 transition hover:bg-emerald-500/10"
                  >
                    <Check className="h-3 w-3" /> Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
