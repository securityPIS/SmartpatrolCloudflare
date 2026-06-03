import { useEffect, useState } from "react";
import type { Checkpoint, CreateShipRequest, Ship } from "@smartpatrol/contracts";
import { TextField } from "../../../shared/ui/TextField";
import { useShipStore } from "../model/shipStore";

function ShipRow({ ship, onDelete }: { ship: Ship; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
      <div>
        <p className="font-medium text-slate-800">{ship.name}</p>
        <p className="text-xs text-slate-400">
          {ship.customCheckpoints.length} checkpoint{ship.customCheckpoints.length !== 1 ? "s" : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(ship.id)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
      >
        Delete
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
      setError(err instanceof Error ? err.message : "Failed to create ship");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Add ship</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            id="shipName"
            label="Ship name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Checkpoints (one per line, optional)
            </span>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              rows={4}
              value={checkpointInput}
              onChange={(e) => setCheckpointInput(e.target.value)}
              placeholder="Deck A&#10;Engine Room&#10;Bridge"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create"}
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
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Ships</h1>
          <p className="text-sm text-slate-500">{ships.length} registered</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          + Add ship
        </button>
      </div>

      {status === "loading" && <p className="text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      {status === "ready" && ships.length === 0 && (
        <p className="text-sm text-slate-400">No ships yet. Add one to get started.</p>
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
    </main>
  );
}
