import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { buildTestDeps } from "../../../application/auth/__tests__/fakes";
import type { Container } from "../container";
import type { HonoEnv } from "../env";
import { requireAuth } from "./auth";
import { getActor, requireRole } from "./authorize";

/** Minimal app exposing an ADMIN-only route to exercise the guards end-to-end. */
function buildApp() {
  const deps = buildTestDeps();
  const container: Container = { tokens: deps.tokens, auth: {} as Container["auth"] };

  const app = new Hono<HonoEnv>();
  app.use("*", async (c, next) => {
    c.set("resolve", () => container);
    await next();
  });
  app.get("/admin-only", requireAuth, requireRole("ADMIN"), (c) => {
    return c.json({ ok: true, who: getActor(c).id });
  });
  app.get("/staff", requireAuth, requireRole("PIC", "PETUGAS"), (c) => c.json({ ok: true }));

  // Surface DomainError statuses for the assertions.
  app.onError((err, c) => {
    const status = (err as { status?: number }).status ?? 500;
    return c.json({ ok: false, message: err.message }, status as 401 | 403 | 500);
  });

  return { app, deps };
}

async function tokenFor(deps: ReturnType<typeof buildTestDeps>, role: "ADMIN" | "PIC" | "PETUGAS") {
  const { token } = await deps.tokens.issueAccessToken({
    sub: deps.ids.uuid(),
    role,
    shipIds: [],
  });
  return token;
}

const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

describe("requireRole middleware", () => {
  it("rejects an unauthenticated request with 401", async () => {
    const { app } = buildApp();
    const res = await app.request("/admin-only");
    expect(res.status).toBe(401);
  });

  it("allows ADMIN through the admin-only route", async () => {
    const { app, deps } = buildApp();
    const res = await app.request("/admin-only", bearer(await tokenFor(deps, "ADMIN")));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { ok: boolean }).ok).toBe(true);
  });

  it("forbids PETUGAS from the admin-only route with 403 FORBIDDEN", async () => {
    const { app, deps } = buildApp();
    const res = await app.request("/admin-only", bearer(await tokenFor(deps, "PETUGAS")));
    expect(res.status).toBe(403);
  });

  it("allows any listed role through a multi-role route", async () => {
    const { app, deps } = buildApp();
    const pic = await app.request("/staff", bearer(await tokenFor(deps, "PIC")));
    const petugas = await app.request("/staff", bearer(await tokenFor(deps, "PETUGAS")));
    expect(pic.status).toBe(200);
    expect(petugas.status).toBe(200);
  });

  it("forbids a role not in the allow-list", async () => {
    const { app, deps } = buildApp();
    const res = await app.request("/staff", bearer(await tokenFor(deps, "ADMIN")));
    expect(res.status).toBe(403);
  });
});
