import { app } from "./interface/http/app";
import { scheduled } from "./cron/scheduled";
import type { Env } from "./interface/http/env";

// Durable Object export (referenced by wrangler.toml bindings/migrations).
export { ShipChannel } from "./realtime/ShipChannel";

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<Env>;
