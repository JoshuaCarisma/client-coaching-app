# Body By Carisma — Claude Code Context

## What This Project Is
A mobile-first health and fitness coaching platform. Trainerize-class feature set with three differentiators: a two-layer privacy journal, an adherence intelligence engine, and a client documentary feature. Built to serve Joshua's coaching practice first, then scale to a licensable multi-coach platform.

**Full architecture decisions, data models, schemas, and rationale:** @ARCHITECTURE.md
**Session progress and next steps:** @MEMORY.md

---

## Tech Stack (quick reference)

- **Mobile:** React Native + Expo SDK 53, custom dev client, Expo Router v3
- **Backend:** Hono (all services + BFFs), TypeScript strict, Zod at every boundary
- **Database:** Supabase Postgres + Supabase Storage
- **Auth:** Keycloak 26.2 via Phase Two (managed). Supabase Auth is NEVER used.
- **Jobs:** Inngest (all background work)
- **Transcription:** Deepgram (permanent, not a stopgap)
- **Chat:** Sendbird
- **Offline:** WatermelonDB synced to Supabase
- **Secrets:** Doppler (never in code or .env files committed to git)
- **Errors:** Sentry + Pino structured logging
- **Monorepo:** Turborepo + pnpm workspaces

---

## Critical Rules (violations block merges)

1. **Read ARCHITECTURE.md before any feature work.** Every schema, domain model, and product decision lives there.
2. **Auth and RBAC changes require explicit Joshua approval** before any implementation.
3. **Zod validation at every API/service boundary.** No trust of client data inside business logic.
4. **No secrets in code.** Doppler env vars only. Never commit `.env` files.
5. **Journal data and health data never touch the analytics pipeline.** Completely isolated.
6. **Private coach notes are coach-only at BFF route level.** Never in any client-facing response.
7. **Health-adjacent AI outputs require human review** before reaching clients.
8. **Never Expo Go.** Custom dev client only.
9. **Never Google Fit.** Health Connect for Android.
10. **Never direct production DB changes.** Supabase CLI migrations only, committed to git.

---

## Commands

```bash
# Install
pnpm install

# Mobile dev (custom dev client)
cd apps/mobile && npx expo start --dev-client

# Backend service dev
pnpm --filter services/training dev

# Run all tests
pnpm test

# Mobile E2E
maestro test

# Web E2E
npx playwright test

# Lint
pnpm lint

# Format
pnpm format

# Generate migration from schema changes
supabase db diff -f migration_name

# Apply migration to staging
supabase db push --project-ref STAGING_REF

# Run with secrets (local dev)
doppler run -- pnpm dev
```

---

## Coding Standards

- TypeScript strict mode throughout
- camelCase for variables/functions; PascalCase for components, types, interfaces; kebab-case for filenames
- Functions under 50 lines; split on complexity, not just length
- Explicit error handling — no silent catches
- Parameterize all DB queries — no raw SQL string interpolation
- Media access always abstracted behind a storage service interface — never call Supabase Storage directly from UI components

---

## Workflow Rules

- **Plan mode for all multi-file changes** before writing code
- Never commit with failing tests or lint errors
- One feature per branch — PRs must be focused and reviewable
- Ask before: DB migrations, mass deletes, storage bucket changes, force pushes, dropping tables
- Ask before adding any new dependency — state the reason and confirm no lighter alternative exists
- AI prompt changes must be versioned and reviewed — no silent prompt edits in production

---

## DO NOT USE (critical — see ARCHITECTURE.md Section 30 for full list)

| Tool | Use Instead |
|---|---|
| Expo Go | Custom dev client |
| Google Fit | Health Connect (Android) |
| MinIO | Supabase Storage |
| Matrix Synapse / Dendrite | Sendbird |
| faster-whisper | Deepgram |
| Self-hosted Keycloak | Phase Two managed Keycloak |
| Supabase Auth | Keycloak only |
| EC2 persistent workers | Inngest |
| SeaweedFS | Supabase Storage |
| PostHog | Internal analytics_events table |
| Cal.com | Internal calendar domain |
| ZITADEL | Keycloak via Phase Two |
