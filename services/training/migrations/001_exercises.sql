-- Migration: 001_exercises.sql
-- Service: training
-- Purpose: Exercise library — the foundation of all training domain data
--
-- Access pattern: services use service_role key (bypasses RLS)
-- RLS is defense-in-depth only in Phase 1
-- Phase 2: wire Keycloak RS256 key to Supabase for direct client access
-- See: services/identity/migrations/001_profiles.sql for JWT wiring notes

-- muscle_groups and equipment stored as text[] for flexibility
-- Both validated at application layer via Zod — not as Postgres enums
-- Reason: Postgres enum migrations are painful; Zod enums are free to extend

CREATE TABLE IF NOT EXISTS exercises (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description   text        CHECK (char_length(description) <= 1000),
  instructions  text        CHECK (char_length(instructions) <= 5000),
  video_url     text,
  muscle_groups text[]      NOT NULL DEFAULT '{}',
  equipment     text[]      NOT NULL DEFAULT '{}',
  difficulty    text        NOT NULL CHECK (difficulty IN
                            ('beginner', 'intermediate', 'advanced')),
  is_public     boolean     NOT NULL DEFAULT true,
  created_by    uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for the query patterns in ExerciseListQuerySchema
CREATE INDEX idx_exercises_difficulty    ON exercises (difficulty);
CREATE INDEX idx_exercises_is_public     ON exercises (is_public);
CREATE INDEX idx_exercises_created_by    ON exercises (created_by);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_exercises_equipment     ON exercises USING GIN (equipment);
-- GIN indexes on text[] columns support efficient @> (contains) queries

-- Full-text search index for the search parameter
CREATE INDEX idx_exercises_search ON exercises
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- updated_at trigger (reuse function if already created by profiles migration)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER exercises_set_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: enabled as defense-in-depth
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Public exercises readable by anyone authenticated
CREATE POLICY exercises_public_read
  ON exercises FOR SELECT
  USING (is_public = true);

-- Coaches can read their own private exercises
CREATE POLICY exercises_owner_read
  ON exercises FOR SELECT
  USING (
    is_public = false
    AND created_by = (auth.jwt() ->> 'sub')::uuid
  );

-- Only coaches can create exercises
-- TODO: enforce coach role check once RLS JWT wiring is complete (Phase 2)
CREATE POLICY exercises_coach_write
  ON exercises FOR ALL
  USING   (created_by = (auth.jwt() ->> 'sub')::uuid)
  WITH CHECK (created_by = (auth.jwt() ->> 'sub')::uuid);
