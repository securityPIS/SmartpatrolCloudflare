import { Hono } from "hono";
import { CreateIncidentRequest, UpdateIncidentRequest } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor } from "../middleware/authorize";

export const incidentsRouter = new Hono<HonoEnv>();

/** List incidents for a ship: GET /incidents/:shipId */
incidentsRouter.get("/:shipId", requireAuth, async (c) => {
  const actor = getActor(c);
  const shipId = c.req.param("shipId");
  const statusParam = c.req.query("status") as
    | "OPEN"
    | "ACKNOWLEDGED"
    | "RESOLVED"
    | undefined;
  const data = await c.var.resolve().incidents.list(actor, shipId, statusParam);
  return c.json({ ok: true, data });
});

/** Get a single incident: GET /incidents/:shipId/:id */
incidentsRouter.get("/:shipId/:id", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().incidents.get(actor, c.req.param("id"));
  return c.json({ ok: true, data });
});

/** Create an incident: POST /incidents */
incidentsRouter.post("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const body = CreateIncidentRequest.parse(await c.req.json());
  const data = await c.var.resolve().incidents.create(actor, body);
  return c.json({ ok: true, data }, 201);
});

/** Update an incident: PATCH /incidents/:id */
incidentsRouter.patch("/:id", requireAuth, async (c) => {
  const actor = getActor(c);
  const body = UpdateIncidentRequest.parse(await c.req.json());
  const data = await c.var.resolve().incidents.update(actor, c.req.param("id"), body);
  return c.json({ ok: true, data });
});

/** Delete an incident (admin only): DELETE /incidents/:id */
incidentsRouter.delete("/:id", requireAuth, async (c) => {
  const actor = getActor(c);
  await c.var.resolve().incidents.delete(actor, c.req.param("id"));
  return c.json({ ok: true, data: { deleted: true } });
});
