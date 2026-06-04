import { type ReactNode, useEffect } from "react";
import { Mail, Shield, Ship as ShipIcon, UserCircle2 } from "lucide-react";
import { useAuthStore } from "../../auth/model/authStore";
import { useShipStore } from "../../ship/model/shipStore";
import { PageHeader } from "../../../shared/ui/PageHeader";

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-cyan-900/40 py-3 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/30 text-cyan-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-500">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

/** Read-only view of the signed-in user's own profile ("Data Saya"). */
export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const ships = useShipStore((s) => s.ships);
  const loadShips = useShipStore((s) => s.load);

  useEffect(() => {
    void loadShips();
  }, [loadShips]);

  if (!user) return null;

  const shipNames =
    user.shipIds
      .map((id) => ships.find((s) => s.id === id)?.name)
      .filter((n): n is string => Boolean(n))
      .join(", ") || (user.role === "ADMIN" ? "Semua kapal" : "Belum ditugaskan");

  return (
    <div className="mx-auto max-w-md p-4">
      <PageHeader eyebrow="Akun" title="Data Saya" />

      <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-5">
        <Row
          icon={<UserCircle2 className="h-4 w-4" />}
          label="Nama Lengkap"
          value={user.fullName ?? "—"}
        />
        <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
        <Row icon={<Shield className="h-4 w-4" />} label="Role" value={user.role} />
        <Row icon={<ShipIcon className="h-4 w-4" />} label="Kapal" value={shipNames} />
      </div>

      <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        Perubahan data akun (role, penugasan kapal) dilakukan oleh admin.
      </p>
    </div>
  );
}
