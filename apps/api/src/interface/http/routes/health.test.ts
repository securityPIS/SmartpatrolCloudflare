import { describe, expect, it } from "vitest";
import { ServerTimeResponse } from "@smartpatrol/contracts";
import { app } from "../app";

describe("health routes", () => {
  it("GET /healthz returns ok", async () => {
    const res = await app.request("/healthz");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, service: "smartpatrol-api" });
  });

  it("GET /server-time returns a valid trusted-time payload", async () => {
    const before = Date.now();
    const res = await app.request("/server-time");
    expect(res.status).toBe(200);

    const body = ServerTimeResponse.parse(await res.json());
    expect(body.now).toBeGreaterThanOrEqual(before);
    expect(new Date(body.iso).getTime()).toBe(body.now);
  });

  it("unknown routes return a structured 404", async () => {
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
