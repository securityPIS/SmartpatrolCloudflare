import { describe, expect, it } from "vitest";
import { LoginRequest, Role, ServerTimeResponse } from "../index";

describe("contracts", () => {
  it("normalizes email and accepts a valid login", () => {
    const parsed = LoginRequest.parse({ email: "  USER@Example.com ", password: "supersecret" });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects a short password", () => {
    const res = LoginRequest.safeParse({ email: "user@example.com", password: "short" });
    expect(res.success).toBe(false);
  });

  it("constrains roles to the known set", () => {
    expect(Role.options).toEqual(["ADMIN", "PIC", "PETUGAS"]);
    expect(Role.safeParse("ROOT").success).toBe(false);
  });

  it("validates a server-time payload", () => {
    const now = Date.now();
    const ok = ServerTimeResponse.safeParse({ now, iso: new Date(now).toISOString() });
    expect(ok.success).toBe(true);
  });
});
