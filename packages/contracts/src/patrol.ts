import { z } from "zod";
import { EpochMs, Id, Timestamps } from "./common";

export const CheckpointVisitStatus = z.enum(["PENDING", "DONE", "SKIPPED"]);
export type CheckpointVisitStatus = z.infer<typeof CheckpointVisitStatus>;

export const PatrolMedia = z.object({
  /** `idb://<localId>` before upload, `https://...` after R2 heal (Phase 6). */
  url: z.string(),
  thumbUrl: z.string().optional(),
  capturedAt: EpochMs.optional(),
});
export type PatrolMedia = z.infer<typeof PatrolMedia>;

/**
 * One checkpoint visit within a shift. Natural key:
 * (`shiftKey`, `shipId`, `checkpointId`) — upserted by `savePatrolReport`.
 */
export const PatrolReport = z
  .object({
    id: Id,
    shiftKey: z.string().min(1),
    shipId: Id,
    checkpointId: Id,
    checkpointName: z.string(),
    status: CheckpointVisitStatus,
    note: z.string().nullable(),
    media: z.array(PatrolMedia).default([]),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    reportedBy: Id,
    completedAt: EpochMs.nullable(),
    /** Tombstone: set when soft-deleted (anti-resurrection guard, Phase 4.2). */
    deletedAt: EpochMs.nullable(),
  })
  .merge(Timestamps);
export type PatrolReport = z.infer<typeof PatrolReport>;

export const SavePatrolReportRequest = z.object({
  shiftKey: z.string().min(1),
  shipId: Id,
  checkpointId: Id,
  checkpointName: z.string().min(1),
  status: CheckpointVisitStatus,
  note: z.string().optional(),
  media: z.array(PatrolMedia).default([]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  completedAt: EpochMs.optional(),
});
export type SavePatrolReportRequest = z.infer<typeof SavePatrolReportRequest>;

/**
 * Per-shift roll-up for the Laporan/History screen: one row per
 * (ship, shift) with checkpoint-status tallies. Built by aggregating
 * `patrol_reports`; admins see every ship, others only their own.
 */
export const ShiftSummary = z.object({
  shipId: Id,
  shiftKey: z.string().min(1),
  total: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  lastActivityAt: EpochMs.nullable(),
});
export type ShiftSummary = z.infer<typeof ShiftSummary>;
