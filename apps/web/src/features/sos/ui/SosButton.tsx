import { useState } from "react";
import { Siren } from "lucide-react";
import { SosConfirmModal } from "./SosConfirmModal";

interface SosButtonProps {
  shipId: string;
}

/** Inline danger pill used on the dashboard ship cards. */
export function SosButton({ shipId }: SosButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

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
        onClick={() => setConfirming(true)}
        title="Tombol Darurat SOS"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-95"
        style={{ boxShadow: "0 0 15px rgba(220,38,38,0.6), 0 0 30px rgba(220,38,38,0.4)" }}
      >
        <Siren className="h-4 w-4 animate-pulse" /> SOS
      </button>

      {confirming && (
        <SosConfirmModal
          shipId={shipId}
          onClose={() => setConfirming(false)}
          onSent={() => {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
          }}
        />
      )}
    </>
  );
}
