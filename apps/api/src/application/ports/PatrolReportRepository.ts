import type { CheckpointVisitStatus, PatrolMedia } from "@smartpatrol/contracts";

export interface PatrolReportRecord {
  id: string;
  shiftKey: string;
  shipId: string;
  checkpointId: string;
  checkpointName: string;
  status: CheckpointVisitStatus;
  note: string | null;
  media: PatrolMedia[];
  lat: number | null;
  lng: number | null;
  reportedBy: string;
  completedAt: number | null;
  /** Tombstone — set when soft-deleted (anti-resurrection guard). */
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type NewPatrolReport = PatrolReportRecord;

/** Aggregated checkpoint tallies for one (ship, shift). */
export interface ShiftSummaryRow {
  shipId: string;
  shiftKey: string;
  total: number;
  done: number;
  skipped: number;
  pending: number;
  lastActivityAt: number | null;
}

export interface ShiftSummaryFilter {
  /** Restrict to these ships. Omit for every ship (admin); empty ⇒ no rows. */
  shipIds?: string[];
  /** Restrict to shifts whose key starts with this `YYYY-MM-DD` date. */
  shiftDatePrefix?: string;
  /** Max (ship, shift) rows, most recent first. */
  limit?: number;
}

export interface PatrolReportRepository {
  /** Lookup by the natural key (shiftKey, shipId, checkpointId), including tombstoned rows. */
  findByNaturalKey(
    shiftKey: string,
    shipId: string,
    checkpointId: string,
  ): Promise<PatrolReportRecord | null>;
  findById(id: string): Promise<PatrolReportRecord | null>;
  /** All live (non-tombstoned) reports for a ship's shift. */
  listByShipAndShift(shipId: string, shiftKey: string): Promise<PatrolReportRecord[]>;
  /** Per-(ship, shift) checkpoint tallies, most recent first (Laporan/History). */
  listShiftSummaries(filter?: ShiftSummaryFilter): Promise<ShiftSummaryRow[]>;
  /** Insert-or-update on the natural key. */
  upsert(report: NewPatrolReport): Promise<void>;
  /** Set the tombstone (soft delete). */
  softDelete(id: string, deletedAt: number): Promise<void>;
}
