import { z } from "zod";
import { EpochMs, Id, Timestamps } from "./common";

export const SosStatus = z.enum(["ACTIVE", "ACKNOWLEDGED", "RESOLVED"]);
export type SosStatus = z.infer<typeof SosStatus>;

export const SosAlert = z
  .object({
    id: Id,
    shipId: Id,
    raisedBy: Id,
    status: SosStatus,
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    message: z.string().nullable(),
    resolvedAt: EpochMs.nullable(),
  })
  .merge(Timestamps);
export type SosAlert = z.infer<typeof SosAlert>;

export const SosAcknowledgement = z
  .object({
    id: Id,
    sosId: Id,
    acknowledgedBy: Id,
  })
  .merge(Timestamps);
export type SosAcknowledgement = z.infer<typeof SosAcknowledgement>;

export const RaiseSosRequest = z.object({
  shipId: Id,
  lat: z.number().optional(),
  lng: z.number().optional(),
  message: z.string().max(500).optional(),
});
export type RaiseSosRequest = z.infer<typeof RaiseSosRequest>;
