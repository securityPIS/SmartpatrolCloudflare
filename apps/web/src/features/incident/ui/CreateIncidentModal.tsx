import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import type { IncidentSeverity } from "@smartpatrol/contracts";
import { useIncidentStore } from "../model/incidentStore";

interface CreateIncidentModalProps {
  shipId: string;
  onClose: () => void;
}

const LABEL = "mb-1.5 block pl-1 text-[10px] font-mono uppercase tracking-widest text-cyan-500";
const FIELD =
  "w-full rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3.5 text-sm text-cyan-50 outline-none transition-all focus:border-cyan-400";

export function CreateIncidentModal({ shipId, onClose }: CreateIncidentModalProps) {
  const create = useIncidentStore((s) => s.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await create({ shipId, title, description: description || undefined, severity, payload: {} });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat temuan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md scale-up-center rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-black text-white">Lapor Temuan</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className={LABEL}>
              Judul <span className="text-rose-400">*</span>
            </span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FIELD}
              placeholder="Judul singkat temuan"
            />
          </label>

          <label className="block">
            <span className={LABEL}>Deskripsi (opsional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={FIELD}
              rows={3}
              placeholder="Detail tambahan…"
            />
          </label>

          <label className="block">
            <span className={LABEL}>Tingkat</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className={`${FIELD} appearance-none`}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </label>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
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
              {submitting ? "Mengirim…" : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
