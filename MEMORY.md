# Memory: Body By Carisma — Client Coaching Platform
Last updated: 2026-04-22 by Claude

---

## Current Status
**Phase:** Setup — App frameworks bootstrapped
**Last worked on:** 2026-04-22
**Overall health:** On track

Monorepo fully scaffolded and app frameworks installed. Expo (custom dev client) bootstrapped
in `apps/mobile/`, Next.js 15 (App Router) bootstrapped in `apps/coach-web/` and
`apps/admin-web/`. Shared ESLint flat config and Prettier config live in `packages/config/`.
`turbo run lint` and `turbo run format` both pass cleanly across all 22 workspaces.
All architectural decisions are now closed — ready for Identity service + Keycloak work
(requires explicit approval before any auth or RBAC changes).

---

## Resume Here (Next Session Starts At)

- **Next task:** Identity service + Keycloak setup. This requires explicit approval before
  implementation — do not begin auth or RBAC changes without confirming scope.
- **Branch:** create `setup/identity` from `master` (merge `setup/app-frameworks` first)
- **Relevant files:**
  - `services/identity/` — service stub, ready for runtime code
  - `services/mobile-bff/` — Hono (decided); wires to identity for token validation
  - `services/coach-bff/` — Hono (decided); wires to identity for token validation
  - `ARCHITECTURE.md` — auth flow design, role matrix, RBAC model
- **Before starting:** both Keycloak deployment and identity source of truth decisions are closed (see Decisions Log).

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
| 2026-04-22 | ✅ CLOSED — Event bus: Supabase Realtime (Phase 1) | Low ops overhead, already in the stack, sufficient for MVP event fan-out. Revisit if Phase 2 analytics load demands Kafka/SQS | Supabase Realtime has throughput ceilings; plan migration path before analytics scale |
| 2026-04-22 | ✅ CLOSED — BFF implementation: Hono | TypeScript-first, edge-compatible, minimal overhead, works on Node + Cloudflare Workers | Smaller ecosystem than Express; middleware patterns differ from Express conventions |
| 2026-04-22 | ✅ CLOSED — Keycloak deployment: Docker Compose (local dev only); managed service for staging/prod | Self-hosted AWS Keycloak adds ops overhead before product has traction; managed handles patching, HA, backups | Managed has vendor dependency and cost; self-hosted remains an option post-Series-A |
| 2026-04-22 | ✅ CLOSED — Identity source of truth: Keycloak owns identity, credentials, roles, token issuance | Single source prevents split-brain auth state; Supabase Auth is NOT used | Supabase stores profile data only (keyed on Keycloak `sub`); RLS policies accept Keycloak JWTs directly |

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
- **2026-04-22 eslint-visitor-keys Node version floor:** `eslint-visitor-keys@5.x`
  requires Node `^20.19.0 || ^22.13.0 || >=24`. Local Node is 22.11.0. Worked around
  via `pnpm.overrides` pinning `eslint-visitor-keys` to `^4.2.0`. CI must use
  Node >= 22.13.0 when this override is eventually removed.

---

## Current Tech Debt

- **2026-04-22 Node version mismatch:** Local dev is on Node 22.11.0; `eslint-visitor-keys@5.x`
  requires `^22.13.0`. Pinned to 4.x via pnpm override as a temporary workaround.
  Must upgrade local Node to ≥ 22.13.0 and remove the override before CI goes live.
- **2026-04-22 No ESLint or Prettier config yet (RESOLVED):** Shared configs now live
  in `packages/config/`. All 22 workspaces pass `turbo run lint` and `turbo run format`.
- **2026-04-22 pnpm engine-strict (RESOLVED):** `.npmrc` has `engine-strict=true`;
  root `package.json` has `engines.node` and `engines.pnpm` set.

---

## What's Been Built

- 2026-04-21 ✅ CLAUDE.md — project config, coding standards, security rules, commands
- 2026-04-21 ✅ ARCHITECTURE.md — full system design, folder map, data flows, decisions
- 2026-04-21 ✅ GitHub repo initialized — `JoshuaCarisma/client-coaching-app`, public
- 2026-04-21 ✅ .claude/ setup — agents (code-reviewer, planner, security-reviewer),
  commands (wrap-up), hooks (block-dangerous.sh), owasp-security skill
