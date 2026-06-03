import { z } from "zod";

/**
 * Roles mirror the legacy Supabase RLS roles. Authorization is now enforced
 * explicitly in the Worker (see Phase 2 policy matrix).
 */
export const Role = z.enum(["ADMIN", "PIC", "PETUGAS"]);
export type Role = z.infer<typeof Role>;

/** UUID v4 identifier used for all primary keys. */
export const Id = z.string().uuid();
export type Id = z.infer<typeof Id>;

/** Epoch milliseconds (UTC). Trusted-time anchored on the server. */
export const EpochMs = z.number().int().nonnegative();
export type EpochMs = z.infer<typeof EpochMs>;

export const Email = z.string().trim().toLowerCase().email();
export type Email = z.infer<typeof Email>;

/** Audit timestamps carried by most entities. */
export const Timestamps = z.object({
  createdAt: EpochMs,
  updatedAt: EpochMs,
});
export type Timestamps = z.infer<typeof Timestamps>;

/** Standard pagination query. */
export const Pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof Pagination>;

/** Error envelope returned by the API on failure. */
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiError>;

/**
 * Wrap any payload schema in the standard success envelope:
 * `{ ok: true, data: T }`.
 */
export function apiSuccess<T extends z.ZodTypeAny>(data: T) {
  return z.object({ ok: z.literal(true), data });
}

/** Failure envelope: `{ ok: false, error: ApiError }`. */
export const ApiFailure = z.object({ ok: z.literal(false), error: ApiError });
export type ApiFailure = z.infer<typeof ApiFailure>;
