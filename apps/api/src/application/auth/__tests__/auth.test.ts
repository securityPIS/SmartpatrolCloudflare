import { beforeEach, describe, expect, it } from "vitest";
import {
  AccountDisabledError,
  EmailTakenError,
  InvalidCredentialsError,
  InvalidTokenError,
  NotFoundError,
} from "../../../domain/errors";
import { makeLogin } from "../login";
import { makeLogout } from "../logout";
import { makeMe } from "../me";
import { makeRefresh } from "../refresh";
import { makeRegister } from "../register";
import { makeVerifyEmail } from "../verifyEmail";
import { buildTestDeps, seedProfile, type TestDeps } from "./fakes";

describe("auth use-cases", () => {
  let deps: TestDeps;
  beforeEach(() => {
    deps = buildTestDeps();
  });

  describe("register", () => {
    it("creates a PENDING registration and sends a verification email", async () => {
      const register = makeRegister(deps);
      const res = await register({
        email: "new@example.com",
        password: "supersecret",
        fullName: "New Guard",
        shipName: "MV Test",
      });

      expect(res.status).toBe("PENDING");
      const pending = await deps.pending.findByEmail("new@example.com");
      expect(pending).not.toBeNull();
      // password ran through the hasher (fake hasher prefixes "hashed:")
      expect(pending!.passwordHash).toBe("hashed:supersecret");
      expect(pending!.verificationTokenHash).toBeTruthy();
      expect(deps.email.sent).toHaveLength(1);
      expect(deps.email.sent[0]!.to).toBe("new@example.com");
    });

    it("rejects an email already used by a profile", async () => {
      await seedProfile(deps, { email: "taken@example.com", password: "supersecret" });
      await expect(
        makeRegister(deps)({ email: "taken@example.com", password: "supersecret", fullName: "X" }),
      ).rejects.toBeInstanceOf(EmailTakenError);
    });

    it("rejects a duplicate pending email", async () => {
      const register = makeRegister(deps);
      await register({ email: "dup@example.com", password: "supersecret", fullName: "A" });
      await expect(
        register({ email: "dup@example.com", password: "supersecret", fullName: "B" }),
      ).rejects.toBeInstanceOf(EmailTakenError);
    });

    it("does not fail registration when email sending throws", async () => {
      deps.email.send = async () => {
        throw new Error("smtp down");
      };
      const res = await makeRegister(deps)({
        email: "resilient@example.com",
        password: "supersecret",
        fullName: "R",
      });
      expect(res.status).toBe("PENDING");
    });
  });

  describe("verifyEmail", () => {
    it("verifies with the correct token", async () => {
      // capture the token by intercepting email
      await makeRegister(deps)({
        email: "verify@example.com",
        password: "supersecret",
        fullName: "V",
      });
      const link = deps.email.sent[0]!.text!;
      const url = new URL(link.replace(/^.*?(https:\/\/)/, "$1"));
      const id = url.searchParams.get("id")!;
      const token = url.searchParams.get("token")!;

      const res = await makeVerifyEmail(deps)({ id, token });
      expect(res.verified).toBe(true);
      const pending = await deps.pending.findById(id);
      expect(pending!.emailVerifiedAt).not.toBeNull();
    });

    it("rejects a bad token", async () => {
      await makeRegister(deps)({
        email: "v2@example.com",
        password: "supersecret",
        fullName: "V2",
      });
      const pending = await deps.pending.findByEmail("v2@example.com");
      await expect(
        makeVerifyEmail(deps)({ id: pending!.id, token: "wrong-token" }),
      ).rejects.toBeInstanceOf(InvalidTokenError);
    });
  });

  describe("login", () => {
    it("issues tokens + user and creates a session", async () => {
      const profile = await seedProfile(deps, {
        email: "guard@example.com",
        password: "supersecret",
      });
      const res = await makeLogin(deps)({ email: "guard@example.com", password: "supersecret" });

      expect(res.user.id).toBe(profile.id);
      expect(res.user.email).toBe("guard@example.com");
      expect(res.tokens.accessToken.split(".")).toHaveLength(3); // JWT
      expect(res.tokens.refreshToken).toContain(".");
      expect(deps.sessions.rows.size).toBe(1);
    });

    it("rejects a wrong password", async () => {
      await seedProfile(deps, { email: "guard@example.com", password: "supersecret" });
      await expect(
        makeLogin(deps)({ email: "guard@example.com", password: "wrongpass1" }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("rejects an unknown email", async () => {
      await expect(
        makeLogin(deps)({ email: "nobody@example.com", password: "supersecret" }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("rejects a disabled account", async () => {
      await seedProfile(deps, {
        email: "off@example.com",
        password: "supersecret",
        enabled: false,
      });
      await expect(
        makeLogin(deps)({ email: "off@example.com", password: "supersecret" }),
      ).rejects.toBeInstanceOf(AccountDisabledError);
    });
  });

  describe("refresh", () => {
    it("rotates the refresh token and invalidates the old one", async () => {
      await seedProfile(deps, { email: "guard@example.com", password: "supersecret" });
      const login = await makeLogin(deps)({ email: "guard@example.com", password: "supersecret" });
      const refresh = makeRefresh(deps);

      const rotated = await refresh({ refreshToken: login.tokens.refreshToken });
      expect(rotated.refreshToken).not.toBe(login.tokens.refreshToken);

      // old refresh token must now fail
      await expect(refresh({ refreshToken: login.tokens.refreshToken })).rejects.toBeInstanceOf(
        InvalidTokenError,
      );

      // new one works
      const again = await refresh({ refreshToken: rotated.refreshToken });
      expect(again.accessToken).toBeTruthy();
    });

    it("rejects an expired session", async () => {
      await seedProfile(deps, { email: "guard@example.com", password: "supersecret" });
      const login = await makeLogin(deps)({ email: "guard@example.com", password: "supersecret" });
      deps.clock.advance(deps.config.refreshTtlSec * 1000 + 1);
      await expect(
        makeRefresh(deps)({ refreshToken: login.tokens.refreshToken }),
      ).rejects.toBeInstanceOf(InvalidTokenError);
    });

    it("rejects a malformed token", async () => {
      await expect(makeRefresh(deps)({ refreshToken: "garbage" })).rejects.toBeInstanceOf(
        InvalidTokenError,
      );
    });
  });

  describe("logout", () => {
    it("revokes the session so refresh fails afterwards", async () => {
      await seedProfile(deps, { email: "guard@example.com", password: "supersecret" });
      const login = await makeLogin(deps)({ email: "guard@example.com", password: "supersecret" });

      await makeLogout(deps)({ refreshToken: login.tokens.refreshToken });
      await expect(
        makeRefresh(deps)({ refreshToken: login.tokens.refreshToken }),
      ).rejects.toBeInstanceOf(InvalidTokenError);
    });

    it("is idempotent for garbage tokens", async () => {
      await expect(makeLogout(deps)({ refreshToken: "garbage" })).resolves.toBeUndefined();
    });
  });

  describe("me", () => {
    it("returns the user dto", async () => {
      const profile = await seedProfile(deps, {
        email: "guard@example.com",
        password: "supersecret",
      });
      const dto = await makeMe(deps)(profile.id);
      expect(dto.email).toBe("guard@example.com");
      expect(dto).not.toHaveProperty("passwordHash");
    });

    it("throws when the user is missing", async () => {
      await expect(makeMe(deps)("missing")).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
