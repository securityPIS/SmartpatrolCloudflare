import type { SavePatrolReportRequest } from "@smartpatrol/contracts";
import { OUTBOX_STORE, idbDelete, idbGetAll, idbPut } from "../../../shared/lib/idb";

export interface OutboxEntry {
  /** Deterministic key = natural key, so re-editing a checkpoint replaces the pending item. */
  key: string;
  payload: SavePatrolReportRequest;
  queuedAt: number;
}

export function outboxKey(
  req: Pick<SavePatrolReportRequest, "shiftKey" | "shipId" | "checkpointId">,
): string {
  return `${req.shiftKey}::${req.shipId}::${req.checkpointId}`;
}

export async function enqueue(payload: SavePatrolReportRequest): Promise<OutboxEntry> {
  const entry: OutboxEntry = { key: outboxKey(payload), payload, queuedAt: Date.now() };
  await idbPut(OUTBOX_STORE, entry.key, entry);
  return entry;
}

export function listOutbox(): Promise<OutboxEntry[]> {
  return idbGetAll<OutboxEntry>(OUTBOX_STORE);
}

export function dequeue(key: string): Promise<void> {
  return idbDelete(OUTBOX_STORE, key);
}
