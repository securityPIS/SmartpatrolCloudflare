import type {
  CreateIncidentRequest,
  Incident,
  UpdateIncidentRequest,
} from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const incidentApi = {
  list: (accessToken: string, shipId: string, status?: string) => {
    const params = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<Incident[]>(`/incidents/${shipId}${params}`, { accessToken });
  },

  get: (accessToken: string, shipId: string, id: string) =>
    apiRequest<Incident>(`/incidents/${shipId}/${id}`, { accessToken }),

  create: (accessToken: string, body: CreateIncidentRequest) =>
    apiRequest<Incident>("/incidents", { method: "POST", accessToken, body }),

  update: (accessToken: string, id: string, body: UpdateIncidentRequest) =>
    apiRequest<Incident>(`/incidents/${id}`, { method: "PATCH", accessToken, body }),

  delete: (accessToken: string, id: string) =>
    apiRequest<{ deleted: boolean }>(`/incidents/${id}`, { method: "DELETE", accessToken }),
};
