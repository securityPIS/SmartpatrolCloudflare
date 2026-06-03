import { useRef, useState } from "react";
import { Camera, Check, CircleOff } from "lucide-react";
import type { CheckpointVisitStatus, PatrolReport } from "@smartpatrol/contracts";
import { putImage } from "../lib/imageStore";
import { usePatrolStore } from "../model/patrolStore";
import { AsyncImage } from "./AsyncImage";

/**
 * Capture a checkpoint visit: photo (camera/file), optional note, and outcome.
 * Photos are stored locally (idb://) and uploaded later (Phase 6 R2 heal).
 */
export function PatrolCameraModal({
  report,
  onClose,
}: {
  report: PatrolReport;
  onClose: () => void;
}) {
  const saveVisit = usePatrolStore((s) => s.saveVisit);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>(report.media.map((m) => m.url));
  const [note, setNote] = useState(report.note ?? "");
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await putImage(file);
    setMediaUrls((prev) => [...prev, url]);
  }

  async function submit(status: CheckpointVisitStatus) {
    setBusy(true);
    try {
      await saveVisit({
        checkpointId: report.checkpointId,
        checkpointName: report.checkpointName,
        status,
        note: note.trim() || undefined,
        media: mediaUrls.map((url) => ({ url, capturedAt: Date.now() })),
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.8rem] border border-cyan-800/50 bg-[#0b1229] p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
          Kamera Patroli
        </p>
        <h2 className="mt-1 text-xl font-black text-white">{report.checkpointName}</h2>
        <p className="mb-4 mt-0.5 text-sm text-cyan-300/75">Ambil foto checkpoint ini</p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {mediaUrls.map((url) => (
            <AsyncImage
              key={url}
              src={url}
              alt="capture"
              className="aspect-square w-full rounded-xl border border-cyan-800/50 object-cover"
            />
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cyan-800/50 text-cyan-500 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />

        <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-cyan-500">
          Catatan
        </label>
        <textarea
          className="mb-4 w-full rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3.5 text-sm text-cyan-50 outline-none transition focus:border-cyan-400"
          rows={2}
          placeholder="Catatan (opsional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-cyan-700 py-2.5 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("SKIPPED")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 py-2.5 text-xs font-bold uppercase tracking-widest text-yellow-400 transition hover:bg-yellow-500/20 disabled:opacity-60"
          >
            <CircleOff className="h-3.5 w-3.5" /> Skip
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("DONE")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            {busy ? "Menyimpan…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
