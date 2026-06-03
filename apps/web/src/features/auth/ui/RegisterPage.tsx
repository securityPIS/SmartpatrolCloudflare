import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "../../../shared/ui/AuthShell";
import { TextField } from "../../../shared/ui/TextField";
import { useAuthStore } from "../model/authStore";

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shipName, setShipName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <AuthShell title="Registrasi Diterima" subtitle="SmartPatrol">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
          {done}
        </div>
        <Link
          to="/login"
          className="mt-6 block w-full rounded-xl bg-cyan-600 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500"
        >
          Kembali ke Login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Buat Akun" subtitle="Registrasi publik SmartPatrol">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Registrasi publik hanya membuat akun dan profil onboarding terbatas. Role, assignment, dan
          akses operasional akan ditentukan admin setelah approval.
        </div>
        <TextField
          id="fullName"
          label="Nama Lengkap"
          required
          placeholder="Masukkan nama lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
            autoComplete="new-password"
            minLength={8}
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
        <TextField
          id="shipName"
          label="Kapal (opsional)"
          placeholder="Nama kapal"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
        />
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
          {submitting ? "Memproses..." : "Kirim Registrasi"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-cyan-500">
        Sudah terdaftar?{" "}
        <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
