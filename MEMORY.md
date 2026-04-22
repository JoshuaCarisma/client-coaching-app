# Memory: Body By Carisma — Client Coaching Platform
Last updated: 2026-04-22 by Claude

---

## Current Status
**Phase:** Setup — Monorepo scaffolded
**Last worked on:** 2026-04-22
**Overall health:** On track

Monorepo fully scaffolded with Turborepo + pnpm workspaces. All 23 workspace projects
resolve cleanly (`pnpm install` confirmed). Two architectural decisions remain open
(event bus technology, BFF implementation technology) before service wiring can begin.
No app frameworks installed yet — structure only.

---

## Resume Here (Next Session Starts At)

- **Next task:** Bootstrap app frameworks into the scaffolded stubs — Expo (custom dev
  client) for `apps/mobile/`, Next.js for `apps/coach-web/` and `apps/admin-web/`.
  Then set up shared ESLint + Prettier config in `packages/config/` that all workspaces
  extend.
- **Branch:** `setup/app-frameworks` (create from master)
- **Relevant files:**
  - `apps/mobile/package.json` — Expo goes here; do NOT use Expo Go
  - `apps/coach-web/package.json` — Next.js goes here
  - `apps/admin-web/package.json` — Next.js goes here
  - `packages/config/package.json` — shared ESLint + Prettier config lands here
  - `tsconfig.base.json` — root; individual apps extend this
  - `CLAUDE.md` — `npx expo start --dev-client` is the mobile dev command
- **Decide before proceeding:**
  - Event bus technology (SQS vs Kafka vs Supabase Realtime) — needed before any
    service emits production events
  - BFF implementation (Express/Fastify/Hono) — needed before mobile-bff and coach-bff
    have any runtime code

---

## Decisions Log
Dated record of what was decided and why. Never delete entries — only add new ones.

| Date | Decision | Why | Tradeoff |
|---|---|---|---|
| 2026-04-21 | Monorepo over polyrepo | Tight coordination needed across apps, services, and shared packages from day one | More upfront tooling setup; service boundaries enforced by convention not deployment isolation |
| 2026-04-21 | Supabase Postgres + Storage for v1 | Real Postgres, RLS-backed storage, managed backups, resumable uploads without ops overhead | Platform dependency; migration to self-hosted later requires clean service boundary discipline |
| 2026-04-21 | Keycloak for auth | Complex role requirements (coach/client/admin/multi-org), HIPAA compliance path, OIDC-standard token flows | Significant operational complexity vs managed auth services |
| 2026-04-21 | Hybrid request-driven + event-driven architecture | Calendar, training, nutrition, journaling, analytics all need to react to same actions without tight coupling | Adds infrastructure complexity; requires disciplined event schema versioning |
| 2026-04-21 | Calendar service as cross-domain orchestration layer | Training and nutrition expose definitions; calendar sequences them into daily plans | Calendar becomes critical-path service; cross-service schema coordination required |
| 2026-04-21 | React Native + Expo prebuild (not Expo Go) | Native modules required for HealthKit, Health Connect, and media pipeline | Cannot use Expo Go; custom dev client required for all development |
| 2026-04-21 | Health Connect for Android (not Google Fit) | Google Fit APIs deprecated in 2026; Health Connect is the current Android standard | Legacy Android users on older OS versions may have limited Health Connect support |
| 2026-04-22 | Turborepo for monorepo build orchestration | Faster task graph execution, first-class pnpm support, simpler config than Nx for this project size | Nx has more plugins; Turborepo is the leaner choice given we own all service boundaries |
| 2026-04-22 | BFF pattern chosen: two gateways (mobile-bff, coach-bff) | Mobile and coach surfaces have different aggregation needs; one gateway would become a catch-all | Implementation technology (Express/Fastify/Hono) still pending |
| 2026-04-22 | services/video scaffolded as Phase 2 stub only | LiveKit integration is out of scope for MVP; reserved with README to avoid accidental feature creep | Full live-class and async recorded coaching features will require scoping session |
| ⏳ PENDING | Event bus technology | Need to decide before any service emits production events | Options: SQS, Kafka, Supabase Realtime, other |
| ⏳ PENDING | BFF implementation technology | express/Fastify/Hono — need to decide before mobile-bff and coach-bff have runtime code | Affects request middleware patterns and worker deployment model |

---

## Solved Problems & Gotchas

- **2026-04-21 Google Fit deprecation:** Google Fit APIs are being deprecated in 2026. 
  All new Android health integration must use Health Connect. Do not use Google Fit for 
  any new work — even if a library or tutorial references it.
- **2026-04-21 MinIO is archived:** MinIO's main repo was archived February 2026. Do not 
  use it for storage. Supabase Storage is the v1 choice; SeaweedFS is the future 
  escape hatch if volume or compliance demands it.
