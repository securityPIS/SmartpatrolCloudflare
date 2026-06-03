import { create } from "zustand";
import type { PendingRegistration, UpdateProfileRequest, UserDto } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { userApi } from "../api/userApi";

interface UserState {
  users: UserDto[];
  pending: PendingRegistration[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  loadUsers: () => Promise<void>;
  loadPending: () => Promise<void>;
  updateUser: (userId: string, input: UpdateProfileRequest) => Promise<UserDto>;
  approve: (pendingId: string) => Promise<void>;
  reject: (pendingId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  pending: [],
  status: "idle",
  error: null,

  loadUsers: async () => {
    set({ status: "loading", error: null });
    try {
      const users = await useAuthStore.getState().authedRequest((at) => userApi.listUsers(at));
      set({ users, status: "ready" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Failed to load users" });
    }
  },

  loadPending: async () => {
    set({ status: "loading", error: null });
    try {
      const pending = await useAuthStore.getState().authedRequest((at) => userApi.listPending(at));
      set({ pending, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load registrations",
      });
    }
  },

  updateUser: async (userId, input) => {
    const user = await useAuthStore
      .getState()
      .authedRequest((at) => userApi.updateUser(at, userId, input));
    set((s) => ({ users: s.users.map((u) => (u.id === userId ? user : u)) }));
    return user;
  },

  approve: async (pendingId) => {
    await useAuthStore.getState().authedRequest((at) => userApi.approve(at, pendingId));
    set((s) => ({
      pending: s.pending.filter((p) => p.id !== pendingId),
    }));
  },

  reject: async (pendingId) => {
    await useAuthStore.getState().authedRequest((at) => userApi.reject(at, pendingId));
    set((s) => ({
      pending: s.pending.filter((p) => p.id !== pendingId),
    }));
  },
}));
