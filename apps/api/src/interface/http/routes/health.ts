import { Hono } from "hono";
import type { ServerTimeResponse } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";

export const health = new Hono<HonoEnv>();

/** Liveness probe. */
health.get("/healthz", (c) => c.json({ ok: true, service: "smartpatrol-api" }));

/**
 * Trusted time anchor (Phase 9.1). The client uses this to correct local clock
 * drift and maintain a monotonic offline clock.
 */
health.get("/server-time", (c) => {
  const now = Date.now();
  const body: ServerTimeResponse = { now, iso: new Date(now).toISOString() };
  return c.json(body);
});
