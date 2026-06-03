import { useState } from "react";
import { Siren } from "lucide-react";
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
      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
        <Siren className="h-4 w-4" /> SOS Terkirim
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={busy}
        title="Tombol Darurat SOS"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
        style={{ boxShadow: "0 0 15px rgba(220,38,38,0.6), 0 0 30px rgba(220,38,38,0.4)" }}
      >
        <Siren className="h-4 w-4 animate-pulse" /> SOS
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm scale-up-center overflow-hidden rounded-2xl border border-red-500/30 bg-[#0b1229] p-6 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-red-500" />
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <Siren className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">
                Konfirmasi SOS
              </h2>
              <p className="text-sm leading-relaxed text-cyan-300/80">
                Peringatan: ini akan mengaktifkan{" "}
                <strong className="text-rose-300">
                  alarm sirine di seluruh perangkat terhubung
                </strong>
                . Hanya gunakan dalam keadaan darurat sesungguhnya!
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-red-500/30 bg-[#070b19] px-3 py-2 text-sm text-cyan-50 outline-none transition focus:border-red-400"
                rows={2}
                placeholder="Pesan darurat (opsional)…"
                disabled={busy}
              />

              {error && (
                <p className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex w-full gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-cyan-700 py-3 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <Siren className="h-4 w-4" /> {busy ? "Mengirim…" : "Kirim SOS"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
