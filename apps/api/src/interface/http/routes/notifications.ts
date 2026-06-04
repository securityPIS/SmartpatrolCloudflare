import { Hono } from "hono";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor } from "../middleware/authorize";

export const notificationsRouter = new Hono<HonoEnv>();

/** List my notifications (newest first): GET /notifications */
notificationsRouter.get("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var.resolve().notifications.list(actor);
  return c.json({ ok: true, data });
});

/** My unread count (drives the nav badge): GET /notifications/unread-count */
notificationsRouter.get("/unread-count", requireAuth, async (c) => {
  const actor = getActor(c);
  const count = await c.var.resolve().notifications.unreadCount(actor);
  return c.json({ ok: true, data: { count } });
});

/** Mark all my notifications read: POST /notifications/read-all */
notificationsRouter.post("/read-all", requireAuth, async (c) => {
  const actor = getActor(c);
  await c.var.resolve().notifications.markAllRead(actor);
  return c.json({ ok: true, data: { ok: true } });
});

/** Mark a single notification read: POST /notifications/:id/read */
notificationsRouter.post("/:id/read", requireAuth, async (c) => {
  const actor = getActor(c);
  await c.var.resolve().notifications.markRead(actor, c.req.param("id"));
  return c.json({ ok: true, data: { ok: true } });
});
