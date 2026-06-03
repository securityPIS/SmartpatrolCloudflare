import type {
  PendingRegistration,
  PendingRegistrationStatus,
  UpdateProfileRequest,
  UserDto,
} from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const userApi = {
  listUsers: (accessToken: string) => apiRequest<UserDto[]>("/users", { accessToken }),

  updateUser: (accessToken: string, userId: string, body: UpdateProfileRequest) =>
    apiRequest<UserDto>(`/users/${userId}`, { method: "PUT", accessToken, body }),

  listPending: (accessToken: string, status?: PendingRegistrationStatus) =>
    apiRequest<PendingRegistration[]>(
      status ? `/admin/registrations?status=${status}` : "/admin/registrations",
      { accessToken },
    ),

  approve: (accessToken: string, pendingId: string) =>
    apiRequest<UserDto>(`/admin/registrations/${pendingId}/approve`, {
      method: "POST",
      accessToken,
    }),

  reject: (accessToken: string, pendingId: string) =>
    apiRequest<{ rejected: boolean }>(`/admin/registrations/${pendingId}/reject`, {
      method: "POST",
      accessToken,
    }),
};
