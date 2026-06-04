import { Hono } from "hono";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor } from "../middleware/authorize";

export const reportsRouter = new Hono<HonoEnv>();

/** Management Daily Report: GET /reports/daily[?date=YYYY-MM-DD] (ADMIN/PIC). */
reportsRouter.get("/daily", requireAuth, async (c) => {
  const actor = getActor(c);
  const date = c.req.query("date");
  const data = await c.var.resolve().reports.daily(actor, date);
  return c.json({ ok: true, data });
});
