# Body By Carisma — Project Memory

**Last Updated:** April 26, 2026
**Purpose:** Session-to-session continuity for Claude Code. Read this at the start of every session before touching any code.

---

## Current Project Status

**Phase:** Pre-build setup and schema implementation
**Environment:** Monorepo scaffolded and live at github.com/JoshuaCarisma/client-coaching-app
**Active developer:** Joshua Carisma (solo, non-technical, AI-assisted development via Claude Code)

---

## What Has Been Built (as of April 26, 2026)

### Scaffolding (confirmed live)
- Full monorepo scaffold: `apps/mobile`, `apps/coach-web`, `apps/admin-web`, `services/identity`, `services/training`, `services/mobile-bff`, `services/coach-bff`, plus stubs for analytics, calendar, journaling, messaging, notifications, nutrition, video
- Turborepo + pnpm workspaces configured

### Mobile Auth (complete)
- Full PKCE flow
- `Stack.Protected` navigation gate
- Consent screen
- Token storage via `expo-secure-store`
- `AuthContext` with `useReducer`

### Identity Service (complete)
- Hono + JWT middleware (`jose`/JWKS)
- Roles middleware
- `requireRole` guard
- Health route

### Supabase (partial — needs migration runner)
- `profiles` table exists: `id` (= Keycloak sub), `email`, `display_name`, `role`
- RLS policies (self-access + coach-read) — applied manually (pre-migration-runner era, do not repeat)
- **WARNING:** All future schema changes must go through `supabase db diff` → migration file → git

### Training Service (complete)
- Exercise library Hono routes: GET list with filters, GET by id, POST, PATCH, DELETE
- Zod validation at every boundary

### Packages
- `packages/schemas`: `UserIdentity`, `TokenClaims`, `Role` enum, `Exercise` schemas
- `packages/auth`: `AuthSession`, `parseTokenExpiry`, `buildSession`, `shouldRefresh`, `isTokenExpired`

---

## What Was Decided in This Session (April 24–26, 2026)

### Architecture Session 1 (April 24)
Resolved 17 architectural blindspots. Full decisions in ARCHITECTURE.md v1.0.
Key decisions:
- Org-mediated coach-client relationship model (supports solo, agency, platform)
- Invite-link-as-identity-contract (role assigned at link creation, never by user choice)
- 5-screen intake form with food preferences + equipment checklist
- Workout player: progressive overload pre-fill, coached substitution list, rest timer as guide not gate
- Cache-day's-plan offline strategy with WatermelonDB
- Nutrition: Protein + Veg + Carb + Sauce, no calories, no macros
- Two-layer journal: private raw entries + sentiment digest for coach
- Adherence Intelligence System with per-client tunable thresholds
- Documentary feature: timeline-addressable artifacts now, video compilation Phase 2
- Inngest (not EC2) for all background jobs
- Deepgram (not faster-whisper) for transcription, permanently
- Sendbird (not Matrix Synapse) for chat
- Phase Two (not self-hosted Keycloak) for auth
- Doppler for secrets, Sentry + Pino for observability
- Supabase CLI for migrations
- HIPAA not formally required at launch; HIPAA-adjacent security posture adopted

### Architecture Session 2 (April 26)
Added three new sections to ARCHITECTURE.md → v2.0:

**Check-In System (Section 10 extension)**
- Check-ins are a specialized habit subtype (`habit_type = 'check_in'`)
- Optional, client-controlled, calendar-placed like any habit
- Emoji interface (😔→😁) stored as integers 1-5
- Fields: energy, mood, soreness, sleep, optional custom coach prompt
- Feeds: coach dashboard wellness trend, Progress Memory Layer 1, Adherence Intelligence context

**Exercise Library Data Strategy (Section 16)**
- Primary seed: `free-exercise-db` (Unlicense/public domain)
- Secondary enrichment: `wger`, `exercemus/exercises`
- Long-term: BBC-produced coach-recorded clips
- Every exercise carries provenance fields: `source_name`, `license_code`, `attribution_text`, `media_rights_status`
- Search: tsvector full-text + trigram typo tolerance + GIN array indexes

**Health Metric Events (Section 17)**
- Generic `health_metric_events` table built now
- No Health Connect / HealthKit integration until attorney consultation
- Normalizes all wearable data regardless of source (Apple, Garmin, Whoop, Oura)

**Product Philosophy Addendum**
- Codified as Operating Principle 20 in ARCHITECTURE.md
- Trainerize research reviewed; three buckets identified: already decided, worth adding, deliberately skipping

**DO NOT USE List expanded**
- Added: SeaweedFS, PostHog, Cal.com, ZITADEL, vLLM, ExerciseDB API (unreviewed)
- CLAUDE.md corrected to remove all outdated references from prior version

---

## Immediate Next Actions (Priority Order)

### Must Do Before Any New Code

1. **Set up `bbc-platform-staging`** — second Supabase project, free tier
2. **Create Phase Two account** — provision `bbc-dev`, `bbc-staging`, `bbc-prod` realms
3. **Set up Doppler** — three configs: `dev`, `stg`, `prd`; migrate all secrets
4. **Create Inngest account** — install SDK in services
5. **Create Sendbird application** — Developer tier
6. **Create Deepgram account** — claim $200 free credit
7. **Set up Expo EAS account** — unblocks TestFlight / first device build
8. **Set up Sentry** — React Native + Node integrations
9. **Commit to migration file workflow** — no more direct production DB changes

