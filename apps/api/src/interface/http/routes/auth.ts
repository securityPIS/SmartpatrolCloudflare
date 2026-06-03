import { Hono } from "hono";
import {
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from "@smartpatrol/contracts";
import type { HonoEnv } from "../env";
import { requireAuth } from "../middleware/auth";

export const auth = new Hono<HonoEnv>();

auth.post("/register", async (c) => {
  const body = RegisterRequest.parse(await c.req.json());
  const data = await c.var.resolve().auth.register(body);
  return c.json({ ok: true, data }, 201);
});

auth.post("/verify-email", async (c) => {
  const body = VerifyEmailRequest.parse(await c.req.json());
  const data = await c.var.resolve().auth.verifyEmail(body);
  return c.json({ ok: true, data });
});

auth.post("/login", async (c) => {
  const body = LoginRequest.parse(await c.req.json());
  const data = await c.var.resolve().auth.login(body, c.req.header("User-Agent") ?? null);
  return c.json({ ok: true, data });
});

auth.post("/refresh", async (c) => {
  const body = RefreshRequest.parse(await c.req.json());
  const data = await c.var.resolve().auth.refresh(body);
  return c.json({ ok: true, data });
});

auth.post("/logout", async (c) => {
  const body = LogoutRequest.parse(await c.req.json());
  await c.var.resolve().auth.logout(body);
  return c.json({ ok: true, data: { loggedOut: true } });
});

auth.get("/me", requireAuth, async (c) => {
  const data = await c.var.resolve().auth.me(c.var.userId!);
  return c.json({ ok: true, data });
});
