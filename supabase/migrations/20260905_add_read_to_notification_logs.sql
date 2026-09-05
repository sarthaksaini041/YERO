-- Add read column to notification_logs for tracking unread notifications
ALTER TABLE public.notification_logs ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS notification_logs_user_id_read_idx ON public.notification_logs(user_id, read);
