import type { PatrolReport, SavePatrolReportRequest } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const patrolApi = {
  list: (accessToken: string, shipId: string, shiftKey: string) =>
    apiRequest<PatrolReport[]>(`/patrol/${shipId}/${encodeURIComponent(shiftKey)}`, {
      accessToken,
    }),

  save: (accessToken: string, body: SavePatrolReportRequest) =>
    apiRequest<PatrolReport>("/patrol", { method: "POST", accessToken, body }),

  delete: (accessToken: string, reportId: string) =>
    apiRequest<{ deleted: boolean }>(`/patrol/${reportId}`, { method: "DELETE", accessToken }),

  finalize: (accessToken: string, shipId: string, shiftKey: string) =>
    apiRequest<PatrolReport[]>(`/patrol/${shipId}/${encodeURIComponent(shiftKey)}/finalize`, {
      method: "POST",
      accessToken,
    }),
};
