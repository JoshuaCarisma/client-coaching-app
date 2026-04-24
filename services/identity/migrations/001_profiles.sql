-- profiles table: keyed on Keycloak sub claim.
-- id = Keycloak sub (uuid). No separate keycloak_sub column needed.
-- Do NOT use Supabase Auth — Keycloak is the sole identity source of truth.
--
-- JWT WIRING NOTE (Phase 1 vs Phase 2):
-- Phase 1: All client access routes through BFF (mobile-bff, coach-bff) using
--   the service_role key, which bypasses RLS entirely. RLS is defense-in-depth only.
-- Phase 2: Wire Keycloak RS256 public key to Supabase so auth.uid() and auth.jwt()
--   can resolve Keycloak-signed JWTs directly. This enables direct client-to-Supabase
--   access if ever needed. Until then, auth.uid() only works for Supabase-native tokens.
-- Architecture decision: "UI clients never call services directly — always through
--   API gateway / BFF." Direct Supabase access from clients is not a Phase 1 requirement.

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid        PRIMARY KEY,           -- Keycloak sub
  email        text        NOT NULL,
  display_name text,
  role         text        NOT NULL CHECK (role IN ('coach', 'client', 'admin')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at current on every row update.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: enable and enforce row-level security.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read and write their own row.
-- Phase 1: bypassed by service_role key in BFF — this is defense-in-depth.
-- Phase 2: auth.uid() will resolve correctly once Keycloak JWT wiring is complete.
CREATE POLICY profiles_self
  ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: coaches can read profile rows of clients.
-- Reads role directly from the JWT claim (auth.jwt()) to avoid RLS recursion —
-- a subquery on profiles is itself subject to RLS, causing incorrect results or errors.
-- Phase 1: bypassed by service_role key in BFF — this is defense-in-depth.
-- Phase 2: auth.jwt() will carry Keycloak role claim once JWT wiring is complete.
-- TODO: scope to org when coach-client org association table is defined.
CREATE POLICY profiles_coach_read
  ON profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'coach'
    AND role = 'client'
    -- TODO: scope to org when coach-client org model is built
  );