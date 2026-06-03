import { useState } from "react";
import { useSosStore } from "../model/sosStore";

interface SosButtonProps {
  shipId: string;
}

function playAlertBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Autoplay policy or AudioContext unavailable — silently ignore
  }
}

function getGeolocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 },
    );
  });
}

export function SosButton({ shipId }: SosButtonProps) {
  const raise = useSosStore((s) => s.raise);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleOpen() {
    setConfirming(true);
    setMessage("");
    setError(null);
  }

  function handleCancel() {
    setConfirming(false);
    setMessage("");
    setError(null);
  }

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      const geo = await getGeolocation();
      await raise({
        shipId,
        lat: geo?.lat,
        lng: geo?.lng,
        message: message.trim() || undefined,
      });
      playAlertBeep();
      setConfirming(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to raise SOS");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
        SOS raised
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
      >
        SOS
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <h2 className="text-lg font-semibold text-slate-900">Emergency SOS</h2>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Are you sure you want to raise an emergency alert?
            </p>

            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Message <span className="text-slate-400">(optional)</span>
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                rows={3}
                placeholder="Describe the emergency…"
                disabled={busy}
              />
            </label>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={busy}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Raise SOS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
