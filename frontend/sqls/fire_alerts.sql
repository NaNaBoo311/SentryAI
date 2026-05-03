-- =============================================================
-- FIRE_ALERTS: ghi lại các sự kiện cảnh báo cháy
-- =============================================================

CREATE TABLE IF NOT EXISTS public.fire_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature         REAL NOT NULL,
  status              TEXT NOT NULL DEFAULT 'triggered',  -- 'triggered', 'resolved'
  alert_message       TEXT DEFAULT 'Temperature exceeds threshold',
  created_at          TIMESTAMPTZ DEFAULT now(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fire_alerts_user_created
  ON public.fire_alerts(user_id, created_at DESC);

ALTER TABLE public.fire_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fire alerts"
  ON public.fire_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fire alerts"
  ON public.fire_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RPC: get_fire_alerts
CREATE OR REPLACE FUNCTION public.get_fire_alerts(
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF public.fire_alerts
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.fire_alerts
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- RPC: log_fire_alert
CREATE OR REPLACE FUNCTION public.log_fire_alert(
  p_temperature REAL,
  p_status      TEXT DEFAULT 'triggered'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.fire_alerts (user_id, temperature, status, alert_message)
  VALUES (
    auth.uid(),
    p_temperature,
    p_status,
    'Fire alert: Temperature ' || p_temperature || '°C'
  )
  RETURNING id INTO new_id;
  
  -- Auto-create notification
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (
    auth.uid(),
    '🔥 Fire Alert!',
    'Temperature exceeded threshold: ' || ROUND(p_temperature::numeric, 1) || '°C'
  );
  
  RETURN new_id;
END;
$$;