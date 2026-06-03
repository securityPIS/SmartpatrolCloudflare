import { useEffect, useRef } from "react";
import { useAuthStore } from "../../auth/model/authStore";
import { useSosStore } from "../model/sosStore";

interface SosAlertsBannerProps {
  shipId?: string;
}

function timeAgo(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
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

  const activeAlerts = alerts.filter(
    (a) => a.status === "ACTIVE" || a.status === "ACKNOWLEDGED",
  );

  if (activeAlerts.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-600" />
        <p className="text-sm font-semibold text-red-700">
          {activeAlerts.length} active SOS alert{activeAlerts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${
              alert.status === "ACTIVE"
                ? "border-red-200 bg-white"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      alert.status === "ACTIVE"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {alert.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    Raised by {truncateId(alert.raisedBy)}
                  </span>
                  <span className="text-xs text-slate-400">{timeAgo(alert.createdAt)}</span>
                </div>

                {alert.message && (
                  <p className="mt-1 text-sm text-slate-700">{alert.message}</p>
                )}

                {(alert.lat !== null || alert.lng !== null) && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Location:{" "}
                    {alert.lat !== null && alert.lng !== null
                      ? `${alert.lat.toFixed(4)}, ${alert.lng.toFixed(4)}`
                      : "partial"}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                {alert.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => void acknowledge(alert.id)}
                    className="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    Acknowledge
                  </button>
                )}
                {isAdmin && alert.status !== "RESOLVED" && (
                  <button
                    type="button"
                    onClick={() => void resolve(alert.id)}
                    className="rounded-lg border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                  >
                    Resolve
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
