import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiError } from "@smartpatrol/contracts";
import type { HonoEnv } from "./env";
import { health } from "./routes/health";

export const app = new Hono<HonoEnv>();

app.use("*", logger());
app.use("*", cors());

// Routes
app.route("/", health);

app.notFound((c) => {
  const error: ApiError = { code: "NOT_FOUND", message: "Route not found" };
  return c.json({ ok: false, error }, 404);
});

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  const error: ApiError = { code: "INTERNAL", message: "Internal server error" };
  return c.json({ ok: false, error }, 500);
});
