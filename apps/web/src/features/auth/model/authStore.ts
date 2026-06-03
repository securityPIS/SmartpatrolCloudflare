import { create } from "zustand";
import type { RegisterRequest, UserDto } from "@smartpatrol/contracts";
import { ApiError } from "../../../shared/api/client";
import { authApi } from "../api/authApi";

const STORAGE_KEY = "smartpatrol.auth";

interface Persisted {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function savePersisted(p: Persisted | null): void {
  try {
    if (p) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * - `unknown`         : before bootstrap finished
 * - `unauthenticated` : no/expired session — show login
 * - `authenticating`  : login in flight
 * - `authenticated`   : valid session, server reachable
 * - `offline`         : we HAVE a session but the server is unreachable
 *                       (transient — we deliberately keep the user signed in)
 */
type Status = "unknown" | "unauthenticated" | "authenticating" | "authenticated" | "offline";

interface AuthState {
  status: Status;
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterRequest) => Promise<string>;
  logout: () => Promise<void>;
  /** Run an authed call, transparently refreshing the access token once on 401. */
  authedRequest: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "unknown",
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,

  bootstrap: async () => {
    const persisted = loadPersisted();
    if (!persisted) {
      set({ status: "unauthenticated" });
      return;
    }
    // Optimistically restore, then validate against the server.
    set({
      user: persisted.user,
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken,
      status: "authenticated",
    });
    try {
      const user = await get().authedRequest((at) => authApi.me(at));
      set({ user, status: "authenticated" });
      const cur = loadPersisted();
      if (cur) savePersisted({ ...cur, user });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Definitive auth failure (refresh rejected) → clear session.
        savePersisted(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          status: "unauthenticated",
          error: "Your session has expired. Please sign in again.",
        });
      } else {
        // OFFLINE GUARD: network blip is transient — keep the user signed in.
        set({ status: "offline" });
      }
    }
  },

  login: async (email, password) => {
    set({ status: "authenticating", error: null });
    try {
      const res = await authApi.login({ email, password });
      savePersisted({
        accessToken: res.tokens.accessToken,
        refreshToken: res.tokens.refreshToken,
        user: res.user,
      });
      set({
        user: res.user,
        accessToken: res.tokens.accessToken,
        refreshToken: res.tokens.refreshToken,
        status: "authenticated",
        error: null,
      });
    } catch (err) {
      set({
        status: "unauthenticated",
        error: err instanceof Error ? err.message : "Login failed",
      });
      throw err;
    }
  },

  register: async (input) => {
    const res = await authApi.register(input);
    return res.message;
  },

  logout: async () => {
    const { refreshToken } = get();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* best-effort */
      }
    }
    savePersisted(null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: "unauthenticated",
      error: null,
    });
  },

  authedRequest: async (fn) => {
    const { accessToken, refreshToken } = get();
    if (!accessToken) throw new ApiError("Not authenticated", 401, "NO_SESSION");
    try {
      return await fn(accessToken);
    } catch (err) {
      // Only retry on a 401 when we have a refresh token.
      if (err instanceof ApiError && err.status === 401 && refreshToken) {
        const tokens = await authApi.refresh(refreshToken);
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        const cur = loadPersisted();
        if (cur) {
          savePersisted({
            ...cur,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
        }
        return await fn(tokens.accessToken);
      }
      throw err;
    }
  },
}));
