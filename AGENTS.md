# AGENTS.md

## Project Overview

ROBOPO is a scoring and calculation web application for the "Robosava" robotics competition held at Kodomo Tech Caravan events. It handles course scoring, result aggregation, and competition management (course/player/umpire registration).

## Repository Structure

Bun workspace monorepo with two packages:

- `@robopo/web` — Next.js web application (main app)
- `@robopo/docs` — Docusaurus documentation site

## Tech Stack

- Runtime: Bun
- Language: TypeScript (strict mode)
- Framework: Next.js 16 (App Router, `typedRoutes: true`)
- UI: React 19, Tailwind CSS 4, daisyUI 5
- Database: Neon Serverless Postgres via Drizzle ORM
- Authentication: Better Auth with username plugin
- Linter/Formatter: Biome
- Testing: Bun test (unit, happy-dom), Playwright (e2e)

## Key Conventions

### Code Style

- Biome enforces formatting and linting. Run `bun run check` before committing.
- Indent with spaces, no semicolons (ASI), sorted Tailwind classes (`useSortedClasses`).
- All comments in English. UI-facing strings (labels, messages) are in Japanese.
- Use `@/` path alias for imports within `@robopo/web` (maps to project root).

### Database

- Schema defined in `@robopo/web/app/lib/db/schema.ts` (single file for all tables including Better Auth).
- Drizzle config at `@robopo/web/drizzle.config.ts`.
- Apply schema changes with `bunx drizzle-kit push`.
- Seed data with `bun run db:seed`.
- Reserved course IDs: `-1` (THE Ippon Bashi), `-2` (Sensor Course).

### Authentication

- Better Auth configured in `@robopo/web/lib/auth.ts` with Drizzle adapter and schema.
- Auth client in `@robopo/web/lib/auth-client.ts`.
- API route at `@robopo/web/app/api/auth/[...all]/route.ts`.
- Sign-in via server action in `@robopo/web/app/components/server/auth.ts`.
- Session check in `@robopo/web/app/components/header/headerServer.tsx`.
- Route protection via `proxy.ts` (redirects unauthenticated users on `/config`, `/course`, `/player`, `/umpire`, `/summary`).
- `.env` must have `BETTER_AUTH_URL=http://localhost:3000` for local development.

### File Organization (`@robopo/web`)

```
app/
  @auth/           — Auth modal routes (parallel route)
  api/             — API route handlers
  challenge/       — Challenge/scoring pages
  config/          — Competition management
  course/          — Course list and editor
  player/          — Player management
  summary/         — Score aggregation and display
  umpire/          — Umpire management
  components/
    challenge/     — Scoring components
    common/        — Shared list/register/modal components
    course/        — Course editor, field, panel, mission components
    header/        — Header (client + server)
    home/          — Top page
    parts/         — Reusable UI parts
    server/        — Server actions (auth, db)
    summary/       — Summary utilities
  lib/
    db/            — Database (schema, queries, seed, migrations)
    const.tsx      — App-wide constants
lib/
  auth.ts          — Better Auth server config
  auth-client.ts   — Better Auth client config
```

### Commands

```bash
bun run dev          # Start Next.js dev server
bun run build        # Production build
bun run check        # Biome lint + format
bun run test:app     # Unit tests
bun run test:e2e     # Playwright e2e tests
bun run db:seed      # Seed database with test data
bun run docs-dev     # Start docs dev server
```
