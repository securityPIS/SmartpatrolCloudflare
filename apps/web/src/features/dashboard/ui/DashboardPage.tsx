import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Ship, MapPin, AlertOctagon, Clock, RefreshCcw } from "lucide-react";
import { useAuthStore } from "../../auth/model/authStore";
import { useShipStore } from "../../ship/model/shipStore";
import { useServerTimeStore } from "../model/serverTimeStore";
import { SosButton } from "../../sos/ui/SosButton";
import { SosAlertsBanner } from "../../sos/ui/SosAlertsBanner";

export function DashboardPage() {
  const { status: timeStatus, serverNow, iso, error, refresh } = useServerTimeStore();
  const user = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const ships = useShipStore((s) => s.ships);
  const loadShips = useShipStore((s) => s.load);

  useEffect(() => {
    void refresh();
    void loadShips();
  }, [refresh, loadShips]);

  return (
    <div className="mx-auto max-w-md p-4">
      {/* Welcome / user summary */}
      <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
          {authStatus === "offline" ? "Mode Offline" : "Dashboard"}
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">
          {user?.fullName ? `Halo, ${user.fullName.split(" ")[0]}` : "SmartPatrol"}
        </h1>
        {user && (
          <div className="mt-3 space-y-0.5">
            <p className="text-sm text-cyan-300/75">{user.email}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-500">
              Role: {user.role}
            </p>
          </div>
        )}
      </div>

      {/* Server time card */}
      <div className="mt-4 rounded-2xl border border-cyan-500/14 bg-cyan-950/20 p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
            <Clock className="h-3.5 w-3.5 text-cyan-400" /> Waktu Server
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
          >
            <RefreshCcw className="h-3 w-3" /> Refresh
          </button>
        </div>
        {timeStatus === "loading" && <p className="mt-2 text-sm text-cyan-300/75">Memuat…</p>}
        {timeStatus === "error" && (
          <p className="mt-2 text-sm text-rose-300">API tidak terjangkau: {error}</p>
        )}
        {timeStatus === "ok" && serverNow !== null && (
          <p className="mt-2 font-mono text-sm text-cyan-50">
            {iso}
            <span className="mt-0.5 block text-xs text-cyan-500">epoch {serverNow}</span>
          </p>
        )}
      </div>

      <div className="mt-4">
        <SosAlertsBanner />
      </div>

      {/* Start patrol — ship list */}
      <div className="mt-6">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
          Mulai Patroli
        </p>
        {ships.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cyan-900/50 p-4 text-center text-sm text-cyan-700">
            Belum ada kapal yang ditugaskan.
          </p>
        ) : (
          <div className="space-y-3">
            {ships.map((ship) => (
              <div key={ship.id} className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/30">
                    <Ship className="h-4.5 w-4.5 text-cyan-400" />
                  </span>
                  <p className="truncate text-sm font-bold text-white">{ship.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/patrol/${ship.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Patroli
                  </Link>
                  <Link
                    to={`/incidents/${ship.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-700 px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" /> Temuan
                  </Link>
                  <SosButton shipId={ship.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user?.role === "ADMIN" && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { to: "/ships", label: "Ships" },
            { to: "/admin/users", label: "Users" },
            { to: "/admin/registrations", label: "Registrations" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-xl border border-cyan-800/50 bg-[#0b1229] px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
