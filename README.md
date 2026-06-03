# SmartPatrol — Full Cloudflare

Greenfield rebuild of SmartPatrol on the Cloudflare stack. The legacy Supabase app
(`smartpatrolnew`) keeps running in parallel and is **not** touched by this repo.

> Roadmap & decisions: [`docs/CLOUDFLARE_MIGRATION_PLAN.md`](docs/CLOUDFLARE_MIGRATION_PLAN.md)

## Stack

| Concern   | Tech                                                          |
| --------- | ------------------------------------------------------------- |
| Frontend  | React 19 + Vite + Tailwind + Zustand → **Cloudflare Pages**   |
| API       | **Cloudflare Workers** (Hono, clean architecture)             |
| Database  | **D1** (SQLite) + Drizzle ORM                                 |
| Storage   | **R2** (signed upload/GET)                                    |
| Realtime  | **Durable Objects** (`ShipChannel`, WebSocket hibernation)    |
| Auth      | Custom JWT (access + refresh), password hashing on the Worker |
| Push      | Firebase **FCM** (retained) via Worker → FCM HTTP v1          |
| Contracts | `zod` schemas shared web ⇄ api (`@smartpatrol/contracts`)     |

## Monorepo layout

```
apps/
  web/    @smartpatrol/web  — React SPA (Cloudflare Pages)
  api/    @smartpatrol/api  — Hono Worker (clean architecture)
packages/
  contracts/  @smartpatrol/contracts — zod DTO schemas (source of truth)
  db/         @smartpatrol/db        — Drizzle D1 schema + migrations
  config/     @smartpatrol/config    — shared config (tailwind preset, ...)
infra/      wrangler resource notes
docs/       planning & system map
```

Dependency rule (clean architecture, point inward only):
`interface / infrastructure → application → domain`.

## Getting started

```bash
corepack enable          # provides pnpm 10
pnpm install
pnpm typecheck           # type-check every workspace
pnpm test                # run unit tests
pnpm dev:api             # Worker on http://localhost:8787
pnpm dev:web             # SPA on http://localhost:5173
```

### Useful scripts

| Command            | What it does                           |
| ------------------ | -------------------------------------- |
| `pnpm build`       | Build deployable apps (`web`, `api`)   |
| `pnpm typecheck`   | `tsc --noEmit` across all workspaces   |
| `pnpm test`        | Vitest across all workspaces           |
| `pnpm lint`        | ESLint (flat config)                   |
| `pnpm format`      | Prettier write                         |
| `pnpm db:generate` | Drizzle migration generate from schema |

## Cloudflare resources (you provision these)

See `infra/README.md`. In short: create a D1 database, R2 bucket, KV namespace, and
a Pages project, then fill the placeholder IDs in `apps/api/wrangler.toml` and set
Worker secrets (`JWT_SECRET`, `FCM_SERVICE_ACCOUNT`, `RESEND_API_KEY`, ...).

## Status

Phase 0 (foundation & contracts) — in progress. See the migration plan for the full
phased roadmap.
