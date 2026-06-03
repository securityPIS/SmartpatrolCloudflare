import { create } from "zustand";
import type { CreateShipRequest, Ship, UpdateShipRequest } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { shipApi } from "../api/shipApi";

interface ShipState {
  ships: Ship[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  load: () => Promise<void>;
  create: (input: CreateShipRequest) => Promise<Ship>;
  update: (shipId: string, input: UpdateShipRequest) => Promise<Ship>;
  remove: (shipId: string) => Promise<void>;
}

export const useShipStore = create<ShipState>((set) => ({
  ships: [],
  status: "idle",
  error: null,

  load: async () => {
    set({ status: "loading", error: null });
    try {
      const ships = await useAuthStore.getState().authedRequest((at) => shipApi.list(at));
      set({ ships, status: "ready" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Failed to load ships" });
    }
  },

  create: async (input) => {
    const ship = await useAuthStore.getState().authedRequest((at) => shipApi.create(at, input));
    set((s) => ({ ships: [...s.ships, ship] }));
    return ship;
  },

  update: async (shipId, input) => {
    const ship = await useAuthStore
      .getState()
      .authedRequest((at) => shipApi.update(at, shipId, input));
    set((s) => ({ ships: s.ships.map((x) => (x.id === shipId ? ship : x)) }));
    return ship;
  },

  remove: async (shipId) => {
    await useAuthStore.getState().authedRequest((at) => shipApi.delete(at, shipId));
    set((s) => ({ ships: s.ships.filter((x) => x.id !== shipId) }));
  },
}));
