import type { DailyReport } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const reportApi = {
  daily: (accessToken: string, date: string) =>
    apiRequest<DailyReport>(`/reports/daily?date=${encodeURIComponent(date)}`, { accessToken }),
};
