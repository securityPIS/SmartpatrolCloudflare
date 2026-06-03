import type { Env } from "../interface/http/env";

/**
 * Cron entry point. The scheduled jobs (checkpoint_pending, shift_wrap_up,
 * finalize_shift, resign_assets) are implemented in Phase 8. For now this is a
 * no-op so the `[triggers]` cron in wrangler.toml has a handler.
 */
export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, _env, _ctx) => {
  console.log(`[cron] tick: ${event.cron} @ ${new Date(event.scheduledTime).toISOString()}`);
};
