import { create } from "zustand";
import type {
  CheckpointVisitStatus,
  PatrolReport,
  SavePatrolReportRequest,
} from "@smartpatrol/contracts";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../auth/model/authStore";
import { patrolApi } from "../api/patrolApi";
import { dequeue, enqueue, listOutbox, outboxKey } from "../lib/outbox";

interface PatrolState {
  shipId: string | null;
  shiftKey: string | null;
  /** Server + optimistic snapshot, keyed by checkpointId. */
  reports: Record<string, PatrolReport>;
  /** Outbox keys still awaiting flush. */
  pendingKeys: string[];
  status: "idle" | "loading" | "ready" | "offline" | "error";
  error: string | null;

  load: (shipId: string, shiftKey: string) => Promise<void>;
  saveVisit: (input: {
    checkpointId: string;
    checkpointName: string;
    status: CheckpointVisitStatus;
    note?: string;
    media?: SavePatrolReportRequest["media"];
    lat?: number;
    lng?: number;
  }) => Promise<void>;
  flush: () => Promise<void>;
}

function isNetworkError(err: unknown): boolean {
  // A real 4xx/5xx is an ApiError with status; anything else (fetch TypeError) is a network blip.
  return !(err instanceof ApiError) || err.status === 0;
}

export const usePatrolStore = create<PatrolState>((set, get) => ({
  shipId: null,
  shiftKey: null,
  reports: {},
  pendingKeys: [],
  status: "idle",
  error: null,

  load: async (shipId, shiftKey) => {
    set({ shipId, shiftKey, status: "loading", error: null });
    try {
      // Finalize reconstructs the full snapshot (placeholders for un-visited checkpoints).
      const list = await useAuthStore
        .getState()
        .authedRequest((at) => patrolApi.finalize(at, shipId, shiftKey));
      const reports: Record<string, PatrolReport> = {};
      for (const r of list) reports[r.checkpointId] = r;
      set({ reports, status: "ready" });
      await get().flush();
    } catch (err) {
      if (isNetworkError(err)) {
        // Offline: surface whatever is queued so the user can keep working.
        set({ status: "offline" });
      } else {
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to load patrol",
        });
      }
    }
  },

  saveVisit: async (input) => {
    const { shipId, shiftKey } = get();
    if (!shipId || !shiftKey) return;

    const payload: SavePatrolReportRequest = {
      shiftKey,
      shipId,
      checkpointId: input.checkpointId,
      checkpointName: input.checkpointName,
      status: input.status,
      note: input.note,
      media: input.media ?? [],
      lat: input.lat,
      lng: input.lng,
      completedAt: input.status === "DONE" ? Date.now() : undefined,
    };

    // Optimistic local update so the UI reflects the visit immediately.
    const optimistic: PatrolReport = {
      id: get().reports[input.checkpointId]?.id ?? `local:${outboxKey(payload)}`,
      shiftKey,
      shipId,
      checkpointId: input.checkpointId,
      checkpointName: input.checkpointName,
      status: input.status,
      note: input.note ?? null,
      media: payload.media,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      reportedBy: useAuthStore.getState().user?.id ?? "",
      completedAt: payload.completedAt ?? null,
      deletedAt: null,
      createdAt: get().reports[input.checkpointId]?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ reports: { ...s.reports, [input.checkpointId]: optimistic } }));

    await enqueue(payload);
    await get().flush();
  },

  flush: async () => {
    const entries = await listOutbox();
    set({ pendingKeys: entries.map((e) => e.key) });
    if (entries.length === 0) return;

    for (const entry of entries) {
      try {
        const saved = await useAuthStore
          .getState()
          .authedRequest((at) => patrolApi.save(at, entry.payload));
        await dequeue(entry.key);
        set((s) => ({
          reports: { ...s.reports, [saved.checkpointId]: saved },
          pendingKeys: s.pendingKeys.filter((k) => k !== entry.key),
        }));
      } catch (err) {
        if (isNetworkError(err)) {
          set({ status: "offline" });
          break; // still offline; keep the rest queued
        }
        // A definitive server rejection (e.g. stale tombstone) — drop it so it
        // doesn't block the queue forever.
        await dequeue(entry.key);
        set((s) => ({ pendingKeys: s.pendingKeys.filter((k) => k !== entry.key) }));
      }
    }
  },
}));
