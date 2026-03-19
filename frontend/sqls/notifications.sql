-- =============================================================
-- NOTIFICATIONS: alert records for users
-- =============================================================

-- Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL DEFAULT 'Alert',
  message             TEXT NOT NULL DEFAULT '',
  is_read             BOOLEAN DEFAULT false,
  detection_event_id  UUID REFERENCES public.detection_events(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON public.notifications(user_id, is_read, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-create notification when detection_event is inserted
CREATE OR REPLACE FUNCTION public.handle_new_detection_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, detection_event_id)
  VALUES (
    NEW.user_id,
    'Person Detected',
    'A person was detected with ' || ROUND(NEW.confidence::numeric * 100) || '% confidence.',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_detection_event_created
  AFTER INSERT ON public.detection_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_detection_event();

-- RPC: get_my_notifications
CREATE OR REPLACE FUNCTION public.get_my_notifications(
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF public.notifications
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.notifications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- RPC: mark_notification_read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- RPC: mark_all_notifications_read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- RPC: get_unread_notification_count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INT FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = false;
$$;
