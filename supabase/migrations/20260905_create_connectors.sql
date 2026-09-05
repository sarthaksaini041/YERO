-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create user_connectors table
-- Stores platform connector records per user (LeetCode, CodeChef, Codeforces).
-- A user can have at most ONE connector per platform (unique constraint).
-- Profile data is stored as JSONB (normalized ConnectorProfile shape).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_connectors (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform                TEXT        NOT NULL CHECK (platform IN ('leetcode', 'codechef', 'codeforces')),
  platform_username       TEXT        NOT NULL CHECK (char_length(trim(platform_username)) > 0),
  status                  TEXT        NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'error', 'syncing')),
  profile_data            JSONB,
  last_synced_at          TIMESTAMPTZ,
  last_sync_attempted_at  TIMESTAMPTZ,
  error_message           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One connector per platform per user
  CONSTRAINT user_connectors_user_platform_unique UNIQUE (user_id, platform)
);

-- Fast lookup by user
CREATE INDEX IF NOT EXISTS user_connectors_user_id_idx
  ON public.user_connectors (user_id);

-- Fast lookup by platform
CREATE INDEX IF NOT EXISTS user_connectors_platform_idx
  ON public.user_connectors (platform);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.user_connectors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- SELECT: users can only read their own connectors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_connectors'
      AND policyname = 'Users can view their own connectors'
  ) THEN
    CREATE POLICY "Users can view their own connectors"
      ON public.user_connectors FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- INSERT: users can only insert their own connectors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_connectors'
      AND policyname = 'Users can insert their own connectors'
  ) THEN
    CREATE POLICY "Users can insert their own connectors"
      ON public.user_connectors FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE: users can only update their own connectors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_connectors'
      AND policyname = 'Users can update their own connectors'
  ) THEN
    CREATE POLICY "Users can update their own connectors"
      ON public.user_connectors FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- DELETE: users can only delete their own connectors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_connectors'
      AND policyname = 'Users can delete their own connectors'
  ) THEN
    CREATE POLICY "Users can delete their own connectors"
      ON public.user_connectors FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
