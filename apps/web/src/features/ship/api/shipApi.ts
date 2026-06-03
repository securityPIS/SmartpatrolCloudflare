import type { CreateShipRequest, Ship, UpdateShipRequest } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const shipApi = {
  list: (accessToken: string) => apiRequest<Ship[]>("/ships", { accessToken }),

  get: (accessToken: string, shipId: string) =>
    apiRequest<Ship>(`/ships/${shipId}`, { accessToken }),

  create: (accessToken: string, body: CreateShipRequest) =>
    apiRequest<Ship>("/ships", { method: "POST", accessToken, body }),

  update: (accessToken: string, shipId: string, body: UpdateShipRequest) =>
    apiRequest<Ship>(`/ships/${shipId}`, { method: "PUT", accessToken, body }),

  delete: (accessToken: string, shipId: string) =>
    apiRequest<{ deleted: boolean }>(`/ships/${shipId}`, { method: "DELETE", accessToken }),
};
