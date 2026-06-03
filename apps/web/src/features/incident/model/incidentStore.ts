import { create } from "zustand";
import type { CreateIncidentRequest, Incident, UpdateIncidentRequest } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { incidentApi } from "../api/incidentApi";

interface IncidentState {
  incidents: Incident[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  load: (shipId: string, statusFilter?: string) => Promise<void>;
  create: (input: CreateIncidentRequest) => Promise<Incident>;
  update: (id: string, input: UpdateIncidentRequest) => Promise<Incident>;
  remove: (id: string) => Promise<void>;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  status: "idle",
  error: null,

  load: async (shipId, statusFilter) => {
    set({ status: "loading", error: null });
    try {
      const incidents = await useAuthStore
        .getState()
        .authedRequest((at) => incidentApi.list(at, shipId, statusFilter));
      set({ incidents, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load incidents",
      });
    }
  },

  create: async (input) => {
    const incident = await useAuthStore
      .getState()
      .authedRequest((at) => incidentApi.create(at, input));
    set((s) => ({ incidents: [incident, ...s.incidents] }));
    return incident;
  },

  update: async (id, input) => {
    const incident = await useAuthStore
      .getState()
      .authedRequest((at) => incidentApi.update(at, id, input));
    set((s) => ({
      incidents: s.incidents.map((x) => (x.id === id ? incident : x)),
    }));
    return incident;
  },

  remove: async (id) => {
    await useAuthStore.getState().authedRequest((at) => incidentApi.delete(at, id));
    set((s) => ({ incidents: s.incidents.filter((x) => x.id !== id) }));
  },
}));
