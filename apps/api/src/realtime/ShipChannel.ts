import type { Env } from "../interface/http/env";

/**
 * Durable Object: one instance per ship/shift channel. Full WebSocket
 * hibernation fan-out lands in Phase 7 — this is the binding stub so the
 * Worker (and `wrangler deploy --dry-run`) has a class to export.
 */
export class ShipChannel implements DurableObject {
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(_request: Request): Promise<Response> {
    void this.state;
    void this.env;
    return new Response("ShipChannel: not implemented yet (Phase 7)", { status: 501 });
  }
}
