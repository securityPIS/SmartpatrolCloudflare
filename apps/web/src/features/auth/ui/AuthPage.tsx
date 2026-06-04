import { type FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff, Shield, Ship } from "lucide-react";
import { useAuthStore } from "../model/authStore";
import { formatPhone } from "../lib/phone";
import { fileToDownscaledDataUrl } from "../lib/image";
import {
  type RegisterFieldKey,
  type RegisterForm,
  validateRegister,
} from "../lib/registerValidation";

type Mode = "login" | "register";

const INSTANSI_OPTIONS = ["BUJP", "TNI", "POLRI", "INTERNAL", "Kru Kapal"];

const EMPTY_FORM: RegisterForm = {
  photoUrl: null,
  name: "",
  type: "BUJP",
  workerNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

const LABEL = "mb-1.5 block pl-1 font-mono text-[10px] uppercase tracking-widest text-cyan-500";

/**
 * Combined Login / Register screen — a single tabbed page, matching the
 * original SmartPatrol onboarding. Login authenticates via the auth store;
 * Register submits a public application (pending admin approval).
 */
export function AuthPage() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [invalid, setInvalid] = useState<Partial<Record<RegisterFieldKey, boolean>>>({});

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setInvalid({});
  }

  function setField<K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in invalid) setInvalid((i) => ({ ...i, [field]: false }));
  }

  function inputClass(field: RegisterFieldKey): string {
    const base =
      "w-full rounded-xl bg-[#0b1229] p-3.5 text-sm text-cyan-50 shadow-sm outline-none transition-all";
    if (mode === "register" && invalid[field]) {
      return `${base} border border-rose-500 bg-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.25)]`;
    }
    return `${base} border border-cyan-800/50 focus:border-cyan-400`;
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      setForm((f) => ({ ...f, photoUrl: dataUrl }));
      setInvalid((i) => ({ ...i, photo: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses foto");
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const { errors, message } = validateRegister(form);
    setInvalid(errors);
    if (message) {
      setError(message);
      return;
    }
    setBusy(true);
    try {
      const msg = await register({
        email: form.email.trim(),
        password: form.password,
        fullName: form.name.trim(),
        instansi: form.type,
        workerNumber: form.workerNumber.trim(),
        phone: form.phone.trim(),
        photoUrl: form.photoUrl ?? undefined,
      });
      setNotice(msg);
      setForm(EMPTY_FORM);
      setInvalid({});
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#070b19] text-cyan-50 sm:mx-auto sm:max-w-md sm:border-x sm:border-cyan-900/50 sm:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.08),_transparent_35%)]" />
      <div
        className={`relative flex min-h-screen flex-col px-5 py-8 ${
          mode === "register" ? "justify-start" : "justify-center"
        }`}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <Shield className="absolute h-16 w-16 stroke-[1.5] text-cyan-300 opacity-20" />
            <Shield className="absolute h-16 w-16 stroke-1 text-cyan-300" />
            <Ship className="relative z-10 h-8 w-8 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-500">
              SMARTPATROL BY ANTISLEK
            </p>
            <h1 className="mt-1 text-3xl font-black leading-none text-white">Akses Sistem</h1>
            <p className="mt-2 text-sm leading-relaxed text-cyan-500">
              Aplikasi Pintar Untuk membantu Petugas Patroli
            </p>
          </div>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={mode === "login" ? onLogin : onRegister} className="space-y-3.5">
          <div className="flex rounded-xl border border-cyan-800/50 bg-[#0b1229] p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                  mode === m
                    ? "border border-cyan-500/30 bg-cyan-600/20 text-cyan-300"
                    : "text-cyan-700 hover:text-cyan-500"
                }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <>
              <div className="mb-2 flex flex-col items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={onPhotoSelected}
                />
                {!form.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed shadow-sm transition-colors ${
                      invalid.photo
                        ? "border-rose-500 bg-rose-500/5 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
                        : "border-cyan-500/50 bg-[#070b19] text-cyan-500 hover:border-cyan-400 hover:text-cyan-300"
                    }`}
                  >
                    <Camera className="mb-1 h-6 w-6" />
                    <span className="text-[9px] font-bold">FOTO</span>
                  </button>
                ) : (
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-cyan-500 shadow-md">
                    <img
                      src={form.photoUrl}
                      alt="Foto profil registrasi"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, photoUrl: null }))}
                      className="absolute inset-x-0 bottom-0 bg-rose-500/90 py-1 text-[9px] font-bold text-white transition-colors hover:bg-rose-600"
                    >
                      HAPUS
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className={LABEL}>Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className={inputClass("name")}
                />
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Registrasi publik hanya membuat akun dan profil onboarding terbatas. Role,
                assignment, dan akses operasional akan ditentukan admin setelah approval.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Instansi</label>
                  <select
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3.5 text-sm text-cyan-50 shadow-sm outline-none focus:border-cyan-400"
                  >
                    {INSTANSI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Nomor Pekerja</label>
                  <input
                    type="text"
                    value={form.workerNumber}
                    onChange={(e) => setField("workerNumber", e.target.value)}
                    placeholder="Contoh: PKJ-001245"
                    className={inputClass("workerNumber")}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={LABEL}>Alamat Email</label>
            <input
              type="email"
              autoComplete="email"
              value={mode === "login" ? email : form.email}
              onChange={(e) =>
                mode === "login" ? setEmail(e.target.value) : setField("email", e.target.value)
              }
              placeholder="nama@domain.com"
              className={inputClass("email")}
            />
          </div>

          <div className="relative">
            <label className={LABEL}>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={mode === "login" ? password : form.password}
              onChange={(e) =>
                mode === "login"
                  ? setPassword(e.target.value)
                  : setField("password", e.target.value)
              }
              placeholder="********"
              className={`${inputClass("password")} pr-12`}
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

          {mode === "register" && (
            <>
              <div>
                <label className={LABEL}>Konfirmasi Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  placeholder="********"
                  className={inputClass("confirmPassword")}
                />
              </div>
              <div>
                <label className={LABEL}>No Telpon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", formatPhone(e.target.value))}
                  placeholder="0812-xxxx-xxxx-xxxxx"
                  className={inputClass("phone")}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500 disabled:opacity-50"
          >
            {busy ? (
              <span className="animate-pulse">Memproses...</span>
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Kirim Registrasi"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-cyan-700">SmartPatrol By HSSE - Security III</p>
          <p className="text-[10px] text-cyan-700">PT Pertamina Patra Niaga</p>
        </div>
      </div>
    </main>
  );
}
