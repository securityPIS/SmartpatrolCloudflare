import { env } from "../config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Minimal typed GET helper. Auth headers / refresh land in Phase 1.7. */
export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed with ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}
