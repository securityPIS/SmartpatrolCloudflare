import { z } from "zod";
import { Email, Id, Role, Timestamps } from "./common";

export const Profile = z
  .object({
    id: Id,
    email: Email,
    fullName: z.string().nullable(),
    role: Role,
    enabled: z.boolean(),
    shipIds: z.array(Id),
  })
  .merge(Timestamps);
export type Profile = z.infer<typeof Profile>;

/** Admin: update a profile's role / enabled flag / ship assignment. */
export const UpdateProfileRequest = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  role: Role.optional(),
  enabled: z.boolean().optional(),
  shipIds: z.array(Id).optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>;

export const PendingRegistrationStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type PendingRegistrationStatus = z.infer<typeof PendingRegistrationStatus>;

export const PendingRegistration = z
  .object({
    id: Id,
    email: Email,
    fullName: z.string(),
    requestedShipName: z.string().nullable(),
    status: PendingRegistrationStatus,
  })
  .merge(Timestamps);
export type PendingRegistration = z.infer<typeof PendingRegistration>;
