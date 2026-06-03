import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/model/authStore";
import { useShipStore } from "../../ship/model/shipStore";
import { useServerTimeStore } from "../model/serverTimeStore";
import { SosButton } from "../../sos/ui/SosButton";
import { SosAlertsBanner } from "../../sos/ui/SosAlertsBanner";

export function DashboardPage() {
  const { status: timeStatus, serverNow, iso, error, refresh } = useServerTimeStore();
  const user = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const ships = useShipStore((s) => s.ships);
  const loadShips = useShipStore((s) => s.load);

  useEffect(() => {
    void refresh();
    void loadShips();
  }, [refresh, loadShips]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
              SP
            </span>
            <div>
              <h1 className="text-lg font-semibold">SmartPatrol</h1>
              <p className="text-sm text-slate-500">
                {authStatus === "offline" ? "Offline mode" : "Full Cloudflare • Phase 1"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>

        {user && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
            <p className="mt-1 font-medium text-slate-800">{user.fullName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-0.5 text-xs text-slate-400">Role: {user.role}</p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Trusted server time</p>
          {timeStatus === "loading" && <p className="mt-1 text-slate-500">Loading…</p>}
          {timeStatus === "error" && (
            <p className="mt-1 text-sm text-red-600">API unreachable: {error}</p>
          )}
          {timeStatus === "ok" && serverNow !== null && (
            <p className="mt-1 font-mono text-sm text-slate-800">
              {iso}
              <span className="block text-slate-400">epoch {serverNow}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Refresh server time
        </button>

        <SosAlertsBanner />

        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Start patrol</p>
          {ships.length === 0 ? (
            <p className="text-sm text-slate-400">No ships assigned.</p>
          ) : (
            <div className="space-y-2">
              {ships.map((ship) => (
                <div
                  key={ship.id}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <p className="mb-2 text-sm font-medium text-slate-800">{ship.name}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/patrol/${ship.id}`}
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
                    >
                      Patrol →
                    </Link>
                    <Link
                      to={`/incidents/${ship.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Incidents
                    </Link>
                    <SosButton shipId={ship.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === "ADMIN" && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { to: "/ships", label: "Ships" },
              { to: "/admin/users", label: "Users" },
              { to: "/admin/registrations", label: "Registrations" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
