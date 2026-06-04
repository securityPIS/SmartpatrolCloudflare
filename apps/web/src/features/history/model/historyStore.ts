import { create } from "zustand";
import type { ShiftSummary } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { historyApi } from "../api/historyApi";

/**
 * Patrol shift history. `load()` fetches the caller's full accessible scope —
 * every ship for an admin, the assigned ships otherwise — and the page filters
 * by ship client-side. The role-specific scoping is enforced on the server.
 */
interface HistoryState {
  summaries: ShiftSummary[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  load: (shipId?: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  summaries: [],
  status: "idle",
  error: null,

  load: async (shipId) => {
    set({ status: "loading", error: null });
    try {
      const summaries = await useAuthStore
        .getState()
        .authedRequest((at) => historyApi.list(at, shipId));
      set({ summaries, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Gagal memuat riwayat",
      });
    }
  },
}));
