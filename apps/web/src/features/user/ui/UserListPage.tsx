import { useEffect, useState } from "react";
import type { UserDto } from "@smartpatrol/contracts";
import { useUserStore } from "../model/userStore";
import { useShipStore } from "../../ship/model/shipStore";

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
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-slate-800">{user.fullName ?? "(no name)"}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="mt-0.5 text-xs text-slate-400">Role: {user.role}</p>
          {user.shipIds.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-400">
              Ships:{" "}
              {user.shipIds.map((id) => ships.find((s) => s.id === id)?.name ?? id).join(", ")}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={toggleEnabled}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
            user.enabled
              ? "border border-red-200 text-red-600 hover:bg-red-50"
              : "border border-green-200 text-green-600 hover:bg-green-50"
          }`}
        >
          {user.enabled ? "Disable" : "Enable"}
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
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">{users.length} accounts</p>
      </div>

      {status === "loading" && <p className="text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      {status === "ready" && users.length === 0 && (
        <p className="text-sm text-slate-400">No users yet.</p>
      )}
      <div className="space-y-3">
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </div>
    </main>
  );
}
