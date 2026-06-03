import { z } from "zod";
import { Id, Timestamps } from "./common";

/**
 * Checkpoints are stored as JSON on the ship (`custom_checkpoints`). The cron
 * jobs (Phase 8) read THIS list, never a separate `ship_checkpoints` table.
 */
export const Checkpoint = z.object({
  id: Id,
  name: z.string().trim().min(1),
  /** Optional normalized order index for display. */
  order: z.number().int().nonnegative().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type Checkpoint = z.infer<typeof Checkpoint>;

export const Ship = z
  .object({
    id: Id,
    name: z.string().trim().min(1).max(120),
    customCheckpoints: z.array(Checkpoint).default([]),
  })
  .merge(Timestamps);
export type Ship = z.infer<typeof Ship>;

export const CreateShipRequest = z.object({
  name: z.string().trim().min(1).max(120),
  customCheckpoints: z.array(Checkpoint).default([]),
});
export type CreateShipRequest = z.infer<typeof CreateShipRequest>;

export const UpdateShipRequest = CreateShipRequest.partial();
export type UpdateShipRequest = z.infer<typeof UpdateShipRequest>;
