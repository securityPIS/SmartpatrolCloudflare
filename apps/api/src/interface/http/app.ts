import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import type { ApiError } from "@smartpatrol/contracts";
import { DomainError } from "../../domain/errors";
import { type Container, createContainer } from "./container";
import type { Env, HonoEnv } from "./env";
import { auth } from "./routes/auth";
import { health } from "./routes/health";
import { shipsRouter } from "./routes/ships";
import { usersRouter } from "./routes/users";
import { adminRouter } from "./routes/admin";

/** Factory for the container, overridable in tests. */
export type ContainerFactory = (env: Env) => Container;

export function createApp(getContainer: ContainerFactory = createContainer) {
  const app = new Hono<HonoEnv>();

  app.use("*", logger());
  app.use("*", cors());

  // Lazy DI: container is only built when a route actually resolves it,
  // so binding-free routes (e.g. /healthz) work without env/secrets.
  app.use("*", async (c, next) => {
    let cached: Container | undefined;
    c.set("resolve", () => (cached ??= getContainer(c.env)));
    await next();
  });

  app.route("/", health);
  app.route("/auth", auth);
  app.route("/ships", shipsRouter);
  app.route("/users", usersRouter);
  app.route("/admin", adminRouter);

  app.notFound((c) => {
    const error: ApiError = { code: "NOT_FOUND", message: "Route not found" };
    return c.json({ ok: false, error }, 404);
  });

  app.onError((err, c) => {
    if (err instanceof ZodError) {
      const error: ApiError = {
        code: "VALIDATION",
        message: "Invalid request body",
        details: err.flatten(),
      };
      return c.json({ ok: false, error }, 400);
    }
    if (err instanceof DomainError) {
      const error: ApiError = { code: err.code, message: err.message };
      return c.json({ ok: false, error }, err.status as 400);
    }
    console.error("Unhandled error:", err);
    const error: ApiError = { code: "INTERNAL", message: "Internal server error" };
    return c.json({ ok: false, error }, 500);
  });

  return app;
}

export const app = createApp();
