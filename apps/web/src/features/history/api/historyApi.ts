import type { ShiftSummary } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const historyApi = {
  /** Per-shift roll-up. Omit shipId for the caller's full accessible scope. */
  list: (accessToken: string, shipId?: string) => {
    const params = shipId ? `?shipId=${encodeURIComponent(shipId)}` : "";
    return apiRequest<ShiftSummary[]>(`/patrol/history${params}`, { accessToken });
  },
};
