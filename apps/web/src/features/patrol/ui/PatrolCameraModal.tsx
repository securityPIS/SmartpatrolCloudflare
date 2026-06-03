import { useRef, useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold">{report.checkpointName}</h2>
        <p className="mb-4 text-sm text-slate-500">Capture this checkpoint</p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {mediaUrls.map((url) => (
            <AsyncImage
              key={url}
              src={url}
              alt="capture"
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-brand-400 hover:text-brand-500"
          >
            +
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

        <textarea
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          rows={2}
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("SKIPPED")}
            className="flex-1 rounded-xl border border-amber-300 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("DONE")}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
