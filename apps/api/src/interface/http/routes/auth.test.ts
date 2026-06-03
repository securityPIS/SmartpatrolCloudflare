import { describe, expect, it } from "vitest";
import { createAuthUseCases } from "../../../application/auth";
import {
  buildTestDeps,
  seedProfile,
  type TestDeps,
} from "../../../application/auth/__tests__/fakes";
import { createApp } from "../app";
import type { Container } from "../container";

function appWith(deps: TestDeps) {
  const container = {
    tokens: deps.tokens,
    auth: createAuthUseCases(deps),
  } as unknown as Container;
  return createApp(() => container);
}

const json = (body: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("auth routes", () => {
  it("POST /auth/register returns 201 PENDING", async () => {
    const deps = buildTestDeps();
    const app = appWith(deps);
    const res = await app.request(
      "/auth/register",
      json({ email: "new@example.com", password: "supersecret", fullName: "New" }),
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { ok: boolean; data: { status: string } };
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("PENDING");
  });

  it("POST /auth/register rejects an invalid body with 400 VALIDATION", async () => {
    const deps = buildTestDeps();
    const res = await appWith(deps).request(
      "/auth/register",
      json({ email: "not-an-email", password: "short" }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    expect(body.error.code).toBe("VALIDATION");
  });

  it("POST /auth/login returns 401 for bad credentials", async () => {
    const deps = buildTestDeps();
    await seedProfile(deps, { email: "guard@example.com", password: "supersecret" });
    const res = await appWith(deps).request(
      "/auth/login",
      json({ email: "guard@example.com", password: "wrongpass1" }),
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("login → /auth/me with bearer token returns the user", async () => {
    const deps = buildTestDeps();
    await seedProfile(deps, { email: "guard@example.com", password: "supersecret", role: "ADMIN" });
    const app = appWith(deps);

    const loginRes = await app.request(
      "/auth/login",
      json({ email: "guard@example.com", password: "supersecret" }),
    );
    expect(loginRes.status).toBe(200);
    const { data } = (await loginRes.json()) as {
      data: { tokens: { accessToken: string } };
    };

    const meRes = await app.request("/auth/me", {
      headers: { Authorization: `Bearer ${data.tokens.accessToken}` },
    });
    expect(meRes.status).toBe(200);
    const me = (await meRes.json()) as { data: { email: string; role: string } };
    expect(me.data.email).toBe("guard@example.com");
    expect(me.data.role).toBe("ADMIN");
  });

  it("GET /auth/me without a token returns 401", async () => {
    const deps = buildTestDeps();
    const res = await appWith(deps).request("/auth/me");
    expect(res.status).toBe(401);
  });
});
