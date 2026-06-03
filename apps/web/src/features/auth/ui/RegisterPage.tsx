import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "../../../shared/ui/AuthShell";
import { TextField } from "../../../shared/ui/TextField";
import { useAuthStore } from "../model/authStore";

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shipName, setShipName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const message = await register({
        fullName,
        email,
        password,
        shipName: shipName.trim() || undefined,
      });
      setDone(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Registration received" subtitle="SmartPatrol">
        <p className="text-sm text-slate-600">{done}</p>
        <Link
          to="/login"
          className="mt-6 block w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-brand-700"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="SmartPatrol">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          id="fullName"
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          id="shipName"
          label="Ship (optional)"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Register"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
