import { useState } from "react";
import { Siren } from "lucide-react";
import { SosConfirmModal } from "./SosConfirmModal";

/**
 * The round, centred SOS trigger embedded in the side- and bottom-navigation.
 * It raises an alert for the given ship. Callers only mount it for users who
 * actually have an assigned ship (field officers); admins/PIC who hold no ship
 * assignment never see it.
 */
export function NavSosButton({ shipId, className = "" }: { shipId: string; className?: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title="Tombol Darurat SOS"
        aria-label="Tombol Darurat SOS"
        className={`flex items-center justify-center bg-red-600 text-white transition hover:bg-red-700 active:scale-95 ${className}`}
        style={{ boxShadow: "0 0 15px rgba(220,38,38,0.6), 0 0 30px rgba(220,38,38,0.4)" }}
      >
        <Siren className="h-6 w-6 animate-pulse" />
      </button>

      {confirming && <SosConfirmModal shipId={shipId} onClose={() => setConfirming(false)} />}
    </>
  );
}
