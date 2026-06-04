import { create } from "zustand";
import type { Notification } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { notificationApi } from "../api/notificationApi";

/**
 * Notification state. The side- and bottom-navigation read `unreadCount` to
 * render the rose badge; the Notifications page reads the full `notifications`
 * list. `refreshUnread` is cheap (count only) and runs on app load so the
 * badge is correct before the user ever opens the page.
 */
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  load: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  status: "idle",
  error: null,

  load: async () => {
    set({ status: "loading", error: null });
    try {
      const notifications = await useAuthStore
        .getState()
        .authedRequest((at) => notificationApi.list(at));
      set({
        notifications,
        unreadCount: notifications.filter((n) => n.readAt === null).length,
        status: "ready",
      });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Gagal memuat notifikasi",
      });
    }
  },

  refreshUnread: async () => {
    try {
      const { count } = await useAuthStore
        .getState()
        .authedRequest((at) => notificationApi.unreadCount(at));
      set({ unreadCount: count });
    } catch {
      // Silent: keep the last known badge value when offline / unauthenticated.
    }
  },

  markRead: async (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.readAt !== null) return;
    const now = Date.now();
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, readAt: now } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try {
      await useAuthStore.getState().authedRequest((at) => notificationApi.markRead(at, id));
    } catch {
      void get().load(); // resync on failure
    }
  },

  markAllRead: async () => {
    if (get().unreadCount === 0) return;
    const now = Date.now();
    set((s) => ({
      notifications: s.notifications.map((n) => (n.readAt === null ? { ...n, readAt: now } : n)),
      unreadCount: 0,
    }));
    try {
      await useAuthStore.getState().authedRequest((at) => notificationApi.markAllRead(at));
    } catch {
      void get().load();
    }
  },
}));
