# @smartpatrol/config

Shared configuration for SmartPatrol workspaces.

- `tailwind-preset.cjs` — Tailwind preset (brand colors, fonts) consumed by `apps/web`.

Base TypeScript config lives at the repo root (`tsconfig.base.json`) and ESLint config
at the root (`eslint.config.js`) so editor/CLI tooling resolves them without a build step.
