import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Users } from "lucide-react";
import type { Role, UserDto } from "@smartpatrol/contracts";
import { useUserStore } from "../model/userStore";
import { useShipStore } from "../../ship/model/shipStore";

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  PIC: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PETUGAS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

function UserRow({ user }: { user: UserDto }) {
  const updateUser = useUserStore((s) => s.updateUser);
  const ships = useShipStore((s) => s.ships);
  const [saving, setSaving] = useState(false);

  async function toggleEnabled() {
    setSaving(true);
    try {
      await updateUser(user.id, { enabled: !user.enabled });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-800/50 bg-[#0b1229] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-cyan-50">{user.fullName ?? "(tanpa nama)"}</p>
            <span
              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${ROLE_BADGE[user.role]}`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-sm text-cyan-300/75">{user.email}</p>
          {user.shipIds.length > 0 && (
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cyan-600">
              Kapal:{" "}
              {user.shipIds.map((id) => ships.find((s) => s.id === id)?.name ?? id).join(", ")}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={toggleEnabled}
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition disabled:opacity-60 ${
            user.enabled
              ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          {user.enabled ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}

export function UserListPage() {
  const { users, status, error, loadUsers } = useUserStore();
  const loadShips = useShipStore((s) => s.load);

  useEffect(() => {
    void loadUsers();
    void loadShips();
  }, [loadUsers, loadShips]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-400" />
          <div>
            <h1 className="text-xl font-black text-white">Pengguna</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-600">
              {users.length} akun
            </p>
          </div>
        </div>
        <Link
          to="/admin/registrations"
          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
        >
          <Bell className="h-4 w-4" /> Registrasi
        </Link>
      </div>

      {status === "loading" && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && users.length === 0 && (
        <p className="text-sm text-cyan-600">Belum ada pengguna.</p>
      )}
      <div className="space-y-3">
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </div>
    </div>
  );
}
