import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "../../../shared/ui/AuthShell";
import { TextField } from "../../../shared/ui/TextField";
import { useAuthStore } from "../model/authStore";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const status = useAuthStore((s) => s.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const submitting = status === "authenticating";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch {
      /* error is rendered from the store */
    }
  }

  return (
    <AuthShell title="Akses Sistem" subtitle="Aplikasi Pintar Untuk membantu Petugas Patroli">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <TextField
          id="email"
          label="Alamat Email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="********"
            className="pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-cyan-600 transition-colors hover:text-cyan-400"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-cyan-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500 disabled:opacity-50"
        >
          {submitting ? "Memproses..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-cyan-500">
        Belum punya akun?{" "}
        <Link to="/register" className="font-bold text-cyan-300 hover:text-cyan-200">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}
