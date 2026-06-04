import { create } from "zustand";

/**
 * Notification state. Only the unread badge count is wired today — the side-
 * and bottom-navigation read it to render the rose pill. The full notifications
 * feature (list, realtime, mark-as-read) lands as its own vertical slice; until
 * then `unreadCount` stays 0 so the badge simply stays hidden.
 */
interface NotificationState {
  unreadCount: number;
}

export const useNotificationStore = create<NotificationState>(() => ({
  unreadCount: 0,
}));
