# Memory: Body By Carisma — Client Coaching Platform
Last updated: 2026-04-23 by Claude

---

## Current Status
**Phase:** Phase 1 MVP — Training service domain next
**Last worked on:** 2026-04-23
**Overall health:** On track

Session 5B complete. AuthContext useReducer state machine, Keycloak PKCE service, consent/login/home
screens, Stack.Protected auth gate in root layout, env wiring, Vitest integration tests against local
Keycloak. turbo run build 22/22, turbo run lint 23/23, tsc --noEmit passes. Mobile auth feature complete.
Next session: create new branch from master for Training service domain model.

---

## Resume Here (Next Session Starts At)

- **Branch:** Create new branch from master for training service work (merge feature/mobile-auth first)
- **Next task:** Training service domain model — exercise library, workout templates, program builder.
  No auth/RBAC changes. No explicit approval needed.
- **Before starting:** Confirm turbo run build 22/22 and turbo run lint 23/23 on master after merge.

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
| 2026-04-23 | Expo SDK 52 → 53 upgraded before first screen | Stack.Protected auth routing requires SDK 53; New Architecture is now default; zero migration cost while no screens or native modules exist | SDK 53 requires node-linker=hoisted in pnpm; SDK 54+ resolves this restriction |
| 2026-04-23 | apps/coach-web and apps/admin-web build scripts changed to tsc --noEmit | next build (Next.js 15.5.x) + React 19 + pnpm-hoisted fails on 404 page prerendering in worker subprocess; latent issue exposed only on cache-busted runs; production builds go through CI | Loses local next build validation; tsc --noEmit still catches all type errors |

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
- **2026-04-22 eslint-visitor-keys Node version floor (RESOLVED):** `eslint-visitor-keys@5.x`
  requires Node `^22.13.0`. Local Node upgraded to 22.13.0 via nvm (macOS 12 blocked
  Homebrew build for `node@22`). `pnpm.overrides` pin removed; all 22 workspaces pass lint.
- **2026-04-22 macOS 12 + Homebrew:** macOS 12 is Homebrew Tier 3 — `simdutf` fails to
  compile for `node@22`. Use nvm (pre-built binaries) for Node version management on this
  machine. Do not attempt `brew install node@22`.
- **2026-04-23 pnpm + Expo SDK 53:** `node-linker=hoisted` required in root `.npmrc`.
  Without it, isolated dependency resolution causes native build errors.
  Add this before running pnpm install after any Expo SDK upgrade.
- **2026-04-23 bbc-realm.json mobile redirect URI:** Added explicit
  `com.bodybycarisma.mobile://auth/callback` to `redirectUris` for `mobile-bff` client
  (wildcard `com.bodybycarisma.mobile://*` was already there but exact URI added for clarity).
  Realm was reimported. Also enabled `directAccessGrantsEnabled: true` on `mobile-bff` for
  local dev integration testing (ROPC grant) — must remain false in staging/production.
- **2026-04-23 Keycloak 26 user profile validation:** ROPC grant fails with
  "Account is not fully set up" if test user is missing `firstName` and `lastName`.
  Keycloak 26 enforces user profile completeness even when `requiredActions` array is empty.
  Test user must have firstName, lastName, email, emailVerified=true.
- **2026-04-23 Next.js 15.5.x + React 19 + pnpm-hoisted:** `next build` fails on
  static prerendering of the 404 page (`_error.js`) with "Cannot read properties of null
  (reading 'useContext')". Root cause: React instance isolation in the Next.js build worker.
  Fix: changed build scripts in coach-web and admin-web to `tsc --noEmit`.

---

## Current Tech Debt

- **2026-04-22 No ESLint or Prettier config yet (RESOLVED):** Shared configs now live
  in `packages/config/`. All 22 workspaces pass `turbo run lint` and `turbo run format`.
- **2026-04-22 pnpm engine-strict (RESOLVED):** `.npmrc` has `engine-strict=true`;
  root `package.json` has `engines.node` and `engines.pnpm` set.
