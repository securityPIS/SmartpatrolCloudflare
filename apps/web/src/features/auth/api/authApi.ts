import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserDto,
  VerifyEmailRequest,
} from "@smartpatrol/contracts";
import { apiRequest } from "../../../shared/api/client";

export const authApi = {
  login: (body: LoginRequest) => apiRequest<AuthResponse>("/auth/login", { method: "POST", body }),

  register: (body: RegisterRequest) =>
    apiRequest<RegisterResponse>("/auth/register", { method: "POST", body }),

  verifyEmail: (body: VerifyEmailRequest) =>
    apiRequest<{ verified: boolean }>("/auth/verify-email", { method: "POST", body }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthTokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),

  logout: (refreshToken: string) =>
    apiRequest<{ loggedOut: boolean }>("/auth/logout", { method: "POST", body: { refreshToken } }),

  me: (accessToken: string) => apiRequest<UserDto>("/auth/me", { accessToken }),
};
