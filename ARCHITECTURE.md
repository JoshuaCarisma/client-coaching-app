# Body By Carisma — Product Architecture Decisions Document

**Version:** 2.0
**Date:** April 26, 2026
**Status:** Source of Truth — All Development Sessions
**Owner:** Joshua Carisma
**Supersedes:** v1.0 (April 24, 2026)

---

## How to Use This Document

This is the architectural source of truth for Body By Carisma. Every coding session, every product decision, every infrastructure choice references this document before any implementation begins. If a decision here is challenged in a future session, name the conflict explicitly and resolve it before writing code.

**Format:** Each section follows Decision → Rationale → Schema → Edge Cases. Use the Table of Contents for quick reference during development sessions.

---

## Table of Contents

1. [Product North Star & Philosophy](#1-product-north-star--philosophy)
2. [Tech Stack — Final Confirmed](#2-tech-stack--final-confirmed)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Coach-Client Relationship Model](#4-coach-client-relationship-model)
5. [Onboarding Flow](#5-onboarding-flow)
6. [Intake Form Specification](#6-intake-form-specification)
7. [Workout Player Design](#7-workout-player-design)
8. [Offline Strategy](#8-offline-strategy)
9. [Nutrition Domain](#9-nutrition-domain)
10. [Habit & Check-In System](#10-habit--check-in-system)
11. [Progress Memory](#11-progress-memory)
12. [The Documentary Feature](#12-the-documentary-feature)
13. [Journal Entry Data Model](#13-journal-entry-data-model)
14. [Analytics Event Catalog](#14-analytics-event-catalog)
15. [Adherence Intelligence System](#15-adherence-intelligence-system)
16. [Exercise Library Data Strategy](#16-exercise-library-data-strategy)
17. [Health Metric Events](#17-health-metric-events)
18. [File Upload Pipeline](#18-file-upload-pipeline)
19. [Background Job Infrastructure](#19-background-job-infrastructure)
20. [Environment Strategy](#20-environment-strategy)
21. [Migration Runner](#21-migration-runner)
22. [Secrets Management](#22-secrets-management)
23. [Error Monitoring & Observability](#23-error-monitoring--observability)
24. [Authentication & Identity](#24-authentication--identity)
25. [HIPAA Assessment](#25-hipaa-assessment)
26. [Right-to-Deletion Design](#26-right-to-deletion-design)
27. [Cost Model & Scaling Triggers](#27-cost-model--scaling-triggers)
28. [Operating Principles](#28-operating-principles)
29. [Immediate Action Items](#29-immediate-action-items)
30. [DO NOT USE List](#30-do-not-use-list)
31. [Document History](#31-document-history)

---

## 1. Product North Star & Philosophy

### Five Pillars

| Pillar | What It Means |
|---|---|
| **Planning** | Coach builds programs, meal plans, habits; client sees structure on calendar |
| **Execution** | Client follows the plan with low-friction tools (workout player, meal logging, habit checks) |
| **Adherence** | System captures whether the plan was followed; surfaces drift early |
| **Reflection** | Client journals; AI processes; coach gains insight without violating privacy |
| **Progress Memory** | Platform remembers and narrates the client's transformation over time |

**The calendar is the operational center.** Every domain resolves to a calendar item with a checkmark. Every feature decision passes through this filter:

> **"Does this reduce friction for clients or give coaches more meaningful signal?"**

If it does neither, it does not ship.

### Three Strategic Product Visions

| Vision | Description | Status |
|---|---|---|
| **BBC V1** | Joshua's personal coaching practice, solo coach + clients | Building now |
| **BBC Agency** | Multi-coach business under Body By Carisma brand | Architected for, dormant |
| **BBC Platform** | Other coaches license BBC to run their own coaching businesses | Architected for, near-term |

The data model supports all three from day one. No migration required to move between them.

### BBC's Differentiators

| Feature | Why It Matters |
|---|---|
| **The Documentary** | Year-end AI-composed highlight reels. No competitor does this. |
| **Two-Layer Journal** | Client privacy preserved while coach gains sentiment signal. More sophisticated than most clinical tools. |
| **Adherence Intelligence** | Per-client tunable flags with auto-message intervention. Catches drift before it becomes a slide. |
| **Preference-Driven Nutrition** | Protein + Veg + Carb + Sauce. Sidesteps the calorie/macro genre entirely. |
| **Progressive Overload Pre-fill** | Workout player remembers last performance and pre-fills the next session. |
| **Flexible Check-Ins** | Client-controlled wellness tracking — mood, energy, soreness — on their terms. |

### Product Philosophy (Codified)

> *"We are looking towards the future with this build, while staying grounded in the truths of health, fitness, change management, goal setting, planning, tracking, psychology, and technical integration."*

This is BBC's product filter. Every feature must be traceable to a real human truth about behavior change. When a proposed feature cannot be traced to a human truth, it waits.

**The coach is not a gatekeeper. The coach is an amplifier.** A coached client and a self-directed client have access to the same core tools. Coaches add personalization, prescription, accountability, and human intelligence on top of a fully functional self-service experience. The permission model is **additive, not restrictive.**

---

## 2. Tech Stack — Final Confirmed

### Language & Runtime
- **TypeScript** throughout — strict mode, typed interfaces at all module boundaries
- **Node.js** for all services

### Mobile
- **React Native + Expo SDK 53** — custom dev client only (NEVER Expo Go)
- **Expo Router v3** with `Stack.Protected` for navigation
- **expo-secure-store** for token storage
- **WatermelonDB** for offline-first local storage with Supabase sync

### Web Surfaces
- **Next.js** — `apps/coach-web` and `apps/admin-web`
- **Vercel** — web hosting only

### Backend Services
- **Hono** — all backend services and BFFs
- **Zod** — validation at every API/service boundary (no exceptions)
- Service-to-service via shared contracts in `packages/schemas` only

### Database & Storage
- **Supabase Postgres** — primary database
- **Supabase Storage** — file storage (permanent choice, replaces MinIO)
- **Supabase Realtime** — Phase 1 event bus
- **Supabase CLI** — all migrations

### Authentication & Identity
- **Keycloak 26.2** — sole identity system, PKCE S256
- **Phase Two** — managed Keycloak host, one realm per environment
- Roles: `coach`, `client`, `admin`
- **Supabase Auth is never used**

### Background Jobs
- **Inngest** — all background workflows
- Free tier: 50,000 runs/month (covers Phase 1 entirely)

### Transcription
- **Deepgram** — permanent choice, not a stopgap
- ~$0.0077/min, $200 free credit at signup, per-second billing

### Messaging / Chat
- **Sendbird** — Developer tier (1,000 MAU free, unlimited messages)

### Notifications
- **Novu**

### Video (Phase 2)
- **LiveKit**

### AI Layer
- **Deepgram** — transcription
- **Haystack** — RAG-style processing of journal/coaching context
- All AI pipelines isolated from product analytics pipelines

### Observability
- **Sentry** — error monitoring, mobile + all services
- **Pino** — structured logging in `packages/config`

### Secrets
- **Doppler** — single source of truth, syncs to all environments

### Monorepo / Build
- **Turborepo + pnpm workspaces**

### Hosting
- **AWS** — production services (managed posture — no SSH-required infrastructure)
- **Vercel** — web surfaces only

### Testing
- **Jest + React Native Testing Library** — mobile unit/integration
- **Maestro** — mobile E2E
- **Playwright** — web/admin E2E
- **Vitest** — backend/web package unit tests

### Production Posture
- Services use `service_role` key for database access in Phase 1
- RLS is defense-in-depth only in Phase 1
- BFF layer is the primary authorization boundary

---

## 3. Monorepo Structure

```
client-coaching-app/
├── apps/
│   ├── mobile/                    # React Native + Expo
│   ├── coach-web/                 # Next.js coach dashboard
│   └── admin-web/                 # Next.js admin panel
├── services/
│   ├── mobile-bff/                # Hono BFF for mobile
│   ├── coach-bff/                 # Hono BFF for coach web
│   ├── identity/                  # Auth, profiles, org management
│   ├── training/                  # Exercise library, workouts, programs
│   ├── calendar/                  # Standalone orchestration domain
│   ├── journaling/                # Entries, transcription, AI pipeline
│   ├── nutrition/                 # Recipes, meal plans, adherence
│   ├── analytics/                 # Event aggregation, dashboards
│   ├── messaging/                 # Sendbird integration
│   ├── notifications/             # Novu integration
│   └── video/                     # LiveKit (Phase 2)
├── packages/
│   ├── schemas/                   # Shared Zod schemas, TypeScript types
│   ├── auth/                      # Auth utilities (parseTokenExpiry, etc.)
│   ├── config/                    # ESLint, Prettier, Pino logger
│   └── db/                        # Supabase client, query helpers
├── supabase/
│   ├── migrations/                # All schema migrations (version-controlled)
│   ├── functions/                 # Supabase Edge Functions
│   ├── seed.sql
│   └── config.toml
└── docs/
    ├── ARCHITECTURE.md            # This file
    ├── MEMORY.md                  # Session progress log
    └── CLAUDE.md                  # AI coding agent context (repo root copy)
```

---

## 4. Coach-Client Relationship Model

### Decision

**Org-mediated model with "Solo Org" as the default.** Every coach owns an organization. A solo coach is an org with one coach. A multi-coach business is an org with multiple coaches. A licensed BBC platform tenant is their own org. The data model is identical across all three — only row counts differ.

### Schema

```sql
CREATE TABLE organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  plan_tier       text NOT NULL CHECK (plan_tier IN ('solo', 'agency', 'enterprise')) DEFAULT 'solo',
  owner_id        uuid NOT NULL,
  branding_json   jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id                    uuid PRIMARY KEY,           -- = Keycloak sub
  email                 text NOT NULL,
  display_name          text,
  role                  text NOT NULL CHECK (role IN ('coach', 'client', 'admin')),
  organization_id       uuid REFERENCES organizations(id),
  is_self_directed      boolean NOT NULL DEFAULT false,
  onboarding_completed  boolean NOT NULL DEFAULT false,
  avatar_url            text,
  timezone              text DEFAULT 'America/Los_Angeles',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  deletion_type         text CHECK (deletion_type IN ('user_requested', 'coach_archived', 'admin_removed'))
);

ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_owner FOREIGN KEY (owner_id) REFERENCES profiles(id);

CREATE TABLE coach_client_relationships (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  coach_id          uuid NOT NULL REFERENCES profiles(id),
  client_id         uuid NOT NULL REFERENCES profiles(id),
  status            text NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'archived')) DEFAULT 'pending',
  started_at        timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  -- Phase 1: one coach per client. Remove for Phase 2 multi-coach + add `domain` column
  CONSTRAINT unique_active_coach_client UNIQUE (coach_id, client_id)
);
```

### Scenario Coverage

| Scenario | How It Works |
|---|---|
| Joshua coaching his clients | BBC org. Joshua = coach. Clients in `coach_client_relationships` |
| Self-directed client | `is_self_directed = true`, no relationship row, still in BBC org |
| Another coach buys the platform | New org provisioned on signup, they are the owner |
| BBC hires a second coach | New profile, `role = coach`, same `organization_id` |
| Multi-coach per client (Phase 2) | Drop `unique_active_coach_client`, add `domain` column |

### Edge Cases

- **Client transferred:** New relationship row, old row gets `ended_at = now(), status = 'archived'`
- **Coach leaves org:** Client relationships archived; admin reassigns
- **Self-directed client upgrades to coached:** Set `is_self_directed = false`, create relationship row
- **Coaching ends:** Client drops to `is_self_directed = true`. Retains all data and org content access. **Never hostage-ware.**

---

## 5. Onboarding Flow

### Coach Onboarding — Self-Serve with Auto-Provisioned Org

On signup:
1. Keycloak account created with `role = coach`
2. `organizations` row auto-provisioned with coach as `owner_id`
3. `profiles` row created with `organization_id = new_org.id`
4. Redirected to progressive setup checklist

**Progressive Setup Checklist (first login):**
1. ☐ Complete coach profile (name, photo, bio, credentials)
2. ☐ Customize branding (logo, brand color, optional custom domain)
3. ☐ Build first program (or import from template library)
4. ☐ Create first invite link
5. ☐ Invite first client

### Client Connection — Invite Link as Identity Contract

**Link structure:** `https://app.bodybycarisma.com/invite/{org-slug}/{type}/{token}`

Where `{type}` is `coach`, `client`, or `self-directed`. The user never chooses their role.

**Token lifecycle:** Cryptographically random, single-use, 30-day expiry, stored in `invitations` table.

**Fallback:** 6-character coach code (e.g., `BBC4H9`) for in-person scenarios.

```sql
CREATE TABLE invitations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id),
  issued_by           uuid NOT NULL REFERENCES profiles(id),
  invite_type         text NOT NULL CHECK (invite_type IN ('coach', 'client', 'self_directed')),
  token               text UNIQUE NOT NULL,
  short_code          text UNIQUE,
  intended_email      text,
  expires_at          timestamptz NOT NULL,
  used_at             timestamptz,
  used_by_profile_id  uuid REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);
```

### Keycloak Invite Token Implementation Note

The invite token must be carried through the PKCE registration flow via a Keycloak custom authenticator or pre-registration webhook. On first login post-registration:
1. Resolve token → set Keycloak role
2. Insert `profiles` row with correct `organization_id` and `is_self_directed`
3. Insert `coach_client_relationships` row if applicable
4. Mark invitation as used

**This is non-trivial. Captured as an early-build action item.**

### Client First Login

**Step 1:** Intake Form (5 screens, ~3 min) — see Section 6. Profile not "complete" until submitted.

**Step 2:** Immediate self-service access. Client can:
- View calendar
- Browse and start org content library programs
- Build ad-hoc workouts
- Track habits, plan meals, create journal entries, message their coach

Banner: *"Your coach is reviewing your intake and will customize your plan soon. Until then, feel free to explore."* Disappears on first coach action.

---

## 6. Intake Form Specification

### Three-Layer Data Collection

| Layer | When | What |
|---|---|---|
| **Layer 1 — Intake form** | Before first home screen | Name, goals, equipment, food preferences, priority ratings |
| **Layer 2 — Coach conversation** | First message / call | Barriers, current eating, life context |
| **Layer 3 — Progressive** | Over time, behaviorally | Adherence patterns, true preferences |

### Five Screens (~3 minutes)

**Screen 1 — About You:** First name, last name, DOB (all required), profile photo (optional)

**Screen 2 — Your Goals:**
- Priority ratings 1-5: Weight Loss / Strength Gain / Muscle Gain / Mobility / Posture
- 3-month goal (free text)
- 1-year goal (free text)

**Screen 3 — Your Background:**
- Past physical activity (multi-select + "other" free text)
- Self-rated fitness level: beginner / intermediate / advanced

**Screen 4 — Your Setup:**
- Equipment access (fixed platform checklist): barbell, dumbbells, cables, squat rack, bench, pull-up bar, resistance bands, kettlebells, cardio machines, bodyweight only, full commercial gym
- Food preferences (informs nutrition AI): preferred proteins, vegetables, carbs, sauces / flavor profiles, dietary restrictions + allergies

**Screen 5 — One Last Thing:**
*"What is the most important thing we can do for you?"* — full screen, free text only. Nothing competes for attention. This is the most emotionally honest data point in the system. **Always visible on coach's client overview.**

### Storage Schema

```sql
CREATE TABLE client_intake (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                     uuid NOT NULL UNIQUE REFERENCES profiles(id),
  priority_weight_loss          integer CHECK (priority_weight_loss BETWEEN 1 AND 5),
  priority_strength             integer CHECK (priority_strength BETWEEN 1 AND 5),
  priority_muscle               integer CHECK (priority_muscle BETWEEN 1 AND 5),
  priority_mobility             integer CHECK (priority_mobility BETWEEN 1 AND 5),
  priority_posture              integer CHECK (priority_posture BETWEEN 1 AND 5),
  three_month_goal              text,
  one_year_goal                 text,
  past_activities               text[],
  past_activities_other         text,
  self_rated_fitness_level      text CHECK (self_rated_fitness_level IN ('beginner', 'intermediate', 'advanced')),
  equipment_access              text[],
  preferred_proteins            text[],
  preferred_vegetables          text[],
  preferred_carbs               text[],
  preferred_sauces              text[],
  dietary_restrictions          text[],
  dietary_restrictions_other    text,
  most_important_thing          text NOT NULL,
  completed_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);
```

### Shared Schema Constants in `packages/schemas`

```typescript
export const EQUIPMENT_OPTIONS = [
  'barbell', 'dumbbells', 'cables', 'squat_rack', 'bench',
  'pull_up_bar', 'resistance_bands', 'kettlebells',
  'cardio_machines', 'bodyweight_only', 'full_commercial_gym'
] as const;

export const GOAL_PRIORITY_CATEGORIES = [
  'weight_loss', 'strength', 'muscle', 'mobility', 'posture'
] as const;
// Used by: intake form UI, program recommendation engine, coach dashboard, AI meal suggestion context
```

**Architectural implication:** Priority ratings are stored as discrete integers (1-5), not display text. The recommendation engine reads them directly.

---

## 7. Workout Player Design

### Design Philosophy

A **state machine that respects client autonomy.** The coach prescribes intent. The client executes within that intent. Timers inform — they do not control.

```
not_started → warmup → exercise_active → rest_timer → exercise_active → ... → completed
```

### Two Session Types

| Type | Source | Key Fields |
|---|---|---|
| **Assigned session** | Coach-programmed | `program_id` and `template_id` populated |
| **Client session** | Client-built ad-hoc | `program_id = null`; optionally saved as personal `workout_template` with `visibility = private` |

Both use the same logging interface, same analytics events, same data model. Only origin differs.

### Progressive Overload Pre-fill (Flagship Feature)

Each set pre-fills with:
- **First-ever attempt:** Coach's prescribed weight and reps
- **Subsequent attempts:** Client's last logged performance on that exercise

Client confirms (taps) or edits. This is progressive overload tracking — the highest-value retention feature in any training app. The workout session service **must query last session's logged sets at session-start.** This is a first-class data requirement.

### Rest Timers — Guide, Not Gate

- Coach sets default rest period per exercise in the template
- Timer counts down and rings — client starts next set whenever ready
- No UI block, no confirmation required
- Rest adherence is passive coaching signal, not enforcement

### RPE — One Rating at Submission

- Overall RPE per workout (not per set)
- 1-10 scale, **skippable** — zero friction if client doesn't engage

### Pause / Resume

- App closed mid-workout → session stays `active` on server
- Client returns → resumes silently, no prompt
- Wall-clock time (`duration_seconds`) logged. Consistently long sessions for a 45-min program = coaching conversation, not error.

### Exercise Substitution — Coached List Only

- Coach pre-defines substitutions per exercise in the library
- Client can swap from **coached list only** (not full database)
- Substitution logged: `was_substitution = true, original_exercise_id = ...`
- For ad-hoc client sessions: full library access (different scenario)

### Demo Video — On-Demand Modal

"Demo" button on every exercise screen slides up a video modal over the logging screen. Easy to dismiss. Videos pre-cached on program assignment for offline access.

### Screen Flow

1. Pre-workout: title, estimated time, exercise list, "Start Workout"
2. Exercise active: name, set #, pre-filled weight/reps, "Demo", "Complete Set", rest timer
3. Rest overlay: countdown, "Skip Rest", next exercise preview
4. Substitution modal: coached options, "Use This Instead"
5. Submit: summary (volume, sets, duration), RPE slider (skippable), notes, "Finish"
6. Completion: celebration state, "View in calendar" CTA

### Schema

```sql
CREATE TABLE workout_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES profiles(id),
  organization_id       uuid NOT NULL REFERENCES organizations(id),
  template_id           uuid REFERENCES workout_templates(id),
  program_id            uuid REFERENCES programs(id),
  scheduled_date        date,
  status                text NOT NULL CHECK (status IN ('scheduled', 'active', 'completed', 'abandoned')) DEFAULT 'scheduled',
  started_at            timestamptz,
  completed_at          timestamptz,
  duration_seconds      integer,
  overall_rpe           integer CHECK (overall_rpe BETWEEN 1 AND 10),
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

CREATE TABLE workout_sets (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id           uuid NOT NULL REFERENCES exercises(id),
  set_index             integer NOT NULL,
  prescribed_reps       integer,
  prescribed_weight_kg  numeric(6,2),
  logged_reps           integer,
  logged_weight_kg      numeric(6,2),
  was_substitution      boolean NOT NULL DEFAULT false,
  original_exercise_id  uuid REFERENCES exercises(id),
  completed_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sets_exercise ON workout_sets(exercise_id, completed_at DESC); -- last-performance lookup
```

---

## 8. Offline Strategy

### Decision: Cache the Day's Plan at App Open

WatermelonDB as the local store. Sync to Supabase on reconnect.

| Feature | Offline Behavior |
|---|---|
| Today's assigned workout | ✅ Pre-cached at app open |
| Exercise demo videos | ✅ Cached on program assignment |
| Workout logging (sets, RPE, substitutions) | ✅ Queued locally, sync on reconnect |
| Recent sessions (7 days) | ✅ Cached |
| Habit checks (today) | ✅ Offline |
| Meal adherence checks (today) | ✅ Offline |
| Check-in responses (today) | ✅ Offline |
| Messaging | ❌ Requires connectivity |
| Journaling | ❌ Requires connectivity (uploads) |
| Exercise library browsing | ⚠️ Cached subset (recently used + favorites) |
| Program changes / new assignments | ❌ Requires connectivity |

### Sync Model

- WatermelonDB → Supabase via two Postgres RPC functions: `sync_pull_changes()` and `sync_push_changes()`
- Triggered on: app foreground + network reconnect
- Conflict resolution: **last-write-wins** (acceptable — coaches don't edit client logs)

### Implementation Notes

- CI schema-sync test verifies WatermelonDB local schema and Supabase schema don't drift
- Reference: https://supabase.com/blog/react-native-offline-first-watermelon-db

---

## 9. Nutrition Domain

### Atomic Meal Unit

```
Protein + Vegetable + Carb + Sauce = A Meal
```

No calories required. No macros required. No dietitian credential required.

### Domain Model

```
Ingredients → Recipes → Meal Plans → Meal Adherence
```

### Recipe Sources

| Source | Description | Permissions |
|---|---|---|
| Org content library | Coach-created, org-wide | Read access for all org members |
| AI-suggested | Generated from intake food preferences | Client accepts → added to personal book |
| Self-created | Client-invented | Private by default; shareable back to org with coach approval |

### Meal Adherence Logging

Client (or coach) plans meals on calendar in advance. On the day: meal appears as calendar item → client taps checkmark. **Binary — no deviation logging.** The question is: did you have your planned meal?

### AI Meal Suggestion

Prompt context: intake food preferences + Protein/Veg/Carb/Sauce framework + optional "what's in my fridge." Output: suggested meal combinations → client accepts/rejects/edits → added to personal recipe book.

### Schema

```sql
CREATE TABLE ingredients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),  -- null = platform-defined
  category        text NOT NULL CHECK (category IN ('protein', 'vegetable', 'carb', 'sauce', 'other')),
  name            text NOT NULL,
  display_unit    text NOT NULL DEFAULT 'serving',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE recipes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  created_by      uuid NOT NULL REFERENCES profiles(id),
  source          text NOT NULL CHECK (source IN ('coach_library', 'ai_suggestion', 'self_created')),
  name            text NOT NULL,
  description     text,
  visibility      text NOT NULL CHECK (visibility IN ('public_to_org', 'coach_assigned_only', 'private')) DEFAULT 'private',
  prep_time_min   integer,
  instructions    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE TABLE recipe_ingredients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id       uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id   uuid NOT NULL REFERENCES ingredients(id),
  quantity        text  -- "1 cup", "200g" — display string, not parsed
);

CREATE TABLE meal_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  scheduled_date  date NOT NULL,
  meal_slot       text NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id       uuid REFERENCES recipes(id),
  custom_text     text,
  checked_off     boolean NOT NULL DEFAULT false,
  checked_at      timestamptz,
  created_by      uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### Credentialing — Deferred

Not required at launch. The model is preference-driven, not prescriptive. Credentialing schema is added only when macro/calorie prescription features are built.

---

## 10. Habit & Check-In System

### Habit System

**Habits are a generic behavior-tracking domain.** They do not care what the behavior is. Supplements, water intake, morning walks, meditation, creatine, medication — all habits. This removes supplements from the nutrition domain and sidesteps any credentialing concerns.

```sql
CREATE TABLE habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  created_by      uuid NOT NULL REFERENCES profiles(id),
  habit_type      text NOT NULL DEFAULT 'binary' CHECK (habit_type IN ('binary', 'check_in', 'quantitative')),
  name            text NOT NULL,
  description     text,
  frequency       text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  custom_rrule    text,  -- iCal RRULE for custom frequency
  active          boolean NOT NULL DEFAULT true,
  archived_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE habit_checks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id        uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES profiles(id),
  checked_date    date NOT NULL,
  checked_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, checked_date)
);
```

### Check-In System

**Check-ins are a specialized habit with a structured rating payload instead of a binary checkmark.** They are optional, client-controlled, configurable in frequency, and surface on the calendar exactly like any other habit. A client who doesn't want to track mood never sees a mood prompt.

**UI principle:** Emoji faces (😔 😐 🙂 😊 😁) stored as integers 1-5. Two-second interaction, no cognitive friction.

**Frequency mirrors habits:** Daily, weekly, custom RRULE — same model, no new infrastructure.

```sql
CREATE TABLE check_in_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id        uuid NOT NULL UNIQUE REFERENCES habits(id) ON DELETE CASCADE,
  track_energy    boolean NOT NULL DEFAULT true,
  track_mood      boolean NOT NULL DEFAULT true,
  track_soreness  boolean NOT NULL DEFAULT false,
  track_sleep     boolean NOT NULL DEFAULT false,
  custom_prompt   text,  -- optional coach-written question (e.g., "How motivated are you feeling?")
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE check_in_responses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id          uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL REFERENCES profiles(id),
  response_date     date NOT NULL,
  energy_level      integer CHECK (energy_level BETWEEN 1 AND 5),
  mood_level        integer CHECK (mood_level BETWEEN 1 AND 5),
  soreness_level    integer CHECK (soreness_level BETWEEN 1 AND 5),
  sleep_quality     integer CHECK (sleep_quality BETWEEN 1 AND 5),
  custom_response   integer CHECK (custom_response BETWEEN 1 AND 5),
  notes             text,
  completed_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, client_id, response_date)
);
```

### How Check-In Data Flows

| Consumer | What It Uses |
|---|---|
| **Coach dashboard** | Rolling 7-day and 30-day wellness trend per client alongside workout adherence |
| **Progress Memory (Layer 1)** | Wellness trends in the performance metrics timeline |
| **Adherence Intelligence** | Sustained low mood/energy as a soft contextual signal on client card |
| **Journal sentiment context** | Cross-referenced with AI sentiment for richer coaching signal |

### Analytics Events (Check-In)

| Event | Trigger | Key Metadata |
|---|---|---|
| `checkin.response.completed` | Client submits | `habit_id`, `mood_level`, `energy_level`, `soreness_level`, `sleep_quality` |
| `checkin.response.missed` | Day passes without response | `habit_id`, `streak_broken` |

---

## 11. Progress Memory

### Three-Layer Architecture

#### Layer 1 — Performance Metrics Timeline
**Quantitative. Automatic. No human intervention.**

Built from existing data:
- Weight lifted per exercise (progressive overload curve)
- Workout completion rate (adherence %)
- Session volume (sets × reps × weight)
- Body weight and measurements (client-logged)
- Program completion milestones
- Habit streak histories
- Check-in wellness trends (mood, energy, soreness over time)

**Build first. Free — it's a query on data already collected.**

#### Layer 2 — Journey Timeline
**Qualitative. Visual, scrollable record of the client's story.**

Contains: AI-summarized shared journal entries, shared coach call notes, milestone markers (auto + manual), photo check-ins, video diaries, audio journals.

**Build second. Requires journaling and coaching notes to be live.**

#### Layer 3 — Coach Progress Reports
**Periodic. AI-drafted, coach-edited, published.**

Workflow: Coach opens "Generate Progress Report" → AI drafts from workout data, adherence, sentiment digests, shared entries → Coach reviews, edits, publishes → Report lives permanently on client timeline.

**Build third. Requires Layers 1 and 2.**

### Coach Notes — Two Types

| Type | Visibility | Use Case |
|---|---|---|
| **Shared call notes** | Client can see on their timeline | Notes intended for client reflection |
| **Private coach notes** | Coach-only, BFF enforces at route level | Honest internal observations |

**CRITICAL RBAC RULE: Private coach notes must never be exposed through any client-facing API route. This is enforced at the BFF route level — not a UI toggle, not a permission setting. Coach-role-only, full stop.**

### Schema

```sql
CREATE TABLE coach_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        uuid NOT NULL REFERENCES profiles(id),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  note_date       date NOT NULL,
  is_private      boolean NOT NULL DEFAULT true,
  body            text NOT NULL,
  call_session_id uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
-- BFF RULE: client-facing routes always WHERE is_private = false

CREATE TABLE progress_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      uuid NOT NULL REFERENCES profiles(id),
  client_id     uuid NOT NULL REFERENCES profiles(id),
  period_start  date NOT NULL,
  period_end    date NOT NULL,
  ai_draft      text,
  final_text    text,
  status        text NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE milestones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  milestone_type  text NOT NULL,
  milestone_date  date NOT NULL,
  title           text NOT NULL,
  description     text,
  auto_generated  boolean NOT NULL DEFAULT false,
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

## 12. The Documentary Feature

### Why This Is BBC's Moat

> Every other coaching app tracks progress. BBC narrates it.

A client who finishes a year with you has a living record: audio journals from when they were struggling, video diaries from milestones, coach notes from breakthrough calls, photos from week 4 and week 52. The system weaves those artifacts into a highlight reel — a 5-minute documentary of who they were and who they became. **No Trainerize-class app does this.**

### Phase Timeline

- **Phase 1 (now):** Store every media artifact timeline-addressable. Build the foundation. Do NOT build compilation yet.
- **Phase 2:** Build the compilation feature using Shotstack (video composition API).

### Architectural Requirement (Phase 1)

Every artifact must carry: `created_at`, `client_id`, `artifact_type`, `visibility`, optional program/session anchor. **Nothing in Phase 1 storage decisions should make the documentary harder to build.**

### Documentary Generation Workflow (Phase 2 spec)

Client opens "Create Documentary" → questionnaire:

| Question | Options |
|---|---|
| Time period | Last 30 days / 3 months / 6 months / 1 year / custom |
| Duration | 1 min / 3 min / 5 min / 10 min |
| Focus | Physical transformation / Mindset journey / Milestones / Everything |
| Tone | Reflective / Energetic / Emotional / Motivational |
| Include coach notes? | Yes / No |
| **Include private journal entries?** | **Yes / No (explicit deliberate choice)** |

Output: rendered video in Supabase Storage + public share token for social + separate "share with coach" flag.

### Schema

```sql
-- Phase 1: timeline-addressable artifact ledger (build now)
CREATE TABLE timeline_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  artifact_type   text NOT NULL,  -- check_in_photo, video_diary, audio_journal, shared_coach_note, milestone, progress_report
  source_id       uuid NOT NULL,  -- polymorphic FK
  source_table    text NOT NULL,
  occurred_at     timestamptz NOT NULL,
  visibility      text NOT NULL CHECK (visibility IN ('private', 'coach_and_client', 'published_to_timeline')) DEFAULT 'private',
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Phase 2: documentary reels (schema built now, populated Phase 2)
CREATE TABLE documentary_reels (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES profiles(id),
  title             text,
  duration_seconds  integer NOT NULL,
  period_start      date NOT NULL,
  period_end        date NOT NULL,
  generation_prompt jsonb NOT NULL,
  storage_path      text,
  status            text NOT NULL CHECK (status IN ('queued', 'generating', 'ready', 'failed')) DEFAULT 'queued',
  share_token       text UNIQUE,
  shared_with_coach boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz
);
```

---

## 13. Journal Entry Data Model

### Privacy Model — Two-Layer Journal System

#### Layer 1 — Raw Journal (Client-Private by Default)

The actual entry: text, audio, video, photos. **Client owns this completely.** Coach never sees it unless client explicitly shares a specific entry. Default visibility: `private`. No admin override — even Joshua cannot read another coach's clients' private entries.

#### Layer 2 — Sentiment Digest (Coach-Accessible)

AI processes raw entries in an **isolated pipeline** and extracts: overall tone, recurring themes, flagged concerns, inferred energy level. These signals are stored separately from raw content. Coach receives a **weekly sentiment digest** — never the raw entry.

Sample digest: *"This week: 3 entries. Overall sentiment: cautiously optimistic. Recurring themes: work stress, fatigue on Wednesday, strong motivation after Thursday's workout. Flagged concern: mentioned feeling overwhelmed twice."*

**Why this is better than full coach access:** Clients journal more honestly when raw words aren't read. More honest journaling → better AI signal → more effective coaching. Privacy improves the coaching outcome.

### Critical Architectural Rule

**The journal sentiment AI pipeline is isolated from the product analytics pipeline.** Journal data never touches `analytics_events`. Sentiment data lives in its own schema, accessed only by the journaling service.

### Schema

```sql
CREATE TABLE journal_prompts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id),
  created_by          uuid NOT NULL REFERENCES profiles(id),
  prompt_text         text NOT NULL,
  media_types_allowed text[] NOT NULL,
  is_recurring        boolean NOT NULL DEFAULT false,
  recurrence_rule     text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE journal_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES profiles(id),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  entry_date        date NOT NULL,
  entry_type        text NOT NULL CHECK (entry_type IN ('free_form', 'prompted', 'check_in', 'video_diary', 'audio_diary')),
  prompt_id         uuid REFERENCES journal_prompts(id),
  visibility        text NOT NULL CHECK (visibility IN ('private', 'coach_and_client')) DEFAULT 'private',
  timeline_visible  boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE TABLE journal_artifacts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id          uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  artifact_type     text NOT NULL CHECK (artifact_type IN ('text', 'audio', 'video', 'photo')),
  storage_path      text,
  text_content      text,
  duration_seconds  integer,
  file_size_bytes   bigint,
  mime_type         text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ISOLATED PIPELINE — journaling service only
CREATE TABLE journal_transcriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id     uuid NOT NULL REFERENCES journal_artifacts(id) ON DELETE CASCADE,
  raw_transcript  text,
  status          text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  provider        text NOT NULL CHECK (provider IN ('deepgram', 'faster_whisper')),
  processed_at    timestamptz,
  error_message   text
);

CREATE TABLE journal_sentiment_signals (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES profiles(id),
  entry_id          uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  week_start        date NOT NULL,
  overall_tone      text CHECK (overall_tone IN ('positive', 'neutral', 'cautious', 'distressed')),
  themes            text[],
  flagged_concerns  text[],
  energy_level      integer CHECK (energy_level BETWEEN 1 AND 5),
  processed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE journal_weekly_digests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES profiles(id),
  coach_id      uuid NOT NULL REFERENCES profiles(id),
  week_start    date NOT NULL,
  digest_text   text NOT NULL,
  entry_count   integer NOT NULL,
  status        text NOT NULL CHECK (status IN ('pending', 'ready', 'viewed')) DEFAULT 'pending',
  viewed_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, coach_id, week_start)
);

CREATE TABLE journal_ai_summaries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id          uuid NOT NULL UNIQUE REFERENCES journal_entries(id) ON DELETE CASCADE,
  ai_draft          text NOT NULL,
  coach_edited_text text,
  status            text NOT NULL CHECK (status IN ('draft', 'approved', 'published')) DEFAULT 'draft',
  reviewed_by       uuid REFERENCES profiles(id),
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

**Hard rule:** AI summaries are invisible to clients until coach moves `status` to `published`. Data layer enforces this — not a UI setting.

---

## 14. Analytics Event Catalog

### Shared Event Envelope

```typescript
interface AnalyticsEvent {
  event_id:        string;   // UUID
  event_type:      string;   // namespaced: domain.noun.verb
  actor_id:        string;   // profile UUID
  actor_role:      'client' | 'coach' | 'admin' | 'system';
  subject_id:      string;   // what happened to (UUID)
  subject_type:    string;
  organization_id: string;
  occurred_at:     string;   // ISO 8601
  metadata:        Record<string, unknown>;
}
```

### Event Catalog

**Training Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `training.session.started` | Client opens workout | `program_id`, `template_id` |
| `training.session.completed` | Client submits | `duration_seconds`, `overall_rpe`, `total_sets`, `total_volume_kg` |
| `training.session.abandoned` | Not completed within 24h | `sets_completed`, `last_exercise_id` |
| `training.set.logged` | Client logs a set | `exercise_id`, `weight_kg`, `reps`, `was_substitution` |
| `training.exercise.substituted` | Exercise swapped | `original_exercise_id`, `substitution_id` |
| `training.session.created_by_client` | Ad-hoc workout | `exercise_count` |
| `training.program.assigned` | Coach assigns | `program_id`, `start_date` |
| `training.program.completed` | Last session done | `program_id`, `completion_rate` |

**Nutrition Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `nutrition.meal.checked` | Meal checked on calendar | `meal_plan_id`, `recipe_id`, `meal_slot` |
| `nutrition.meal.skipped` | Day passes without check | `meal_plan_id`, `recipe_id` |
| `nutrition.recipe.added_to_book` | Recipe saved | `source` |
| `nutrition.meal_plan.created` | Meals planned | `week_start_date`, `meal_count` |

**Habit Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `habit.check.completed` | Client checks habit | `habit_id`, `habit_name`, `streak_count` |
| `habit.check.missed` | Day passes without check | `habit_id`, `streak_broken` |
| `habit.created` | Habit created | `frequency`, `created_by_role` |

**Check-In Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `checkin.response.completed` | Client submits | `habit_id`, `mood_level`, `energy_level`, `soreness_level`, `sleep_quality` |
| `checkin.response.missed` | Day passes | `habit_id`, `streak_broken` |

**Journaling Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `journal.entry.created` | Entry submitted | `media_types[]`, `entry_type` |
| `journal.transcription.completed` | Deepgram finishes | `entry_id`, `duration_seconds`, `provider` |
| `journal.summary.published` | Coach approves summary | `entry_id` |
| `journal.checkin.photo_uploaded` | Photo uploaded | `entry_id` |
| `journal.entry.shared_with_coach` | Visibility toggled | `entry_id` |

**Coaching Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `coaching.call.noted` | Coach saves notes | `client_id`, `is_private`, `call_date` |
| `coaching.report.published` | Report published | `client_id`, `period_start`, `period_end` |
| `coaching.relationship.started` | Invite accepted | `coach_id`, `client_id` |
| `coaching.relationship.paused` | Paused | `reason` |
| `coaching.relationship.ended` | Archived | `reason`, `duration_days` |

**Adherence Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `adherence.flag.raised` | Threshold breached | `flag_type`, `client_id`, `severity` |
| `adherence.flag.resolved` | Client takes action | `flag_type`, `days_flagged`, `resolution_action` |
| `adherence.auto_message.sent` | Template message sent | `flag_type`, `template_id` |

**Onboarding Domain**

| Event | Trigger | Key Metadata |
|---|---|---|
| `onboarding.intake.completed` | Intake form done | `goal_priorities`, `equipment_count` |
| `onboarding.coach.setup_completed` | Checklist done | `org_id` |
| `onboarding.invitation.created` | Invite generated | `invite_type` |
| `onboarding.invitation.used` | Invite redeemed | `invite_type` |

**Documentary Domain (Phase 2)**

| Event | Trigger | Key Metadata |
|---|---|---|
| `documentary.reel.requested` | Questionnaire submitted | `period_days`, `duration_seconds`, `focus` |
| `documentary.reel.completed` | Render finishes | `duration_seconds`, `artifact_count` |
| `documentary.reel.shared` | Shared | `share_destination` |

### Event Consumers

| Consumer | Reads |
|---|---|
| Analytics service | Everything → coach dashboard metrics |
| Notifications (Novu) | Specific events triggering alerts |
| Progress Memory service | `training.session.completed`, `habit.check.completed`, `journal.summary.published`, `coaching.report.published` |
| Calendar service | `program.assigned`, `meal_plan.created`, `habit.created` |
| Adherence Intelligence | All `training.*`, `nutrition.meal.*`, `habit.check.*`, `checkin.response.*` |

### Storage

```sql
CREATE TABLE analytics_events (
  event_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type        text NOT NULL,
  actor_id          uuid NOT NULL,
  actor_role        text NOT NULL,
  subject_id        uuid NOT NULL,
  subject_type      text NOT NULL,
  organization_id   uuid NOT NULL,
  occurred_at       timestamptz NOT NULL DEFAULT now(),
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX idx_events_actor ON analytics_events(actor_id, occurred_at DESC);
CREATE INDEX idx_events_org_time ON analytics_events(organization_id, occurred_at DESC);
```

**CRITICAL: Journal sentiment data never appears in `analytics_events`. Health data isolation is non-negotiable.**

---

## 15. Adherence Intelligence System

### Why This Is a First-Class Feature

> A great coach catches the drift before it becomes a slide.

Joshua's philosophy: two consecutive non-weekend days of inaction signals the wrong habit forming. The Adherence Intelligence System operationalizes this at scale. This is a **proactive coaching intervention engine**, not a notification feature.

### Flag Types and Default Thresholds

| Flag Type | Default Trigger | Severity |
|---|---|---|
| `adherence.gap` | 2 consecutive non-weekend days with no logged activity | Medium |
| `adherence.session_abandoned` | 3 abandoned sessions in rolling 7 days | Medium |
| `adherence.streak_broken` | Habit streak broken after 7+ days | Low |
| `adherence.program_falling_behind` | 2+ sessions behind schedule | High |
| `adherence.no_login` | No app open in 3+ days during active program | Low |

### Per-Client Customization (CRITICAL)

**Thresholds are tunable per coach-client relationship.** Rigid defaults create noise and resistance — the opposite of good coaching.

```sql
CREATE TABLE client_flag_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_client_id       uuid NOT NULL REFERENCES coach_client_relationships(id) ON DELETE CASCADE,
  flag_type             text NOT NULL,
  is_enabled            boolean NOT NULL DEFAULT true,
  threshold_value       integer NOT NULL,
  auto_message_enabled  boolean NOT NULL DEFAULT true,
  template_id           uuid REFERENCES message_templates(id),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_client_id, flag_type)
);

CREATE TABLE active_flags (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES profiles(id),
  coach_id          uuid NOT NULL REFERENCES profiles(id),
  flag_type         text NOT NULL,
  severity          text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  raised_at         timestamptz NOT NULL DEFAULT now(),
  resolved_at       timestamptz,
  resolution_action text,
  metadata          jsonb DEFAULT '{}'::jsonb,
  UNIQUE (client_id, flag_type, raised_at)
);

CREATE TABLE message_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        uuid NOT NULL REFERENCES profiles(id),
  flag_type       text NOT NULL,
  template_text   text NOT NULL,  -- "Hey {first_name} — I noticed you haven't logged anything..."
  variables       text[] DEFAULT ARRAY['first_name'],
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

### Surfacing

| Channel | What |
|---|---|
| Coach dashboard | All active flags per client, type and age. Color-coded. Visible at a glance. |
| Push notification | Medium + high severity only (low = dashboard-only) |
| Automated client message | Pre-written templates via Sendbird in existing coaching thread |

### Auto-Resolution

Flags resolve automatically when client takes action. Coaches see only active problems — not a graveyard.

### Pre-Written Templates

**No AI. No review step. No delay.** Templates written by Joshua in his voice, stored per flag type, sent immediately. The automation is the delivery mechanism, not the relationship.

### Evaluation Engine (Inngest, Hourly)

```typescript
inngest.createFunction(
  { id: 'adherence-evaluator' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const activeRelationships = await step.run('fetch', () => getActiveRelationships());
    for (const rel of activeRelationships) {
      const settings = await step.run(`settings-${rel.id}`, () => getFlagSettings(rel.id));
      for (const s of settings.filter(s => s.is_enabled)) {
        const raise = await step.run(`eval-${rel.id}-${s.flag_type}`, () => evaluateFlag(rel.client_id, s));
        if (raise) await step.run(`raise-${rel.id}-${s.flag_type}`, () => raiseFlag(rel, s));
      }
    }
  }
);
```

---

## 16. Exercise Library Data Strategy

### Decision: Hybrid Dataset with Provenance-First Ingestion

Exercise data is treated as a **licensed content supply chain**, not a flat JSON import. Every record carries source identity, license, and media rights status from day one.

### Dataset Sources

| Source | License | Use |
|---|---|---|
| **`free-exercise-db`** (primary seed) | Unlicense / public domain | 800+ exercises, clean JSON, permissive. Best MVP starting point. |
| **`wger`** (secondary enrichment) | AGPL code, CC per entry data | Multilingual names, muscle taxonomy, actively maintained. Handle per-entry attribution. |
| **`exercemus/exercises`** (enrichment) | MIT repo, per-record license | Rich metadata (aliases, cues, substitution hints, tempo). Store per-record attribution. |
| **Coach-recorded clips** (long-term) | BBC-owned | Self-produced MP4/WebM. Best IP position. Build replacement pipeline from day one. |

**Never use:** ExerciseDB API in production without thorough legal review. `hasaneyldrm/exercises-dataset` is educational/non-commercial only.

### Schema Extensions

```sql
-- Add provenance fields to exercises table
ALTER TABLE exercises ADD COLUMN source_name          text;   -- 'free-exercise-db', 'wger', 'bbc_original'
ALTER TABLE exercises ADD COLUMN source_id            text;   -- original ID in source
ALTER TABLE exercises ADD COLUMN license_code         text;   -- 'unlicense', 'cc-by-sa-4.0', 'bbc_owned'
ALTER TABLE exercises ADD COLUMN attribution_text     text;   -- displayed where required
ALTER TABLE exercises ADD COLUMN media_rights_status  text
  NOT NULL DEFAULT 'needs_replacement'
  CHECK (media_rights_status IN ('owned', 'permitted', 'external_reference_only', 'needs_replacement'));

-- Aliases and search variants
CREATE TABLE exercise_aliases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  alias       text NOT NULL,
  locale      text NOT NULL DEFAULT 'en'
);

-- Coach-defined safe substitutions (not AI-generated)
CREATE TABLE exercise_substitutions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id     uuid NOT NULL REFERENCES exercises(id),
  substitute_id   uuid NOT NULL REFERENCES exercises(id),
  reason          text,           -- 'no_cable', 'knee_injury', 'home_gym'
  created_by      uuid REFERENCES profiles(id),   -- null = platform default
  organization_id uuid REFERENCES organizations(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercise_id, substitute_id)
);
```

### Media Rights Status

| Status | Meaning | Action |
|---|---|---|
| `owned` | BBC-produced original | Serve freely |
| `permitted` | Verified redistribution rights | Mirror and serve |
| `external_reference_only` | Accessible but rights unclear | Link only, do not serve directly |
| `needs_replacement` | Metadata kept, media rights unclear | Replace with coach-recorded clip over time |

### Search Indexes

```sql
-- Full-text search
ALTER TABLE exercises ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(instructions, '')), 'C')
  ) STORED;
CREATE INDEX idx_exercises_search ON exercises USING GIN(search_vector);

-- Typo tolerance
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_exercises_name_trgm ON exercises USING GIN(name gin_trgm_ops);

-- Array tag filtering
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN(primary_muscles);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN(equipment_tags);
```

### Coach Filter Priority

1. Equipment (gates what's prescribable)
2. Primary muscle group
3. Movement pattern (push / pull / hinge / squat / carry / core)
4. Environment (gym / home / bodyweight only)
5. Difficulty (beginner / intermediate / advanced)
6. "Safe substitutions for X"

### ETL Ingestion Sequence

```
1. Import free-exercise-db as baseline → media_rights_status = 'permitted'
2. Define canonical taxonomy enums (normalize equipment names, muscle names, movement patterns)
3. Import enrichment sources into staging tables → license review before promoting
4. Deduplicate (normalized slug + primary muscles + equipment overlap)
5. Mirror permitted media, transcode to MP4/WebM + thumbnail
6. Build admin curation tool (flag uncertain media, mark for replacement)
7. Assign substitution maps per exercise
8. Wire into workout builder, program library, substitution feature
```

### Localization — Deferred Pattern (Phase 2)

```sql
-- DEFERRED: add when expanding to non-English markets
CREATE TABLE exercise_translations (
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  locale       text NOT NULL,
  name         text NOT NULL,
  instructions text,
  coaching_cues text,
  PRIMARY KEY (exercise_id, locale)
);
```

Spanish and Portuguese are the highest-opportunity markets. Trainerize is English-only — this is a gap BBC can own.

---

## 17. Health Metric Events

### Decision: Reserve Schema Now, Integrate Later

The `health_metric_events` table is built as part of Phase 1 schema. **No Health Connect or HealthKit integration is implemented until the attorney consultation (Section 25) confirms the regulatory posture.**

### Rationale

Normalizing all wearable data into a single generic table means:
- No vendor lock-in to one wearable's data model
- Adding Garmin, Whoop, or Oura requires no migration
- Coach dashboard can chart any metric type with the same component

### Schema

```sql
CREATE TABLE health_metric_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles(id),
  source_app      text NOT NULL,   -- 'apple_health', 'health_connect', 'garmin', 'whoop', 'oura', 'withings'
  source_device   text,
  metric_type     text NOT NULL,   -- see catalog below
  value           numeric NOT NULL,
  unit            text NOT NULL,   -- 'bpm', 'count', 'ms', 'hours', 'kg', 'kcal'
  observed_at     timestamptz NOT NULL,
  synced_at       timestamptz NOT NULL DEFAULT now(),
  raw_payload     jsonb,           -- preserve original for reprocessing
  deleted_at      timestamptz
);

CREATE INDEX idx_health_events_client_type ON health_metric_events(client_id, metric_type, observed_at DESC);
```

### Metric Type Catalog (starting set)

| Metric Type | Unit | Typical Sources |
|---|---|---|
| `heart_rate` | bpm | Apple Health, Health Connect, wearables |
| `hrv_rmssd` | ms | Whoop, Oura, Garmin, Apple Watch |
| `steps` | count | All |
| `active_calories` | kcal | All |
| `sleep_duration` | hours | All |
| `sleep_deep_minutes` | minutes | Oura, Whoop, Garmin |
| `resting_heart_rate` | bpm | All |
| `body_weight` | kg | Withings, manual |
| `body_fat_percentage` | percent | Withings, manual |
| `vo2_max_estimate` | ml/kg/min | Apple Watch, Garmin |
| `respiratory_rate` | breaths/min | Whoop, Oura |

### HIPAA Gate

**Health Connect / HealthKit sync is BLOCKED until attorney consultation completes.** See Section 25.

### Platform Notes

- **Android:** Health Connect only (Google Fit is deprecated — never use it)
- **iOS:** HealthKit

---

## 18. File Upload Pipeline

### Decision: Direct Upload via BFF-Issued Presigned URL

BFF validates auth and metadata → issues presigned URL → client uploads directly to Supabase Storage → BFF is never in the data path.

### Upload Flow

```
Mobile → (1) Request upload URL (filename, size, mime_type)
BFF   → (2) Validates JWT + file metadata against limits
       → (3) Creates artifact row in 'pending' state
       → (4) Requests presigned URL from Supabase Storage
       → (5) Returns presigned URL + artifact_id to mobile
Mobile → (6) PUT file directly to Supabase Storage
Storage → (7) Webhook fires on completion
Inngest → (8) Updates artifact row to 'uploaded'
         → (9) Enqueues transcription job (if audio/video)
Deepgram → (10) Transcribes
Inngest → (11) Writes transcript, triggers sentiment processing
         → (12) Sends push notification "Your transcript is ready"
```

### File Size and Duration Limits

| Media Type | Size Limit | Duration Limit |
|---|---|---|
| Journal audio | 50 MB | 30 minutes |
| Journal video | 500 MB | 10 minutes |
| Check-in photo | 10 MB | N/A |
| Coach exercise demo video | 500 MB | 5 minutes |

### Storage Buckets

| Bucket | Contents | Access Policy |
|---|---|---|
| `journal-media` | Journal audio, video, photos | Owner + (when shared) their coach only |
| `coach-content` | Exercise demos, recipe images, branding | Org-scoped read |
| `documentary-reels` | Final rendered documentary videos | Owner read + share-token public read |
| `check-in-photos` | Periodic body check-in photos | Owner + coach read |

---

## 19. Background Job Infrastructure

### Decision: Inngest for Everything

| Property | Detail |
|---|---|
| Operational burden | Zero — no workers, no SSH, no PM2, no Docker management |
| Free tier | 50,000 runs/month — covers Phase 1 |
| TypeScript-native | First-class SDK |
| Step functions | Survive failures, resume from failed step |
| Observability | Dashboard shows every run, retry, failure |
| Local dev | Inngest Dev Server for local simulation |

### Job Categories

| Category | Trigger | Examples |
|---|---|---|
| Reactive | Event-driven | Transcription on upload, sentiment on transcription complete |
| Scheduled | Cron | Hourly adherence eval, Monday digest, midnight calendar rollover |
| On-demand | API-triggered | Documentary reel (Phase 2), progress report AI draft |

### Key Inngest Functions

```typescript
// Transcription pipeline
inngest.createFunction(
  { id: 'process-journal-transcription', concurrency: 5 },
  { event: 'journal/artifact.uploaded' },
  async ({ event, step }) => {
    const artifact = await step.run('load', () => getArtifact(event.data.artifactId));
    if (!['audio', 'video'].includes(artifact.artifact_type)) return;
    const transcript = await step.run('transcribe', () => deepgram.transcribe(artifact.storage_path));
    await step.run('save', () => saveTranscription(artifact.id, transcript));
    await step.sendEvent('trigger-sentiment', {
      name: 'journal/transcription.completed',
      data: { entryId: artifact.entry_id }
    });
  }
);

// Weekly digest — every Monday 6am PT
inngest.createFunction(
  { id: 'weekly-sentiment-digest' },
  { cron: 'TZ=America/Los_Angeles 0 6 * * MON' },
  async ({ step }) => {
    const clients = await step.run('fetch', () => getActiveCoachedClients());
    for (const client of clients) {
      await step.run(`digest-${client.id}`, () => generateAndSaveDigest(client.id, client.coach_id));
    }
  }
);
```

**Inngest manages its own job state. No `transcription_jobs` or `digest_jobs` tables needed.**

---

## 20. Environment Strategy

### Three Environments

| Environment | Purpose | Supabase Project | Keycloak |
|---|---|---|---|
| **Local** | Developer machine | CLI emulator | `bbc-dev` realm (Phase Two) |
| **Staging** | Pre-production | `bbc-platform-staging` (free tier) | `bbc-staging` realm (Phase Two) |
| **Production** | Real users | `bbc-platform` | `bbc-prod` realm (Phase Two) |

### Promotion Chain

```
Local dev → git commit migration file → PR opened → CI applies to staging
→ smoke tests + QA → manual promote → Production
```

**No direct production DB changes. Ever.**

### Keycloak Strategy

- One realm per environment: `bbc-dev`, `bbc-staging`, `bbc-prod`
- All managed by Phase Two
- Realm export/import for configuration replication across environments

---

## 21. Migration Runner

### Decision: Supabase CLI

```
supabase db diff -f migration_name → generates file in supabase/migrations/
git commit → PR → CI: supabase db push --project-ref STAGING
Staging validated → supabase db push --project-ref PROD (manual trigger)
```

Migration files live in `supabase/migrations/`, versioned in git. Every schema change goes through this flow — no exceptions.

---

## 22. Secrets Management

### Decision: Doppler

Single source of truth for all secrets across all environments.

```
Doppler dashboard
  ├→ Local dev (doppler run -- pnpm dev)
  ├→ Vercel (Doppler GitHub integration)
  ├→ AWS Secrets Manager (Doppler AWS sync)
  └→ Inngest environment variables
```

**Hard rule:** No `.env` files committed to git. No secrets in code. All CI/CD uses Doppler service tokens scoped per environment.

---

## 23. Error Monitoring & Observability

### Sentry

| Surface | SDK |
|---|---|
| React Native | `@sentry/react-native` |
| Hono services | `@sentry/node` with Hono middleware |
| Inngest jobs | Built-in Sentry integration |
| Next.js apps | `@sentry/nextjs` |

Captures: unhandled exceptions, slow requests (>2s), native crashes, Inngest job failures, custom business errors (e.g., `auth.invite_expired`).

### Pino Logging

```typescript
// packages/config/src/logger.ts
import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['authorization', 'token', 'password', 'jwt'],
  formatters: { level: (label) => ({ level: label }) }
});
```

**Log aggregation:** Hono services → CloudWatch. Inngest → Inngest dashboard. Vercel → Vercel log panel. Sentry is the unified incident view.

---

## 24. Authentication & Identity

### Decision: Keycloak 26.2 via Phase Two. PKCE S256.

### Auth Flow

```
Mobile → (1) Initiate PKCE (code_verifier, code_challenge)
Keycloak → (2) Return authorization code
Mobile → (3) Exchange code + verifier for tokens → stored in expo-secure-store
Mobile → (4) Send access token with every BFF request
BFF → (5) Validate JWT via JWKS (cached)
     → (6) Extract role + sub + organization_id claim
     → (7) Authorize route based on role + resource ownership
```

### Custom Token Claims (Keycloak Protocol Mappers)

- `role` — `coach` | `client` | `admin`
- `organization_id` — user's org UUID
- `is_self_directed` — boolean

BFF reads these claims to enforce RBAC without an extra DB round trip.

### CRITICAL Non-Negotiable

**Auth and RBAC changes require explicit approval from Joshua before any implementation. No code touches auth or RBAC without sign-off.**

---

## 25. HIPAA Assessment

**Status:** Not a formal requirement at launch. BBC operates with a HIPAA-adjacent security posture regardless.

**This document is not legal advice.** Attorney consultation required before launch — see Section 29.

### Why HIPAA Likely Doesn't Apply

A fitness coaching app operated by a personal trainer is generally not a covered entity. Workout logs, habit tracking, and preference-driven nutrition are not clinical records.

### When It Would Apply

1. Health Connect / HealthKit integration syncing clinical data (blood pressure, glucose, ECG) — **attorney review required before implementing**
2. Expanding into healthcare-referred clients or clinic partnerships

### Per-Data-Type Assessment

| Data | HIPAA Concern | Action |
|---|---|---|
| Workout logs, sets, reps | None | Standard security |
| Body weight, measurements | Low | Encrypt at rest |
| Journal entries (text/audio/video) | Low-medium | Encrypt at rest, strict access, isolated AI pipeline |
| Health Connect / HealthKit sync | Medium | **BLOCKED — attorney review first** |
| Mental health sentiment signals | Medium | Isolated pipeline, attorney review before launch |

### Operational Posture (HIPAA-Adjacent, In Effect Now)

- Encryption at rest — Supabase Postgres + Storage encryption enabled
- Encryption in transit — TLS 1.3 all connections
- Audit logging — every access logged via Pino → CloudWatch
- Strict access — service_role key in Doppler only; BFF enforces RBAC at every route
- Minimum necessary access — no `SELECT *` unbounded queries

**Known constraint:** Supabase does not currently offer a HIPAA BAA. If formal HIPAA compliance becomes required, this triggers a database migration conversation.

---

## 26. Right-to-Deletion Design

### Decision: Soft Delete (30-day window) → Hard Delete

Every table containing user data has `deleted_at` and `deletion_type` columns. Designed in from day one — not retrofitted.

### Deletion Flow

```
Client requests deletion → identity verified via Keycloak re-auth
→ Set deleted_at across all tables
→ Remove from coach dashboards immediately
→ Send confirmation email
→ Log to immutable audit_log
→ Enqueue Inngest job +30 days
[30 days]
→ Hard delete all rows (cascade order below)
→ Purge Supabase Storage files
→ Anonymize analytics_events (set actor_id = null UUID)
→ Delete Keycloak account LAST
→ Write final confirmation to audit_log
```

### Cascade Deletion Order

```
journal_artifacts → journal_transcriptions → journal_sentiment_signals
→ journal_weekly_digests → journal_ai_summaries → journal_entries
→ check_in_responses → workout_sets → workout_sessions
→ meal_plans → habit_checks → habits
→ documentary_reels → progress_reports
→ coach_notes (client_id = deleted user) → active_flags
→ client_intake → coach_client_relationships
→ analytics_events (anonymize, not delete) → profiles
→ Keycloak account (LAST — via Keycloak Admin API)
```

**Why Keycloak last:** If cascade fails, user can still authenticate for support. Deleting Keycloak first locks them out with no recovery path.

### Never Deleted

| Data | Reason |
|---|---|
| Billing records | Legal/tax retention |
| Anonymized analytics aggregates | No user identifier, not personal data |
| `audit_log` records of the deletion | Compliance proof |

```sql
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text NOT NULL,
  subject_id  uuid,
  subject_email text,
  actor_id    uuid,
  metadata    jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
-- APPEND-ONLY. Never updated. Never deleted. Retained permanently.
```

---

## 27. Cost Model & Scaling Triggers

### Phase 1: 0–20 Clients (~$35–70/month)

| Service | Plan | Cost |
|---|---|---|
| Supabase | Free (2 projects) | $0 |
| Phase Two (Keycloak) | Starter | ~$25 |
| Vercel | Hobby/Pro | $0–20 |
| Inngest | Free (50k runs/mo) | $0 |
| Deepgram | Pay-per-use ($200 credit covers ~26k min) | $0–10 |
| Sendbird | Developer tier (1,000 MAU free) | $0 |
| Doppler | Free | $0 |
| Sentry | Free (5k errors/mo) | $0 |
| Novu | Free tier | $0 |
| AWS (minimal) | Lambda + small services | ~$10–15 |

### Phase 2: 20–100 Clients (~$150–250/month)

Supabase Pro (+$25), Deepgram scales with usage (+$15–40), possible Sentry Team (+$26).

### Phase 3: 100+ Clients (~$500–800/month)

Sendbird Starter/Pro (when MAU > 1,000, +$399+), larger AWS, documentary video API costs.

### Scaling Principle

> Each phase transition is triggered by revenue growth that more than covers the cost increase.

### Operating Principle (Codified)

> **If a managed service costs less than 1 hour of your time per month to operate, it's worth paying for.**

This filter applies to every infrastructure decision. It's why Phase Two > self-hosted Keycloak, Inngest > EC2 workers, Sendbird > Matrix Synapse, Deepgram > self-hosted faster-whisper.

---

## 28. Operating Principles

### Architecture
1. **Calendar is the operational center.** Every domain resolves to a calendar item with a checkmark.
2. **UI clients never call services directly.** Always through BFF.
3. **Features communicate via shared contracts** in `packages/schemas`. Never internal cross-feature imports.
4. **Zod validation at every API/service boundary.** No exceptions.
5. **Health data and journal data are strictly separated from product analytics pipelines.** Non-negotiable.
6. **Fail locally.** Feature errors must not cascade across the app.

### Auth & Security
7. **Auth and RBAC changes require explicit approval** before any implementation.
8. **No secrets in code.** Doppler-managed environment variables only.
9. **Private coach notes are coach-only at the BFF route level.** Never reachable through any client-facing route.
10. **Health-adjacent AI outputs require human review** before reaching clients.
11. Never log PII, tokens, passwords, health metrics, or journal content.
12. Parameterize all database queries — no raw SQL string interpolation.
13. Rate-limit all public-facing endpoints.

### Product Philosophy
14. **The coach is an amplifier, not a gatekeeper.** Self-directed and coached clients have access to the same core tools.
15. **The intervention should land fast.** Adherence flags use pre-written templates, not AI-drafted messages with review steps.
16. **Privacy improves coaching outcomes.** The two-layer journal system is the operational form of this principle.
17. **AI outputs are assistive only.** Never diagnostic.
18. **Check-ins are the client's choice.** No client is forced to track mood or energy.
19. **Exercise media is a supply chain.** Every asset carries provenance, license, and rights status.
20. **We look toward the future while staying grounded in human truth.** Features must be traceable to a real truth about health, fitness, behavior change, goal setting, or psychology.

### Infrastructure
21. **Health Connect for Android** — never Google Fit (deprecated).
22. **Custom dev client for Expo** — never Expo Go.
23. **Supabase Storage** — never MinIO.
24. **Sendbird for chat** — Matrix Synapse is on the DO NOT USE list.
25. **Deepgram for transcription** — faster-whisper not needed unless economics flip at massive scale.
26. **No SSH-required infrastructure** — managed services everywhere.

### Process
27. **Migrations only via Supabase CLI** files committed to git. No direct production DB changes ever.
28. **Soft delete with 30-day retention.** Designed in from day one.
29. **Every flag, threshold, and template is per-coach-client tunable.** Defaults exist; coaches override per relationship.

---

## 29. Immediate Action Items

### Pre-Build (must complete before more code is written)

- [ ] Create `bbc-platform-staging` Supabase project (free tier)
- [ ] Stop all direct production DB changes — commit to migration file workflow
- [ ] Create Phase Two account, provision realms: `bbc-dev`, `bbc-staging`, `bbc-prod`
- [ ] Set up Doppler project: configs `dev`, `stg`, `prd`
- [ ] Set up Sentry project (React Native + Node integrations)
- [ ] Create Inngest account, install SDK in services
- [ ] Create Sendbird application (Developer tier)
- [ ] Create Deepgram account, claim $200 free credit
- [ ] Set up Expo EAS account (20-min task — unblocks TestFlight)

### Schema (apply via migration files)

- [ ] `organizations` table
- [ ] `profiles` table extensions (`organization_id`, `is_self_directed`, `onboarding_completed`, soft-delete columns)
- [ ] `coach_client_relationships` table
- [ ] `invitations` table
- [ ] `client_intake` table
- [ ] `habits` + `habit_checks` + `check_in_configs` + `check_in_responses`
- [ ] Nutrition: `ingredients`, `recipes`, `recipe_ingredients`, `meal_plans`
- [ ] Training: `workout_sessions`, `workout_sets`, `exercises` (with provenance fields), `exercise_aliases`, `exercise_substitutions`
- [ ] Journal: `journal_entries`, `journal_artifacts`, `journal_transcriptions`, `journal_sentiment_signals`, `journal_weekly_digests`, `journal_ai_summaries`, `journal_prompts`
- [ ] `analytics_events` with indexes
- [ ] `active_flags`, `client_flag_settings`, `message_templates`
- [ ] `coach_notes`, `progress_reports`, `milestones`
- [ ] `timeline_artifacts`
- [ ] `health_metric_events` (table only — no integration yet)
- [ ] `audit_log` (append-only)
- [ ] `deleted_at` + `deletion_type` on every user-data table

### Implementation

- [ ] Keycloak invite-token carry-through (custom authenticator or pre-registration webhook)
- [ ] BFF route-level RBAC for `coach_notes.is_private = true`
- [ ] WatermelonDB schema mirroring + sync RPC functions
- [ ] Supabase Storage upload via BFF-issued presigned URLs
- [ ] Inngest functions: transcription pipeline, weekly digest, hourly adherence evaluator
- [ ] Progressive overload pre-fill in workout session service
- [ ] Import `free-exercise-db` as baseline exercise seed
- [ ] ETL pipeline for exercise data (normalize, deduplicate, provenance-tag)

### Legal / Compliance

- [ ] Schedule 1-hour consultation with healthcare/privacy attorney before launch
- [ ] Document terms of service and privacy policy
- [ ] Define right-to-deletion request flow (in-app + email)

---

## 30. DO NOT USE List

| Tool | Reason |
|---|---|
| **Expo Go** | Custom dev client required. Expo Go cannot run WatermelonDB, expo-secure-store at required level. |
| **Google Fit** | Deprecated. Use Health Connect for Android. |
| **MinIO** | Archived February 2026. Supabase Storage is the permanent choice. |
| **Matrix Synapse** | Replaced by Sendbird. Operationally too complex for non-technical solo operator. |
| **Dendrite** | Same reasoning as Matrix Synapse. |
| **faster-whisper** | Replaced by Deepgram. Reconsider only if economics flip at 1,000+ active journaling clients. |
| **Self-hosted Keycloak** | Replaced by Phase Two. Operational burden incompatible with solo operator constraint. |
| **EC2 persistent worker processes** | Replaced by Inngest. Same reasoning. |
| **Supabase Auth** | Keycloak is the sole identity system. |
| **Trigger.dev** | Phase 1: Inngest only. Revisit only if Inngest economics break at very high scale. |
| **AWS Secrets Manager as primary** | Doppler is the source of truth. Secrets managed in Doppler, not AWS directly. |
| **Vault (self-hosted)** | Operational burden. |
| **Stream Chat** | Sendbird free tier is more generous at Phase 1 scale. |
| **OpenAI Whisper API** | Deepgram is faster, cheaper at scale, better API. |
| **SeaweedFS** | Supabase Storage is the permanent choice. SeaweedFS is not an escape hatch — it's off the table. |
| **PostHog** | Not in the confirmed stack. Analytics are internal via `analytics_events` table. |
| **Cal.com** | Not in the confirmed stack. Calendar is a standalone internal domain. |
| **ZITADEL** | Not in the confirmed stack. Keycloak via Phase Two is the sole identity system. |
| **vLLM** | Not in the confirmed Phase 1 stack. Haystack + Deepgram cover current AI needs. |
| **ExerciseDB API (production)** | Requires serious legal/provenance review before any production use. |

---

## 31. Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 24, 2026 | Joshua Carisma + Claude | Initial complete document. Resolves all 17 blindspots. |
| 2.0 | April 26, 2026 | Joshua Carisma + Claude | Added: Check-In System (Section 10), Exercise Library Data Strategy (Section 16), Health Metric Events (Section 17), Product Philosophy Addendum, Trainerize feature analysis, updated DO NOT USE list (SeaweedFS, PostHog, Cal.com, ZITADEL, vLLM removed from consideration), corrected all outdated references from original CLAUDE.md. |

---

*End of Document*
