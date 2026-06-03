import { useEffect } from "react";
import { useServerTimeStore } from "../model/serverTimeStore";

export function DashboardPage() {
  const { status, serverNow, iso, error, refresh } = useServerTimeStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
            SP
          </span>
          <div>
            <h1 className="text-lg font-semibold">SmartPatrol</h1>
            <p className="text-sm text-slate-500">Full Cloudflare • Phase 0</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Trusted server time</p>
          {status === "loading" && <p className="mt-1 text-slate-500">Loading…</p>}
          {status === "error" && (
            <p className="mt-1 text-sm text-red-600">API unreachable: {error}</p>
          )}
          {status === "ok" && serverNow !== null && (
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
      </div>
    </main>
  );
}
