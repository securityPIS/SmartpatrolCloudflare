import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthShell } from "../../../shared/ui/AuthShell";
import { authApi } from "../api/authApi";

type State = "verifying" | "ok" | "error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("verifying");

  useEffect(() => {
    const id = params.get("id");
    const token = params.get("token");
    if (!id || !token) {
      setState("error");
      return;
    }
    authApi
      .verifyEmail({ id, token })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [params]);

  return (
    <AuthShell title="Verifikasi Email" subtitle="SmartPatrol">
      {state === "verifying" && (
        <div className="rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3 text-xs font-medium text-cyan-300">
          <span className="animate-pulse">Memverifikasi...</span>
        </div>
      )}
      {state === "ok" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
          Email berhasil diverifikasi. Administrator akan meninjau dan menyetujui akun Anda.
        </div>
      )}
      {state === "error" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
          Tautan verifikasi ini tidak valid atau sudah kedaluwarsa.
        </div>
      )}
      <Link
        to="/login"
        className="mt-6 block w-full rounded-xl bg-cyan-600 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500"
      >
        Kembali ke Login
      </Link>
    </AuthShell>
  );
}
