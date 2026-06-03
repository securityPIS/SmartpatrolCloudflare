import { useEffect, useState } from "react";
import type { PendingRegistration } from "@smartpatrol/contracts";
import { useUserStore } from "../model/userStore";

function PendingRow({ reg }: { reg: PendingRegistration }) {
  const approve = useUserStore((s) => s.approve);
  const reject = useUserStore((s) => s.reject);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-800">{reg.fullName}</p>
          <p className="text-sm text-slate-500">{reg.email}</p>
          {reg.requestedShipName && (
            <p className="mt-0.5 text-xs text-slate-400">Requested ship: {reg.requestedShipName}</p>
          )}
          <p className="mt-0.5 text-xs text-slate-400">
            Registered: {new Date(reg.createdAt).toLocaleDateString()}
          </p>
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => approve(reg.id))}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => reject(reg.id))}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export function PendingRegistrationsPage() {
  const { pending, status, error, loadPending } = useUserStore();

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Pending Registrations</h1>
        <p className="text-sm text-slate-500">{pending.length} awaiting review</p>
      </div>

      {status === "loading" && <p className="text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      {status === "ready" && pending.length === 0 && (
        <p className="text-sm text-slate-400">No pending registrations.</p>
      )}
      <div className="space-y-3">
        {pending.map((r) => (
          <PendingRow key={r.id} reg={r} />
        ))}
      </div>
    </main>
  );
}
