import { z } from "zod";
import { Id, Timestamps } from "./common";

export const NotificationKind = z.enum([
  "CHECKPOINT_PENDING",
  "SHIFT_WRAP_UP",
  "INCIDENT",
  "SOS",
  "SYSTEM",
]);
export type NotificationKind = z.infer<typeof NotificationKind>;

export const Notification = z
  .object({
    id: Id,
    userId: Id,
    kind: NotificationKind,
    title: z.string(),
    body: z.string().nullable(),
    data: z.record(z.unknown()).default({}),
    readAt: z.number().int().nullable(),
  })
  .merge(Timestamps);
export type Notification = z.infer<typeof Notification>;

/** Web client registers its Firebase FCM token here (Phase 8.2). */
export const RegisterPushTokenRequest = z.object({
  token: z.string().min(1),
  platform: z.enum(["web", "android"]).default("web"),
});
export type RegisterPushTokenRequest = z.infer<typeof RegisterPushTokenRequest>;