- **2026-04-21 Expo Go incompatibility:** Native modules (HealthKit, Health Connect, 
  media pipeline) require Expo prebuild / custom dev client. Expo Go will not work for 
  this project. Always start dev with `npx expo start --dev-client`.

---

## Current Tech Debt

- **2026-04-22 pnpm version pinned to 9.15.4 in package.json but not enforced via
  `.npmrc`** — should add `engine-strict=true` and `engines.pnpm` field when setting
  up shared config in `packages/config/`. Low risk now; will matter when CI comes online.
- **2026-04-22 No ESLint or Prettier config yet** — `turbo run lint` and `turbo run
  format` tasks exist but no actual config files. Must be created before any real code
  goes in, otherwise lint runs silently succeed without checking anything.

---

## What's Been Built

- 2026-04-21 ✅ CLAUDE.md — project config, coding standards, security rules, commands
- 2026-04-21 ✅ ARCHITECTURE.md — full system design, folder map, data flows, decisions
- 2026-04-21 ✅ GitHub repo initialized — `JoshuaCarisma/client-coaching-app`, public
- 2026-04-21 ✅ .claude/ setup — agents (code-reviewer, planner, security-reviewer), 
  commands (wrap-up), hooks (block-dangerous.sh), owasp-security skill
- 2026-04-22 ✅ pnpm-workspace.yaml — workspace roots: `apps/*`, `services/*`, `packages/*`
- 2026-04-22 ✅ turbo.json — Turborepo task graph: `build`, `dev`, `test`, `lint` with
  correct dependency and output config
- 2026-04-22 ✅ root package.json — monorepo root `bbc-platform`, turbo + typescript +
  prettier as devDeps; 23 workspace projects resolve cleanly via `pnpm install`
- 2026-04-22 ✅ tsconfig.base.json — strict TypeScript base config at root (all packages
  will extend this)
- 2026-04-22 ✅ apps/ scaffolded — `mobile`, `coach-web`, `admin-web`, `marketing-site`
  each with package.json stubs and `features/.gitkeep`
- 2026-04-22 ✅ services/ scaffolded — 12 services: `identity`, `calendar`, `training`,
  `nutrition`, `journaling`, `analytics`, `messaging`, `notifications`, `ingestion`,
  `video` (Phase 2 stub), `mobile-bff`, `coach-bff` — each with package.json + README.md
  describing ownership and boundaries
- 2026-04-22 ✅ packages/ scaffolded — `ui`, `schemas`, `types`, `api-client`,
  `health-sync`, `config` — each with package.json stub
- 2026-04-22 ✅ infra/ and docs/ directories created with `.gitkeep`

---

## What's Left to Build

**Setup**
- [ ] Resolve 2 remaining decisions (event bus technology, BFF implementation technology)
- [ ] Bootstrap Expo (custom dev client) in `apps/mobile/`
- [ ] Bootstrap Next.js in `apps/coach-web/` and `apps/admin-web/`
- [ ] Set up shared ESLint + Prettier configs in `packages/config/`
- [ ] Add `.npmrc` with `engine-strict=true` and pnpm engine constraint

**Phase 1 — MVP**
- [ ] Identity service + Keycloak setup
- [ ] Auth flow in mobile app (login, session, consent)
- [ ] Training service — exercise library, workout/program builder
- [ ] Workout player with timed engine
- [ ] Nutrition service — recipes, meal plans, adherence logging
- [ ] Journaling service — text/audio/video entry + upload pipeline
- [ ] Transcription + AI summary pipeline (faster-whisper + Haystack)
- [ ] Calendar/planning service — daily plan builder, schedule objects
- [ ] Analytics service — event ingestion + client dashboard graphs
- [ ] Messaging (Matrix Synapse integration)
- [ ] Notifications (Novu)
- [ ] HealthKit + Health Connect sync (packages/health-sync)
- [ ] Coach web app (program builder, client view)
- [ ] Admin web app (business analytics)
- [ ] API gateway / BFF layer

---

## People & Context

- **GitHub:** `github.com/JoshuaCarisma/client-coaching-app` — public repo, master branch
- **Supabase:** v1 database + storage — account setup needed before service work begins
- **Keycloak:** needs self-hosted instance or managed deployment configured before auth work
- **AWS:** core production hosting — account and IAM setup needed before infra work
- **Expo EAS:** mobile build pipeline — EAS account setup needed before first mobile build

---

## Session Notes

- 2026-04-21: Project scoped and documented. CLAUDE.md, ARCHITECTURE.md generated and 
  committed. GitHub repo live. Monorepo scaffold is next. Four architectural decisions 
  remain open (event bus, API gateway, monorepo tooling, video service structure).
- 2026-04-22: Monorepo scaffolded. Turborepo + pnpm workspaces configured. 23 workspace
  projects (4 apps, 12 services, 6 packages, root) resolve cleanly. All service READMEs
  written with ownership descriptions. Two decisions still open (event bus, BFF tech).
  Next: bootstrap app frameworks and shared lint/prettier config.