-- Migration: Push Subscriptions, User Preferences, Notification Logs, and Idempotency
-- Project: YERO

-- 1. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_push_subscription_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.push_subscriptions(endpoint);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  active_hours_start_ist INT NOT NULL DEFAULT 9 CHECK (active_hours_start_ist >= 0 AND active_hours_start_ist <= 23),
  active_hours_end_ist INT NOT NULL DEFAULT 21 CHECK (active_hours_end_ist >= 0 AND active_hours_end_ist <= 23),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Notification Logs Table (For Idempotency & Duplicate Prevention)
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'DAILY_PROMPT', 'NO_TASKS_REMINDER', 'PROGRESS_REMINDER', 'ALL_COMPLETED'
  target_date_ist DATE NOT NULL,
  hour_slot_ist INT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SENT', -- 'PENDING', 'SENT', 'FAILED', 'SKIPPED'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_notif_log_dedup UNIQUE (user_id, target_date_ist, event_type, hour_slot_ist)
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_user_date ON public.notification_logs(user_id, target_date_ist);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can view their own push subscriptions') THEN
    CREATE POLICY "Users can view their own push subscriptions"
      ON public.push_subscriptions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can insert their own push subscriptions') THEN
    CREATE POLICY "Users can insert their own push subscriptions"
      ON public.push_subscriptions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can update their own push subscriptions') THEN
    CREATE POLICY "Users can update their own push subscriptions"
      ON public.push_subscriptions FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can delete their own push subscriptions') THEN
    CREATE POLICY "Users can delete their own push subscriptions"
      ON public.push_subscriptions FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for user_preferences
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view their own preferences') THEN
    CREATE POLICY "Users can view their own preferences"
      ON public.user_preferences FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can insert their own preferences') THEN
    CREATE POLICY "Users can insert their own preferences"
      ON public.user_preferences FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update their own preferences') THEN
    CREATE POLICY "Users can update their own preferences"
      ON public.user_preferences FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for notification_logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'Users can view their own notification logs') THEN
    CREATE POLICY "Users can view their own notification logs"
      ON public.notification_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'Users can insert their own notification logs') THEN
    CREATE POLICY "Users can insert their own notification logs"
      ON public.notification_logs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'Users can delete their own notification logs') THEN
    CREATE POLICY "Users can delete their own notification logs"
      ON public.notification_logs FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- 4. Server Helper Functions (SECURITY DEFINER for atomic cron / worker operations)

-- Atomic claim slot to guarantee 0 duplicate notifications across instances/threads
CREATE OR REPLACE FUNCTION public.claim_notification_slot(
  p_user_id UUID,
  p_event_type TEXT,
  p_target_date_ist DATE,
  p_hour_slot_ist INT,
  p_title TEXT,
  p_body TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notification_logs (
    user_id, event_type, target_date_ist, hour_slot_ist, title, body, status
  )
  VALUES (
    p_user_id, p_event_type, p_target_date_ist, p_hour_slot_ist, p_title, p_body, 'PENDING'
  )
  ON CONFLICT (user_id, target_date_ist, event_type, hour_slot_ist) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Mark notification status
CREATE OR REPLACE FUNCTION public.set_notification_status(
  p_log_id UUID,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notification_logs
  SET status = p_status,
      sent_at = now()
  WHERE id = p_log_id;
END;
$$;

-- Prune invalid/expired push subscription (410/404)
CREATE OR REPLACE FUNCTION public.prune_push_subscription(
  p_endpoint TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM public.push_subscriptions
  WHERE endpoint = p_endpoint;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Fetch active subscribers for background reminder processing
CREATE OR REPLACE FUNCTION public.get_subscribers_for_reminders()
RETURNS TABLE (
  user_id UUID,
  notifications_enabled BOOLEAN,
  active_hours_start_ist INT,
  active_hours_end_ist INT,
  subscription_id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.user_id,
    COALESCE(up.notifications_enabled, TRUE) AS notifications_enabled,
    COALESCE(up.active_hours_start_ist, 9) AS active_hours_start_ist,
    COALESCE(up.active_hours_end_ist, 21) AS active_hours_end_ist,
    ps.id AS subscription_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth
  FROM public.push_subscriptions ps
  LEFT JOIN public.user_preferences up ON up.user_id = ps.user_id
  WHERE COALESCE(up.notifications_enabled, TRUE) = TRUE;
END;
$$;

-- Securely get task counts for a user on a given date (SECURITY DEFINER for cron worker)
CREATE OR REPLACE FUNCTION public.get_user_task_summary_for_ist_date(
  p_user_id UUID,
  p_start_utc TIMESTAMPTZ,
  p_end_utc TIMESTAMPTZ
)
RETURNS TABLE (
  total_tasks INT,
  completed_tasks INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT AS total_tasks,
    COUNT(*) FILTER (WHERE completed = TRUE)::INT AS completed_tasks
  FROM public.tasks
  WHERE user_id = p_user_id
    AND created_at >= p_start_utc
    AND created_at <= p_end_utc;
END;
$$;

