import { Hono } from "hono";
import { PendingRegistrationStatus } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor, requireRole } from "../middleware/authorize";

export const adminRouter = new Hono<HonoEnv>();

adminRouter.get("/registrations", requireAuth, requireRole("ADMIN"), async (c) => {
  const raw = c.req.query("status");
  const status = raw ? PendingRegistrationStatus.optional().parse(raw) : undefined;
  const data = await c.var.resolve().admin.listPending(getActor(c), status);
  return c.json({ ok: true, data });
});

adminRouter.post("/registrations/:id/approve", requireAuth, requireRole("ADMIN"), async (c) => {
  const data = await c.var.resolve().admin.approve(getActor(c), c.req.param("id"));
  return c.json({ ok: true, data });
});

adminRouter.post("/registrations/:id/reject", requireAuth, requireRole("ADMIN"), async (c) => {
  await c.var.resolve().admin.reject(getActor(c), c.req.param("id"));
  return c.json({ ok: true, data: { rejected: true } });
});
