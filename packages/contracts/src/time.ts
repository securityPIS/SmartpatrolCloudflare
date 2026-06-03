import { z } from "zod";
import { EpochMs } from "./common";

/**
 * Trusted time anchor returned by `GET /server-time`. The client uses this to
 * correct local clock drift and keep a monotonic offline clock (Phase 9.1).
 */
export const ServerTimeResponse = z.object({
  /** Server time in epoch milliseconds (UTC). */
  now: EpochMs,
  /** ISO-8601 representation of `now`, for humans/logging. */
  iso: z.string().datetime(),
});
export type ServerTimeResponse = z.infer<typeof ServerTimeResponse>;
