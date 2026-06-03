import { describe, expect, it } from "vitest";
import { ScryptPasswordHasher } from "./scryptPasswordHasher";
import { JoseTokenService } from "./joseTokenService";
import { InvalidTokenError } from "../../domain/errors";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();

  it("hashes and verifies a password", async () => {
    const encoded = await hasher.hash("correct horse battery");
    expect(encoded.startsWith("scrypt$")).toBe(true);
    expect(encoded).not.toContain("correct horse battery");
    expect(await hasher.verify("correct horse battery", encoded)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const encoded = await hasher.hash("right-password");
    expect(await hasher.verify("wrong-password", encoded)).toBe(false);
  });

  it("produces a different salt each time", async () => {
    const a = await hasher.hash("same");
    const b = await hasher.hash("same");
    expect(a).not.toBe(b);
  });

  it("returns false for a malformed hash", async () => {
    expect(await hasher.verify("x", "not-a-valid-hash")).toBe(false);
  });
});

describe("JoseTokenService", () => {
  const svc = new JoseTokenService("unit-test-secret");

  it("issues and verifies an access token", async () => {
    const { token, expiresAt } = await svc.issueAccessToken({
      sub: "11111111-1111-4111-8111-111111111111",
      role: "ADMIN",
      shipIds: [],
    });
    expect(expiresAt).toBeGreaterThan(Date.now());
    const payload = await svc.verifyAccessToken(token);
    expect(payload.sub).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.role).toBe("ADMIN");
  });

  it("rejects a tampered token", async () => {
    const { token } = await svc.issueAccessToken({
      sub: "11111111-1111-4111-8111-111111111111",
      role: "PETUGAS",
      shipIds: [],
    });
    await expect(svc.verifyAccessToken(token + "x")).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("rejects an expired token", async () => {
    const past = new JoseTokenService("unit-test-secret", {
      accessTtlSec: 1,
      clock: { now: () => Date.now() - 10_000 },
    });
    const { token } = await past.issueAccessToken({
      sub: "11111111-1111-4111-8111-111111111111",
      role: "PETUGAS",
      shipIds: [],
    });
    await expect(past.verifyAccessToken(token)).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("creates, parses and hashes refresh tokens consistently", async () => {
    const created = await svc.createRefreshToken("session-123");
    const parsed = svc.parseRefreshToken(created.token);
    expect(parsed?.sessionId).toBe("session-123");
    const rehash = await svc.hashRefreshSecret(parsed!.secret);
    expect(rehash).toBe(created.secretHash);
  });

  it("returns null for a malformed refresh token", () => {
    expect(svc.parseRefreshToken("nodot")).toBeNull();
    expect(svc.parseRefreshToken(".onlysecret")).toBeNull();
  });
});
