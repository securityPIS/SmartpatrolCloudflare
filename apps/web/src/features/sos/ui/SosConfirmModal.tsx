import { useState } from "react";
import { Siren } from "lucide-react";
import { useSosStore } from "../model/sosStore";
import { playAlertBeep } from "../lib/sosAudio";
import { getGeolocation } from "../lib/geo";

interface SosConfirmModalProps {
  shipId: string;
  onClose: () => void;
  /** Fired after a successful raise (before the modal closes). */
  onSent?: () => void;
}

/**
 * The emergency-confirmation dialog shared by every SOS trigger (dashboard pill
 * and the floating nav button). Owns the raise → beep → geolocation flow so the
 * behaviour stays identical wherever SOS is launched from.
 */
export function SosConfirmModal({ shipId, onClose, onSent }: SosConfirmModalProps) {
  const raise = useSosStore((s) => s.raise);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onSent?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim SOS");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="scale-up-center relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/30 bg-[#0b1229] p-6 shadow-2xl">
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
            <strong className="text-rose-300">alarm sirine di seluruh perangkat terhubung</strong>.
            Hanya gunakan dalam keadaan darurat sesungguhnya!
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
              onClick={onClose}
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
  );
}
