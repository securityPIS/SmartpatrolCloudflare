import { create } from "zustand";
import { fetchServerTime } from "../api/serverTime";

type Status = "idle" | "loading" | "ok" | "error";

interface ServerTimeState {
  status: Status;
  serverNow: number | null;
  iso: string | null;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Tiny granular store — the pattern that replaces the legacy mega-context. */
export const useServerTimeStore = create<ServerTimeState>((set) => ({
  status: "idle",
  serverNow: null,
  iso: null,
  error: null,
  refresh: async () => {
    set({ status: "loading", error: null });
    try {
      const { now, iso } = await fetchServerTime();
      set({ status: "ok", serverNow: now, iso });
    } catch (e) {
      set({ status: "error", error: e instanceof Error ? e.message : "Unknown error" });
    }
  },
}));
