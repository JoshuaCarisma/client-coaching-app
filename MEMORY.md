# Memory: Body By Carisma — Client Coaching Platform
Last updated: 2026-04-21 by Claude

---

## Current Status
**Phase:** Setup
**Last worked on:** 2026-04-21
**Overall health:** Needs decision

GitHub repo initialized and documentation committed. Monorepo folder structure not yet 
scaffolded. Four architectural decisions remain open before service wiring can begin.

---

## Resume Here (Next Session Starts At)

- **Next task:** Scaffold the monorepo folder structure per ARCHITECTURE.md — create 
  `apps/`, `services/`, `packages/`, `infra/`, `docs/` at root, then stub all 
  subdirectories including `apps/mobile/features/`, `apps/coach-web/`, `apps/admin-web/`, 
  all 9 service directories, and all 6 package directories
- **Branch:** `setup/monorepo-scaffold` (create from master)
- **Relevant files:** `ARCHITECTURE.md` (Folder Map section is the spec), `CLAUDE.md`
- **Known issue to handle first:** Four open decisions must be resolved before any 
  service code is written — see Decisions Log for pending items

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
| ⏳ PENDING | Event bus technology | Need to decide before any service emits production events | Options: SQS, Kafka, Supabase Realtime, other |
| ⏳ PENDING | API gateway implementation | Need to decide before multi-service wiring begins | Options: custom Express/Fastify BFF, AWS API Gateway, Kong |
| ⏳ PENDING | Monorepo tooling | Should be chosen before repo grows and build times become painful | Options: Turborepo vs Nx |
| ⏳ PENDING | Video service folder structure | services/video not yet scaffolded | Decide when LiveKit integration begins |

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

Nothing yet — no code written.

---

## What's Been Built

- 2026-04-21 ✅ CLAUDE.md — project config, coding standards, security rules, commands
- 2026-04-21 ✅ ARCHITECTURE.md — full system design, folder map, data flows, decisions
- 2026-04-21 ✅ GitHub repo initialized — `JoshuaCarisma/client-coaching-app`, public
- 2026-04-21 ✅ .claude/ setup — agents (code-reviewer, planner, security-reviewer), 
  commands (wrap-up), hooks (block-dangerous.sh), owasp-security skill

---

## What's Left to Build

**Setup**
- [ ] Resolve 4 pending architectural decisions (event bus, API gateway, monorepo tooling, video service)
- [ ] Scaffold monorepo folder structure per ARCHITECTURE.md
- [ ] Configure Turborepo or Nx (once tooling decision is made)
- [ ] Set up shared tsconfig, eslint, prettier configs in packages/config
- [ ] Initialize Expo mobile app in apps/mobile
- [ ] Add MEMORY.md to repo

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