### Schema Implementation (via migration files, in order)

**Batch 1 — Foundation**
- `organizations` table
- `profiles` extensions (org_id, is_self_directed, onboarding_completed, soft-delete cols)
- `coach_client_relationships`
- `invitations`

**Batch 2 — Client Data**
- `client_intake`
- `habits`, `habit_checks`, `check_in_configs`, `check_in_responses`
- `meal_plans`, `recipes`, `recipe_ingredients`, `ingredients`

**Batch 3 — Training**
- `exercises` with provenance fields
- `exercise_aliases`, `exercise_substitutions`
- `workout_sessions`, `workout_sets`

**Batch 4 — Journal & Analytics**
- `journal_entries`, `journal_artifacts`, `journal_transcriptions`
- `journal_sentiment_signals`, `journal_weekly_digests`, `journal_ai_summaries`, `journal_prompts`
- `analytics_events` with indexes
- `audit_log` (append-only)

**Batch 5 — Adherence & Progress**
- `active_flags`, `client_flag_settings`, `message_templates`
- `coach_notes`, `progress_reports`, `milestones`
- `timeline_artifacts`
- `health_metric_events` (table only)

**Batch 6 — Soft Delete**
- Add `deleted_at` + `deletion_type` to every user-data table

### Implementation Priorities (post-schema)

1. Keycloak invite-token carry-through (custom authenticator or pre-registration webhook) — **most complex, plan extra time**
2. BFF route-level RBAC for `coach_notes.is_private = true`
3. WatermelonDB schema mirroring + sync RPC functions
4. Supabase Storage upload via BFF-issued presigned URLs
5. Inngest functions: transcription pipeline, weekly digest, hourly adherence evaluator
6. Progressive overload pre-fill in workout session service
7. Import `free-exercise-db` as exercise seed

### Legal (before launch)
- Schedule 1-hour attorney consultation (healthcare/privacy attorney)
- Terms of service + privacy policy

---

## Key Decisions — Quick Reference

| Decision | Choice | Why |
|---|---|---|
| Org model | Org-mediated | Supports solo, agency, platform without migration |
| Client invite | Link carries role | No user choice = no support problems |
| Intake | 5 screens, ~3 min | Layer 1 only; Layer 2-3 via conversation |
| Workout logging | Pre-fill + confirm/edit | Progressive overload tracking = flagship |
| Rest timers | Guide not gate | Client autonomy within coach intent |
| Offline | Cache day's plan | Covers 95% of gym scenarios |
| Nutrition | Protein+Veg+Carb+Sauce | No calories, no prescription, no credential gate |
| Supplements | Habit domain | Removes from nutrition, sidesteps credentialing |
| Check-ins | Optional habit subtype | Client choice, not forced tracking |
| Journal privacy | Private by default | Honesty > access; sentiment digest preserves signal |
| AI summaries | Coach review required | Non-negotiable for health-adjacent outputs |
| Exercise data | free-exercise-db seed | Unlicense, clean, safe IP position |
| Transcription | Deepgram permanent | Cost-effective, no infrastructure |
| Chat | Sendbird | Matrix Synapse too complex for solo operator |
| Jobs | Inngest | No servers, no SSH, step functions, free tier |
| Auth | Keycloak via Phase Two | Managed = no 2am auth incidents |
| Secrets | Doppler | Single source, syncs everywhere |
| Errors | Sentry + Pino | Standard, free tier sufficient |
| Migrations | Supabase CLI | Tied to Supabase, right call at this stage |
| Staging | `bbc-platform-staging` | Free tier, separate from production |
| HIPAA | Not required at launch | But HIPAA-adjacent posture adopted |
| Deletion | Soft delete 30d → hard | Protects against accidents, legal compliance |
| Health sync | Table built, integration blocked | Attorney review first |
| Documentary | Data model now, compile Phase 2 | Foundation correct, Shotstack for video |

---

## Open Questions (not yet resolved)

- None currently. All blindspots from both sessions are resolved.

---

## Known Risks and Watch Items

| Risk | Mitigation |
|---|---|
| Keycloak invite-token implementation complexity | Plan 2-3x more time than expected. This is the most non-trivial implementation detail in the project. |
| Sendbird free tier: 20 peak concurrent connections | Acceptable for Phase 1 (1-20 clients). Monitor when scaling. |
| Supabase no HIPAA BAA | Not required at launch. Flag if clinic partnerships develop. |
| WatermelonDB schema drift | CI schema-sync test must be implemented alongside WatermelonDB setup. |
| Exercise media rights | Every asset needs provenance fields. Admin curation tool needed to manage replacement pipeline. |
| Documentary video composition | Shotstack integration is Phase 2. Don't start until Layers 1 and 2 of Progress Memory are live. |

---

## Session Log

| Date | Session Type | Key Output |
|---|---|---|
| April 24, 2026 | Architecture strategy (17 blindspots) | ARCHITECTURE.md v1.0 — all blindspots resolved |
| April 26, 2026 | Trainerize research + architecture extension | ARCHITECTURE.md v2.0 — added check-ins, exercise library strategy, health metrics, product philosophy; corrected CLAUDE.md |

---

*This file is updated at the end of every session. If starting a new Claude Code session, read ARCHITECTURE.md Section 29 (Immediate Action Items) first to understand current priorities.*
