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
    <AuthShell title="Email verification" subtitle="SmartPatrol">
      {state === "verifying" && <p className="text-sm text-slate-500">Verifying…</p>}
      {state === "ok" && (
        <p className="text-sm text-slate-600">
          Email verified. An administrator will review and approve your account.
        </p>
      )}
      {state === "error" && (
        <p className="text-sm text-red-600">This verification link is invalid or has expired.</p>
      )}
      <Link
        to="/login"
        className="mt-6 block w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-brand-700"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}
