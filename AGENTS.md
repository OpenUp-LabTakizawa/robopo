# AGENTS.md

## Project Overview

ROBOPO is a scoring and calculation web application for the "Robosava"
robotics competition held at Kodomo Tech Caravan events.
It handles course scoring, result aggregation, and competition management (course/player/umpire registration).

## Repository Structure

Bun workspace monorepo with two packages:

- `@robopo/web` — Next.js web application (main app)
- `@robopo/docs` — Docusaurus documentation site

## Tech Stack

- Runtime: Bun
- Language: TypeScript (strict mode)
- Framework: Next.js 16 (App Router, `typedRoutes: true`, `reactCompiler: true`, `cacheComponents: true`)
- UI: React 19, Tailwind CSS 4, daisyUI 5
- Database: PostgreSQL (node-postgres Pool) via Drizzle ORM
- Authentication: Better Auth with username plugin
- Linter/Formatter: Biome
- Testing: Bun test (unit, happy-dom), Playwright (e2e)

## Key Conventions

### Code Style

- Biome enforces formatting and linting. Run `bun lint:fix` before committing.
- Indent with spaces, no semicolons (ASI), sorted Tailwind classes (`useSortedClasses`).
- All comments in English. UI-facing strings (labels, messages) are in Japanese.
- Use `@/` path alias for imports within `@robopo/web` (maps to project root).

### React Compiler

- `reactCompiler: true` is enabled in `next.config.ts`.
- The React Compiler automatically memoizes components and computations.
- Do NOT use `useMemo`, `useCallback`, or `React.memo` — they are redundant.
- Write plain inline expressions for derived state and regular functions for handlers.

### Database

- DB client in `@robopo/web/lib/db/db.ts` (node-postgres Pool with Drizzle).
- Schema defined in `@robopo/web/lib/db/schema.ts` (single file for all tables including Better Auth).
- Queries organized in `@robopo/web/lib/db/queries/` (`queries.ts`, `insert.ts`, `update.ts`).
- Drizzle config at `@robopo/web/drizzle.config.ts`.
- Apply schema changes with `bunx drizzle-kit push`.
- Seed data with `bun db:seed`.

### Authentication

- Better Auth configured in `@robopo/web/lib/auth.ts` with Drizzle adapter and schema.
- Auth client in `@robopo/web/lib/auth-client.ts`.
- API route at `@robopo/web/app/api/auth/[...all]/route.ts`.
- Sign-in via server action in `@robopo/web/components/server/auth.ts`.
- Session check in `@robopo/web/components/header/headerServer.tsx`.
- Route protection via `proxy.ts` (redirects unauthenticated users on `/config`, `/course`, `/player`, `/judge`, `/summary`).
- `.env` must have `BETTER_AUTH_URL=http://localhost:3000` for local development.

### File Organization (`@robopo/web`)

```bash
app/
  @auth/           — Auth modal routes (parallel route)
  api/             — API route handlers
  challenge/       — Challenge/scoring pages
  config/          — Competition management
  course/          — Course list and editor
  judge/           — Judge management
  player/          — Player management
  summary/         — Score aggregation and display
actions/           — Server actions (auth)
components/
  challenge/       — Scoring components
  common/          — Shared list/register/modal components
  course/          — Course editor, field, panel, mission components
  header/          — Header (client + server)
  home/            — Top page
  parts/           — Reusable UI parts
  server/          — Server actions (auth, db)
  summary/         — Summary utilities
hooks/             — Custom React hooks
lib/
  auth.ts          — Better Auth server config
  auth-client.ts   — Better Auth client config
  db/              — Database (db client, schema, queries/, seed, migrations/)
  const.tsx        — App-wide constants
server/            — Server-only utilities (db connection)
```

### Commands

```bash
bun run dev          # Start Next.js dev server
bun run build        # Production build
bun run lint:fix     # Biome lint + format
bun run test:unit    # Unit tests
bun run test:e2e     # Playwright e2e tests
bun run db:seed      # Seed database with test data
bun run docs-dev     # Start docs dev server
```

### Post-Edit Checks

After completing code changes, always run the following and fix any errors before finishing:

1. `bun lint:fix --unsafe` — auto-fix lint and formatting issues
2. `bun test:unit` — ensure all unit tests pass
