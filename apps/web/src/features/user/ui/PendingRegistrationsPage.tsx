import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
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
      setErr(e instanceof Error ? e.message : "Aksi gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-cyan-50">{reg.fullName}</p>
          <p className="text-sm text-cyan-300/75">{reg.email}</p>
          {reg.requestedShipName && (
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cyan-600">
              Kapal diminta: {reg.requestedShipName}
            </p>
          )}
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cyan-600">
            Terdaftar: {new Date(reg.createdAt).toLocaleDateString()}
          </p>
          {err && <p className="mt-1 text-xs text-rose-300">{err}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => approve(reg.id))}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" /> Setujui
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => reject(reg.id))}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" /> Tolak
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
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-black text-white">Registrasi Tertunda</h1>
          <p className="text-[10px] uppercase tracking-widest text-cyan-600">
            {pending.length} menunggu tinjauan
          </p>
        </div>
      </div>

      {status === "loading" && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && pending.length === 0 && (
        <p className="text-sm text-cyan-600">Tidak ada registrasi tertunda.</p>
      )}
      <div className="space-y-3">
        {pending.map((r) => (
          <PendingRow key={r.id} reg={r} />
        ))}
      </div>
    </div>
  );
}
