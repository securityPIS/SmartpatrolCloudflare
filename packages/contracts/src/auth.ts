import { z } from "zod";
import { Email, EpochMs, Id, Role } from "./common";
import { PendingRegistrationStatus } from "./profile";

export const Password = z.string().min(8).max(128);

export const LoginRequest = z.object({
  email: Email,
  password: Password,
});
export type LoginRequest = z.infer<typeof LoginRequest>;

/** A small, downscaled JPEG/PNG/WebP data URL (the onboarding selfie). */
export const PhotoDataUrl = z
  .string()
  .regex(/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid image data URL")
  .max(400_000, "Photo too large");

export const RegisterRequest = z.object({
  email: Email,
  password: Password,
  fullName: z.string().trim().min(1).max(120),
  shipName: z.string().trim().min(1).max(120).optional(),
  /** Instansi/affiliation chosen on the public onboarding form. */
  instansi: z.string().trim().max(60).optional(),
  /** Employee / worker number. */
  workerNumber: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(40).optional(),
  /** Onboarding selfie, stored for admin review. */
  photoUrl: PhotoDataUrl.optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

/** Public user DTO — never includes the password hash. */
export const UserDto = z.object({
  id: Id,
  email: Email,
  fullName: z.string().nullable(),
  role: Role,
  enabled: z.boolean(),
  shipIds: z.array(Id),
});
export type UserDto = z.infer<typeof UserDto>;

/** JWT access-token claims. */
export const JwtPayload = z.object({
  sub: Id,
  role: Role,
  /** Ships the subject may access (empty for ADMIN = all). */
  shipIds: z.array(Id),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type JwtPayload = z.infer<typeof JwtPayload>;

export const AuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  /** Access-token expiry (epoch ms). */
  expiresAt: EpochMs,
});
export type AuthTokens = z.infer<typeof AuthTokens>;

export const AuthResponse = z.object({
  user: UserDto,
  tokens: AuthTokens,
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const RefreshRequest = z.object({
  refreshToken: z.string(),
});
export type RefreshRequest = z.infer<typeof RefreshRequest>;

export const LogoutRequest = RefreshRequest;
export type LogoutRequest = z.infer<typeof LogoutRequest>;

/** Registration goes to a pending queue awaiting admin approval (Phase 3). */
export const RegisterResponse = z.object({
  status: PendingRegistrationStatus,
  message: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const VerifyEmailRequest = z.object({
  id: Id,
  token: z.string().min(1),
});
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequest>;
