import { z } from "zod";
import { EpochMs, Id } from "./common";

/** One ship's checkpoint tally for the report day. */
export const DailyShipReport = z.object({
  shipId: Id,
  shipName: z.string(),
  total: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});
export type DailyShipReport = z.infer<typeof DailyShipReport>;

/**
 * Management "Daily Report" dashboard payload (ADMIN/PIC). Patrol figures are
 * scoped to a single day; the SOS and incident counts are live fleet figures.
 * Admins span every ship; a PIC is scoped to their assigned ships.
 */
export const DailyReport = z.object({
  /** Report day as a local `YYYY-MM-DD` (the requesting client's date). */
  date: z.string(),
  generatedAt: EpochMs,
  shipsTotal: z.number().int().nonnegative(),
  patrol: z.object({
    total: z.number().int().nonnegative(),
    done: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    completionPct: z.number().int().min(0).max(100),
  }),
  activeSos: z.number().int().nonnegative(),
  openIncidents: z.number().int().nonnegative(),
  perShip: z.array(DailyShipReport),
});
export type DailyReport = z.infer<typeof DailyReport>;
