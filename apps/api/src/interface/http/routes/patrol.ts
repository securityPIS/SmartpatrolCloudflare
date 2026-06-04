import { Hono } from "hono";
import { SavePatrolReportRequest } from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { getActor } from "../middleware/authorize";

export const patrolRouter = new Hono<HonoEnv>();

/**
 * Per-shift history for the Laporan screen: GET /patrol/history[?shipId=...].
 * Registered before the `:shipId/:shiftKey` matcher so "history" is not
 * captured as a ship id.
 */
patrolRouter.get("/history", requireAuth, async (c) => {
  const actor = getActor(c);
  const shipId = c.req.query("shipId");
  const data = await c.var.resolve().patrol.history(actor, shipId);
  return c.json({ ok: true, data });
});

/** List live reports for a ship's shift: GET /patrol/:shipId/:shiftKey */
patrolRouter.get("/:shipId/:shiftKey", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var
    .resolve()
    .patrol.list(actor, c.req.param("shipId"), c.req.param("shiftKey"));
  return c.json({ ok: true, data });
});

/** Upsert a checkpoint visit (anti-resurrection guarded). */
patrolRouter.post("/", requireAuth, async (c) => {
  const actor = getActor(c);
  const body = SavePatrolReportRequest.parse(await c.req.json());
  const data = await c.var.resolve().patrol.save(actor, body);
  return c.json({ ok: true, data }, 201);
});

/** Soft-delete (tombstone) a report. */
patrolRouter.delete("/:id", requireAuth, async (c) => {
  const actor = getActor(c);
  await c.var.resolve().patrol.delete(actor, c.req.param("id"));
  return c.json({ ok: true, data: { deleted: true } });
});

/** Reconstruct the full shift snapshot from the ship's checkpoints. */
patrolRouter.post("/:shipId/:shiftKey/finalize", requireAuth, async (c) => {
  const actor = getActor(c);
  const data = await c.var
    .resolve()
    .patrol.finalizeShift(actor, c.req.param("shipId"), c.req.param("shiftKey"));
  return c.json({ ok: true, data });
});
