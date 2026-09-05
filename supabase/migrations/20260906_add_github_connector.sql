-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add 'github' to user_connectors platform check constraint
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_connectors 
  DROP CONSTRAINT IF EXISTS user_connectors_platform_check;

ALTER TABLE public.user_connectors 
  ADD CONSTRAINT user_connectors_platform_check 
  CHECK (platform IN ('leetcode', 'codechef', 'codeforces', 'github'));
