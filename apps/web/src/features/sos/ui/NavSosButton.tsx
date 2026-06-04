import { useState } from "react";
import { Siren } from "lucide-react";
import { useAuthStore } from "../../auth/model/authStore";
import { SosConfirmModal } from "./SosConfirmModal";

/**
 * The round, centred SOS trigger embedded in the side- and bottom-navigation.
 * It raises an alert for the signed-in user's assigned ship; admins (who hold
 * no specific ship assignment) see it disabled.
 */
export function NavSosButton({ className = "" }: { className?: string }) {
  const shipId = useAuthStore((s) => s.user?.shipIds[0]);
  const [confirming, setConfirming] = useState(false);
  const disabled = !shipId;

  return (
    <>
      <button
        type="button"
        onClick={() => shipId && setConfirming(true)}
        disabled={disabled}
        title={disabled ? "Tidak ada kapal yang ditugaskan" : "Tombol Darurat SOS"}
        aria-label="Tombol Darurat SOS"
        className={`flex items-center justify-center bg-red-600 text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        style={
          disabled
            ? undefined
            : { boxShadow: "0 0 15px rgba(220,38,38,0.6), 0 0 30px rgba(220,38,38,0.4)" }
        }
      >
        <Siren className={`h-6 w-6 ${disabled ? "" : "animate-pulse"}`} />
      </button>

      {confirming && shipId && (
        <SosConfirmModal shipId={shipId} onClose={() => setConfirming(false)} />
      )}
    </>
  );
}
