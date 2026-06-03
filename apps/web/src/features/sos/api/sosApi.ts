import type { RaiseSosRequest, SosAlert } from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const sosApi = {
  list: (accessToken: string, shipId?: string) => {
    const params = shipId ? `?shipId=${encodeURIComponent(shipId)}` : "";
    return apiRequest<SosAlert[]>(`/sos${params}`, { accessToken });
  },

  raise: (accessToken: string, body: RaiseSosRequest) =>
    apiRequest<SosAlert>("/sos", { method: "POST", accessToken, body }),

  acknowledge: (accessToken: string, sosId: string) =>
    apiRequest<SosAlert>(`/sos/${sosId}/acknowledge`, { method: "POST", accessToken }),

  resolve: (accessToken: string, sosId: string) =>
    apiRequest<SosAlert>(`/sos/${sosId}/resolve`, { method: "POST", accessToken }),
};