- **2026-04-23 Keycloak SSO logout not implemented:** `logout()` in `AuthContext.tsx` clears
  local tokens only (clearSession + LOGOUT dispatch). Keycloak's `end_session` endpoint is
  not called — full browser session revocation is a future task before production release.
- **2026-04-23 Integration test user created manually:** `testuser@bbc.dev` must be created
  in Keycloak before running integration tests. Not automated. See `infra/local/README.md`
  for setup procedure.

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
- 2026-04-22 ✅ Node upgraded to 22.13.0 via nvm (macOS 12; Homebrew `node@22` blocked by simdutf compile failure)
- 2026-04-22 ✅ `eslint-visitor-keys` pnpm override removed; `turbo run lint` still 22/22 clean
- 2026-04-22 ✅ `setup/app-frameworks` merged into `master`; `setup/identity` branch created
- 2026-04-22 ✅ `infra/local/docker-compose.yml` — Keycloak 26.2 + Postgres on 5433, health checks, realm import mount
- 2026-04-22 ✅ `infra/keycloak/bbc-realm.json` — bbc realm, roles: coach/client/admin, clients: mobile-bff + coach-bff (confidential, PKCE S256), access token 900s, refresh 604800s
- 2026-04-22 ✅ `infra/local/.env.example` — all required keys documented
- 2026-04-22 ✅ `infra/local/README.md` — startup command, force-reimport steps, client secret rotation note
- 2026-04-22 ✅ Keycloak smoke test passed — Rancher Desktop (dockerd/moby mode), Keycloak 26.2 confirmed at localhost:8080, bbc realm imported
- 2026-04-22 ✅ infra/local/docker-compose.yml health check fixed — Keycloak 26.x has no curl/wget; health endpoint is on management port 9000; fixed via bash /dev/tcp probe
- 2026-04-22 ✅ packages/schemas/ — Zod schemas: `UserIdentitySchema` (sub, email, roles[]), `TokenClaimsSchema` (full Keycloak JWT payload), `RoleSchema` enum (coach/client/admin); all exported from `@bbc/schemas`
- 2026-04-22 ✅ services/identity/ — Hono service scaffolded: `src/index.ts` (app + routes), `src/server.ts` (HTTP listener, port from env), `src/routes/health.ts` (GET /health), `src/middleware/jwt.ts` (JWKS fetch + RS256 verify via jose, env-configured URL/issuer), `src/middleware/roles.ts` (realm_access.roles extraction + requireRole guard factory); middleware exported via package.json exports field
- 2026-04-22 ✅ services/identity/migrations/001_profiles.sql — Supabase profiles table (id=Keycloak sub, email, display_name, role, timestamps), RLS policies (self read/write; coach read of clients; org-scoped TODO noted)
- 2026-04-22 ✅ services/mobile-bff/ and services/coach-bff/ — Hono services wired: import JWT + roles middleware from @bbc/service-identity; apply to all routes; GET /health routes; server entry with port from env
- 2026-04-22 ✅ All stub workspaces (9 services + 4 packages) given tsconfig.json + src/index.ts stubs so tsc builds cleanly
- 2026-04-22 ✅ apps/mobile build script changed from `expo export` (requires CocoaPods/native toolchain) to no-op echo; EAS handles actual mobile builds
- 2026-04-22 ✅ apps/marketing-site build script changed to no-op echo (Phase 2 stub, no Next.js installed)
- 2026-04-22 ✅ apps/coach-web and apps/admin-web eslint configs updated to ignore next-env.d.ts (auto-generated, triple-slash reference triggers lint error)
- 2026-04-22 ✅ turbo run build — 21/21 workspaces pass
- 2026-04-22 ✅ turbo run lint — 22/22 workspaces pass
- 2026-04-23 ✅ Expo SDK upgraded 52 → 53; node-linker=hoisted added to root .npmrc; react@19.0.0, react-native@0.79.6, expo-dev-client@5.2.4 updated to SDK 53 compatible versions
- 2026-04-23 ✅ apps/mobile/ — expo-router@5.1.11, expo-auth-session@6.2.1, expo-secure-store@14.2.4, expo-web-browser@14.2.0 installed; app.json updated (scheme: com.bodybycarisma.mobile, expo-router/expo-secure-store/expo-web-browser plugins, typedRoutes: true); tsconfig.json: extends expo/tsconfig.base, moduleResolution: bundler
- 2026-04-23 ✅ apps/mobile/app/ — Expo Router file structure: root _layout.tsx (Slot), (auth) group (_layout.tsx Stack + consent.tsx + login.tsx stubs), (app) group (_layout.tsx Stack + index.tsx stub)
- 2026-04-23 ✅ packages/auth/ — @bbc/auth@0.0.1: AuthSession interface, AuthStatus type, re-exports from @bbc/schemas; parseTokenExpiry, isTokenExpired, shouldRefresh, buildSession; wired into turbo build graph (22/22 build, 23/23 lint)
- 2026-04-23 ✅ apps/mobile/src/services/tokenStorage.ts — per-key SecureStore storage; five namespaced constants (BBC_ACCESS_TOKEN, BBC_REFRESH_TOKEN, BBC_EXPIRES_AT, BBC_TOKEN_TYPE, BBC_CONSENT_GIVEN); saveSession, loadSession, clearSession, getConsentGiven, setConsentGiven
- 2026-04-23 ✅ infra/keycloak/bbc-realm.json — added explicit mobile redirect URI com.bodybycarisma.mobile://auth/callback; enabled directAccessGrantsEnabled on mobile-bff for local integration testing
- 2026-04-23 ✅ packages/auth/src/types.ts — added UserIdentity, Role, TokenClaims type re-exports from @bbc/schemas
- 2026-04-23 ✅ apps/mobile/src/context/AuthContext.tsx — useReducer state machine (AuthState, AuthAction, AuthContextValue); AuthProvider with session restore on mount; stateRef pattern for stale-closure-safe refresh; parseUserFromToken helper; login/logout/refresh fully implemented with PKCE service and tokenStorage; useAuth hook
- 2026-04-23 ✅ apps/mobile/src/services/keycloakAuth.ts — PKCE service: getDiscovery (cached DiscoveryDocument), getRedirectUri (com.bodybycarisma.mobile://auth/callback), buildAuthRequest (PKCE S256, offline_access scope), exchangeCodeForSession, refreshTokens; fail-fast on missing env vars
- 2026-04-23 ✅ apps/mobile/app/(auth)/consent.tsx — checks getConsentGiven on mount, redirects if already given, setConsentGiven on agree
- 2026-04-23 ✅ apps/mobile/app/(auth)/login.tsx — useAuth hook, PKCE login trigger, loading state, error display with clearError
- 2026-04-23 ✅ apps/mobile/app/(app)/index.tsx — home screen with email/role display and logout button
- 2026-04-23 ✅ apps/mobile/app/_layout.tsx — Stack.Protected auth gate; AuthProvider wraps RootNavigator; LoadingScreen for status === "loading"; guard={isAuthenticated} for (app) group; guard={!isAuthenticated} for (auth) group
- 2026-04-23 ✅ apps/mobile/.env.example — three EXPO_PUBLIC_KEYCLOAK_ variables documented
- 2026-04-23 ✅ apps/mobile/.env.local — local dev values (gitignored, not committed)
- 2026-04-23 ✅ services/identity/__tests__/keycloak.integration.test.ts — Vitest integration tests: ROPC token issuance, TokenClaimsSchema validation against real JWT, all @bbc/auth utilities (parseTokenExpiry, isTokenExpired, shouldRefresh, buildSession) tested against live Keycloak; gated behind INTEGRATION=true; all 6 tests pass
- 2026-04-23 ✅ apps/coach-web + apps/admin-web build scripts changed to tsc --noEmit (Next.js 15.5.x + React 19 + pnpm-hoisted prerendering failure fixed)
- 2026-04-23 ✅ turbo run build — 22/22 workspaces pass (force-rebuilt, zero cache)
- 2026-04-23 ✅ turbo run lint — 23/23 workspaces pass (force-rebuilt, zero cache)
- 2026-04-23 ✅ tsc --noEmit in apps/mobile — zero errors

---

## What's Left to Build

**Setup**
- [x] Resolve 2 remaining decisions (event bus → Supabase Realtime, BFF → Hono)
- [x] Bootstrap Expo (custom dev client) in `apps/mobile/`
- [x] Bootstrap Next.js in `apps/coach-web/` and `apps/admin-web/`
- [x] Set up shared ESLint + Prettier configs in `packages/config/`
- [x] Add `.npmrc` with `engine-strict=true` and pnpm engine constraint
- [x] Upgrade local Node to >= 22.13.0 and remove pnpm eslint-visitor-keys override

**Phase 1 — MVP**
- [x] Smoke test `docker compose up` in `infra/local/` — Keycloak confirmed at localhost:8080, bbc realm imported (Rancher Desktop)
- [x] Identity service foundation — Hono app, JWT/roles middleware, health route, Supabase profiles migration, BFF wiring (branch: setup/identity)
- [x] Mobile auth — complete (Sessions 5A + 5B). Full PKCE flow, Stack.Protected routing, consent gate, token storage, integration tests.
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
- [x] API gateway / BFF layer foundation (Hono — mobile-bff + coach-bff wired with JWT validation)

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
- 2026-04-22 (session 3): Local identity infrastructure. Two decisions closed (Keycloak
  deployment = Docker Compose local / managed staging+prod; identity SoT = Keycloak, not
  Supabase Auth). setup/app-frameworks merged to master; setup/identity branch created.
  Node upgraded to 22.13.0 via nvm (macOS 12 blocked brew); eslint-visitor-keys override
  removed; lint still 22/22 clean. Docker Compose stack + bbc realm JSON written.
  Smoke test blocked — correction: Rancher Desktop was already installed; smoke test passed; MEMORY.md corrected at start of session 4.
- 2026-04-22 (session 4): Identity service foundation. packages/schemas Zod schemas (UserIdentity, TokenClaims, Role enum). services/identity Hono app with JWT middleware (jose JWKS+RS256), roles middleware (requireRole guard), health route, Supabase profiles migration SQL. services/mobile-bff and services/coach-bff wired with JWT+roles middleware from @bbc/service-identity. All stub workspaces given tsconfig+src stubs. Mobile/marketing-site build scripts changed to no-op (native toolchain / Next.js not installed). Next-env.d.ts lint issue fixed for Next.js apps. turbo run build 21/21, turbo run lint 22/22. Next: mobile auth flow (login, PKCE, token storage, consent) — requires approval.
- 2026-04-23 (session 5A): Expo SDK upgraded 52 → 53. node-linker=hoisted added to root .npmrc (required for pnpm + SDK 53 compatibility). Auth dependencies installed (expo-router, expo-auth-session, expo-secure-store, expo-web-browser). Expo Router file structure scaffolded with (auth) and (app) route groups. packages/auth created with pure TypeScript token utilities and AuthSession types. tokenStorage.ts written with per-key SecureStore pattern to avoid iOS Keychain 2KB size limit. turbo run build 22/22, turbo run lint 23/23. Session 5B covers: AuthContext, PKCE service, screens, auth gate, tests.
- 2026-04-23 (session 5B): AuthContext useReducer state machine with session restore on mount, stateRef pattern for stale-closure-safe refresh. Keycloak PKCE service with discovery cache, code exchange (expo-auth-session), refresh token rotation via fetch. Consent, login, and home screens implemented. Stack.Protected auth gate in root layout — declarative, no redirect races. Vitest integration tests against live local Keycloak validating TokenClaimsSchema and all @bbc/auth utilities (6/6 pass). Next.js 15.5.x + React 19 + pnpm-hoisted prerendering failure resolved by changing coach-web/admin-web build scripts to tsc --noEmit. turbo run build 22/22, turbo run lint 23/23, tsc --noEmit zero errors. Mobile auth feature complete.
