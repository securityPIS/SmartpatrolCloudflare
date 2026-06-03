import { useEffect, useState } from "react";
import { Anchor, Plus, Trash2 } from "lucide-react";
import type { Checkpoint, CreateShipRequest, Ship } from "@smartpatrol/contracts";
import { TextField } from "../../../shared/ui/TextField";
import { useShipStore } from "../model/shipStore";

function ShipRow({ ship, onDelete }: { ship: Ship; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className="flex items-center gap-3">
        <Anchor className="h-5 w-5 text-cyan-400" />
        <div>
          <p className="font-bold text-cyan-50">{ship.name}</p>
          <p className="text-[10px] uppercase tracking-widest text-cyan-600">
            {ship.customCheckpoints.length} checkpoint
            {ship.customCheckpoints.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(ship.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/10"
      >
        <Trash2 className="h-3.5 w-3.5" /> Hapus
      </button>
    </div>
  );
}

function AddShipModal({ onClose }: { onClose: () => void }) {
  const create = useShipStore((s) => s.create);
  const [name, setName] = useState("");
  const [checkpointInput, setCheckpointInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const checkpoints: Checkpoint[] = checkpointInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((n, i) => ({
        id: crypto.randomUUID(),
        name: n,
        order: i,
      }));
    try {
      const input: CreateShipRequest = { name, customCheckpoints: checkpoints };
      await create(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kapal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md scale-up-center rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-black text-white">Tambah Kapal</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            id="shipName"
            label="Nama kapal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block">
            <span className="mb-1.5 block pl-1 text-[10px] font-mono uppercase tracking-widest text-cyan-500">
              Checkpoint (satu per baris, opsional)
            </span>
            <textarea
              className="w-full rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3.5 text-sm text-cyan-50 outline-none transition-all focus:border-cyan-400"
              rows={4}
              value={checkpointInput}
              onChange={(e) => setCheckpointInput(e.target.value)}
              placeholder="Deck A&#10;Engine Room&#10;Bridge"
            />
          </label>
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-cyan-700 py-3 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-cyan-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {submitting ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ShipListPage() {
  const { ships, status, error, load, remove } = useShipStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Anchor className="h-6 w-6 text-cyan-400" />
          <div>
            <h1 className="text-xl font-black text-white">Armada</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-600">
              {ships.length} terdaftar
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500"
        >
          <Plus className="h-4 w-4" /> Kapal
        </button>
      </div>

      {status === "loading" && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && ships.length === 0 && (
        <p className="text-sm text-cyan-600">Belum ada kapal. Tambahkan untuk memulai.</p>
      )}
      <div className="space-y-3">
        {ships.map((s) => (
          <ShipRow key={s.id} ship={s} onDelete={(id) => void remove(id)} />
        ))}
      </div>

      {showAdd && (
        <AddShipModal
          onClose={() => {
            setShowAdd(false);
            void load();
          }}
        />
      )}
    </div>
  );
}
