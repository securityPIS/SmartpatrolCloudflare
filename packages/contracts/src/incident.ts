import { z } from "zod";
import { Id, Timestamps } from "./common";

export const IncidentSeverity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type IncidentSeverity = z.infer<typeof IncidentSeverity>;

export const IncidentStatus = z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED"]);
export type IncidentStatus = z.infer<typeof IncidentStatus>;

export const Incident = z
  .object({
    id: Id,
    shipId: Id,
    title: z.string().min(1),
    description: z.string().nullable(),
    severity: IncidentSeverity,
    status: IncidentStatus,
    /** Free-form JSON payload (media refs, geo, extra fields). */
    payload: z.record(z.unknown()).default({}),
    reportedBy: Id,
  })
  .merge(Timestamps);
export type Incident = z.infer<typeof Incident>;

export const CreateIncidentRequest = z.object({
  shipId: Id,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: IncidentSeverity.default("MEDIUM"),
  payload: z.record(z.unknown()).default({}),
});
export type CreateIncidentRequest = z.infer<typeof CreateIncidentRequest>;

export const UpdateIncidentRequest = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  severity: IncidentSeverity.optional(),
  status: IncidentStatus.optional(),
  payload: z.record(z.unknown()).optional(),
});
export type UpdateIncidentRequest = z.infer<typeof UpdateIncidentRequest>;
