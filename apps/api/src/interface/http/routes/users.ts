import { Hono } from "hono";
import { UpdateProfileRequest } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor, requireRole } from "../middleware/authorize";

export const usersRouter = new Hono<HonoEnv>();

usersRouter.get("/", requireAuth, requireRole("ADMIN"), async (c) => {
  const data = await c.var.resolve().users.list(getActor(c));
  return c.json({ ok: true, data });
});

usersRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (c) => {
  const actor = getActor(c);
  const body = UpdateProfileRequest.parse(await c.req.json());
  const data = await c.var.resolve().users.update(actor, c.req.param("id"), body);
  return c.json({ ok: true, data });
});