- 2026-04-22 ✅ pnpm-workspace.yaml — workspace roots: `apps/*`, `services/*`, `packages/*`
- 2026-04-22 ✅ turbo.json — Turborepo task graph: `build`, `dev`, `test`, `lint`, `format`
  with correct dependency and output config
- 2026-04-22 ✅ root package.json — monorepo root `bbc-platform`, engines field, pnpm override
- 2026-04-22 ✅ .npmrc — `engine-strict=true` enforced
- 2026-04-22 ✅ tsconfig.base.json — strict TypeScript base config at root
- 2026-04-22 ✅ apps/mobile/ — Expo SDK 52, expo-dev-client, app.json (com.bodybycarisma.mobile),
  tsconfig.json; dev command is `expo start --dev-client`; prebuild script wired
- 2026-04-22 ✅ apps/coach-web/ — Next.js 15, App Router, TypeScript, no /src dir, no Tailwind;
  app/layout.tsx + app/page.tsx stubs; next.config.ts; tsconfig.json
- 2026-04-22 ✅ apps/admin-web/ — same as coach-web; separate package with identical Next.js version
- 2026-04-22 ✅ packages/config/ — ESLint flat config (typescript-eslint v8) + Prettier config;
  exported as `@bbc/config/eslint` and `@bbc/config/prettier`
- 2026-04-22 ✅ All 22 workspaces wired — each has eslint.config.mjs extending @bbc/config,
  `"prettier": "@bbc/config/prettier"` in package.json, format + lint scripts
- 2026-04-22 ✅ `turbo run lint` — 22/22 workspaces pass; actually checks files
- 2026-04-22 ✅ `turbo run format` — 22/22 workspaces pass; Prettier runs across all

---

## What's Left to Build

**Setup**
- [x] Resolve 2 remaining decisions (event bus → Supabase Realtime, BFF → Hono)
- [x] Bootstrap Expo (custom dev client) in `apps/mobile/`
- [x] Bootstrap Next.js in `apps/coach-web/` and `apps/admin-web/`
- [x] Set up shared ESLint + Prettier configs in `packages/config/`
- [x] Add `.npmrc` with `engine-strict=true` and pnpm engine constraint
- [ ] Upgrade local Node to >= 22.13.0 and remove pnpm eslint-visitor-keys override

**Phase 1 — MVP**
- [ ] Identity service + Keycloak setup (requires explicit approval before auth/RBAC work)
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
- [ ] API gateway / BFF layer (Hono — mobile-bff + coach-bff)

---

## People & Context

- **GitHub:** `github.com/JoshuaCarisma/client-coaching-app` — public repo, master branch
- **Supabase:** v1 database + storage — account setup needed before service work begins
- **Keycloak:** Docker Compose for local dev (`infra/local/`); managed service for staging/prod. bbc realm defined in `infra/keycloak/bbc-realm.json`.
- **AWS:** core production hosting — account and IAM setup needed before infra work
- **Expo EAS:** mobile build pipeline — EAS account setup needed before first mobile build

---

## Session Notes

- 2026-04-21: Project scoped and documented. CLAUDE.md, ARCHITECTURE.md generated and
  committed. GitHub repo live. Monorepo scaffold is next. Four architectural decisions
  remain open (event bus, API gateway, monorepo tooling, video service structure).
- 2026-04-22 (session 1): Monorepo scaffolded. Turborepo + pnpm workspaces configured. 23
  workspace projects (4 apps, 12 services, 6 packages, root) resolve cleanly. All service
  READMEs written with ownership descriptions. Two decisions still open (event bus, BFF tech).
- 2026-04-22 (session 2): App frameworks bootstrapped. Expo SDK 52 in apps/mobile/,
  Next.js 15 in coach-web + admin-web. packages/config stands up shared ESLint flat config
  (typescript-eslint v8) + Prettier. All 22 workspaces wired and passing lint + format.
  Two architectural decisions closed (event bus = Supabase Realtime, BFF = Hono).
  Node version mismatch (22.11.0 vs required ≥22.13.0) worked around via pnpm override —
  must fix before CI. Next: Identity service + Keycloak (needs explicit approval).
