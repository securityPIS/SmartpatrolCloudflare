/**
 * Worker runtime bindings. Resources are provisioned in Cloudflare and wired in
 * `wrangler.toml`; secrets are set with `wrangler secret put`.
 */
export interface Env {
  // --- Bindings (wrangler.toml) ---
  DB: D1Database;
  BUCKET: R2Bucket;
  KV: KVNamespace;
  SHIP_CHANNEL: DurableObjectNamespace;

  // --- Vars / secrets ---
  APP_ENV: string;
  /** JWT signing secret (set via `wrangler secret put JWT_SECRET`). */
  JWT_SECRET?: string;
  /** Public base URL of the web app (for email links, CORS). */
  APP_URL?: string;
}

/** Hono environment: typed bindings + per-request variables. */
export interface HonoEnv {
  Bindings: Env;
  Variables: {
    /** Populated by the auth middleware (Phase 1.5). */
    userId?: string;
  };
}
