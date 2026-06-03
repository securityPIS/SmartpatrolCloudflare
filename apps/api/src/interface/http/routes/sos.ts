import { Hono } from "hono";
import { RaiseSosRequest } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor } from "../middleware/authorize";

export const sosRouter = new Hono<HonoEnv>();

/**
 * List SOS alerts.
 * - GET /sos?shipId=<id>  → list all alerts for a specific ship (ship member)
 * - GET /sos              → list all active alerts (admin only)
 */
sosRouter.get("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const shipId = c.req.query("shipId");
  const data = await c.var.resolve().sos.list(actor, shipId);
  return c.json({ ok: true, data });
});

/** Raise a new SOS alert: POST /sos */
sosRouter.post("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const body = RaiseSosRequest.parse(await c.req.json());
  const data = await c.var.resolve().sos.raise(actor, body);
  return c.json({ ok: true, data }, 201);
});

/** Acknowledge an SOS alert: POST /sos/:id/acknowledge */
sosRouter.post("/:id/acknowledge", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().sos.acknowledge(actor, c.req.param("id"));
  return c.json({ ok: true, data });
});

/** Resolve an SOS alert: POST /sos/:id/resolve */
sosRouter.post("/:id/resolve", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().sos.resolve(actor, c.req.param("id"));
  return c.json({ ok: true, data });
});
