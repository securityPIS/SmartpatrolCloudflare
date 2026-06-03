import { create } from "zustand";
import type { RaiseSosRequest, SosAlert } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { sosApi } from "../api/sosApi";

interface SosState {
  alerts: SosAlert[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  load: (shipId?: string) => Promise<void>;
  raise: (input: RaiseSosRequest) => Promise<SosAlert>;
  acknowledge: (sosId: string) => Promise<void>;
  resolve: (sosId: string) => Promise<void>;
}

export const useSosStore = create<SosState>((set) => ({
  alerts: [],
  status: "idle",
  error: null,

  load: async (shipId) => {
    set({ status: "loading", error: null });
    try {
      const alerts = await useAuthStore
        .getState()
        .authedRequest((at) => sosApi.list(at, shipId));
      set({ alerts, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load SOS alerts",
      });
    }
  },

  raise: async (input) => {
    const alert = await useAuthStore
      .getState()
      .authedRequest((at) => sosApi.raise(at, input));
    set((s) => ({ alerts: [alert, ...s.alerts] }));
    return alert;
  },

  acknowledge: async (sosId) => {
    const updated = await useAuthStore
      .getState()
      .authedRequest((at) => sosApi.acknowledge(at, sosId));
    set((s) => ({
      alerts: s.alerts.map((x) => (x.id === sosId ? updated : x)),
    }));
  },

  resolve: async (sosId) => {
    const updated = await useAuthStore
      .getState()
      .authedRequest((at) => sosApi.resolve(at, sosId));
    set((s) => ({
      alerts: s.alerts.map((x) => (x.id === sosId ? updated : x)),
    }));
  },
}));
