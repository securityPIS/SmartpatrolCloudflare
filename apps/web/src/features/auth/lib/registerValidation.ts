import { isValidPhone } from "./phone";

export interface RegisterForm {
  photoUrl: string | null;
  name: string;
  type: string;
  workerNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export type RegisterFieldKey =
  | "photo"
  | "name"
  | "workerNumber"
  | "email"
  | "password"
  | "confirmPassword"
  | "phone";

export interface RegisterValidation {
  errors: Partial<Record<RegisterFieldKey, boolean>>;
  /** First user-facing error message, or null when the form is valid. */
  message: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the public onboarding form exactly like the original SmartPatrol
 * app (same field order, same messages). Pure — unit tested in isolation.
 */
export function validateRegister(form: RegisterForm): RegisterValidation {
  const errors: Partial<Record<RegisterFieldKey, boolean>> = {};

  if (!form.photoUrl) errors.photo = true;
  if (!form.name || !form.name.trim()) errors.name = true;
  if (!form.workerNumber || !form.workerNumber.trim()) errors.workerNumber = true;
  if (!form.email || !form.email.trim() || !EMAIL_RE.test(form.email)) errors.email = true;
  if (!form.password || form.password.length < 8) errors.password = true;
  if (!form.confirmPassword || form.confirmPassword !== form.password)
    errors.confirmPassword = true;
  if (!form.phone || !form.phone.trim() || !isValidPhone(form.phone)) errors.phone = true;

  let message: string | null = null;
  if (errors.photo) message = "Foto profil wajib diambil/diunggah.";
  else if (errors.name) message = "Nama lengkap wajib diisi.";
  else if (errors.workerNumber) message = "Nomor pekerja wajib diisi.";
  else if (errors.email) message = "Format email tidak valid (contoh: nama@domain.com).";
  else if (errors.password) message = "Password wajib diisi dan minimal 8 karakter.";
  else if (errors.confirmPassword) message = "Konfirmasi password tidak cocok.";
  else if (errors.phone)
    message = "Nomor telepon tidak valid (minimal 10 digit, auto format xxxx-xxxx-xxxx-xxxxx).";

  return { errors, message };
}
