import { env } from "../config/env";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string | null;
}

/**
 * Typed fetch wrapper. Unwraps the `{ ok, data }` envelope and throws a typed
 * {@link ApiError} on failures. Network failures surface as the native
 * `TypeError` (callers use that to distinguish offline from auth errors).
 */
export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = opts;
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : {};
  const envelope = json as { ok?: boolean; data?: T; error?: ApiErrorShape };

  if (!res.ok || envelope.ok === false) {
    const err = envelope.error;
    throw new ApiError(
      err?.message ?? `Request failed (${res.status})`,
      res.status,
      err?.code ?? "HTTP_ERROR",
      err?.details,
    );
  }

  // Enveloped responses return `data`; plain ones (e.g. /server-time) return as-is.
  return (envelope.data ?? (json as T)) as T;
}

/** Convenience GET (kept for existing call sites). */
export function apiGet<T = unknown>(path: string, accessToken?: string | null): Promise<T> {
  return apiRequest<T>(path, { accessToken });
}
