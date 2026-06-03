import { Hono } from "hono";
import { CreateShipRequest, UpdateShipRequest } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor, requireRole } from "../middleware/authorize";

export const shipsRouter = new Hono<HonoEnv>();

shipsRouter.get("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().ships.list(actor);
  return c.json({ ok: true, data });
});

shipsRouter.get("/:id", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().ships.get(actor, c.req.param("id"));
  return c.json({ ok: true, data });
});

shipsRouter.post("/", requireAuth, requireRole("ADMIN"), async (c) => {
  const actor = getActor(c);
  const body = CreateShipRequest.parse(await c.req.json());
  const data = await c.var.resolve().ships.create(actor, body);
  return c.json({ ok: true, data }, 201);
});

shipsRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (c) => {
  const actor = getActor(c);
  const body = UpdateShipRequest.parse(await c.req.json());
  const data = await c.var.resolve().ships.update(actor, c.req.param("id"), body);
  return c.json({ ok: true, data });
});

shipsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (c) => {
  const actor = getActor(c);
  await c.var.resolve().ships.delete(actor, c.req.param("id"));
  return c.json({ ok: true, data: { deleted: true } });
});
