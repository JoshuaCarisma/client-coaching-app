-- profiles table: keyed on Keycloak sub claim.
-- auth.uid() returns the Keycloak sub once JWT wiring is confirmed in Supabase.
-- Do NOT use Supabase Auth — Keycloak is the sole identity source of truth.

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
CREATE POLICY profiles_self
  ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: coaches can read profile rows of clients in their org.
-- TODO: org membership relationship is TBD — update this policy once the
-- org/coach-client association table is defined. For now the policy grants
-- coaches read access to all client rows; scope to org when ready.
CREATE POLICY profiles_coach_read
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles coach_row
      WHERE coach_row.id = auth.uid()
        AND coach_row.role = 'coach'
    )
    AND role = 'client'
  );
