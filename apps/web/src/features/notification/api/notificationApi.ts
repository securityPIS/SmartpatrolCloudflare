import type { Notification } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const notificationApi = {
  list: (accessToken: string) => apiRequest<Notification[]>("/notifications", { accessToken }),

  unreadCount: (accessToken: string) =>
    apiRequest<{ count: number }>("/notifications/unread-count", { accessToken }),

  markRead: (accessToken: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/notifications/${id}/read`, {
      method: "POST",
      accessToken,
    }),

  markAllRead: (accessToken: string) =>
    apiRequest<{ ok: boolean }>("/notifications/read-all", {
      method: "POST",
      accessToken,
    }),
};
