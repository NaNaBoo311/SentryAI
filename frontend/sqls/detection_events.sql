-- =============================================================
-- DETECTION_EVENTS: human detection event records
-- =============================================================

-- Table
CREATE TABLE IF NOT EXISTS public.detection_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  camera_id     UUID REFERENCES public.cameras(id) ON DELETE SET NULL,
  confidence    REAL NOT NULL DEFAULT 0,
  bbox          JSONB DEFAULT '[]'::jsonb,
  snapshot_url  TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'detected',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_detection_events_user_created
  ON public.detection_events(user_id, created_at DESC);

-- RLS
ALTER TABLE public.detection_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detection events"
  ON public.detection_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detection events"
  ON public.detection_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RPC: get_detection_history
CREATE OR REPLACE FUNCTION public.get_detection_history(
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id            UUID,
  user_id       UUID,
  camera_id     UUID,
  camera_name   TEXT,
  confidence    REAL,
  bbox          JSONB,
  snapshot_url  TEXT,
  status        TEXT,
  created_at    TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    de.id,
    de.user_id,
    de.camera_id,
    c.name AS camera_name,
    de.confidence,
    de.bbox,
    de.snapshot_url,
    de.status,
    de.created_at
  FROM public.detection_events de
  LEFT JOIN public.cameras c ON c.id = de.camera_id
  WHERE de.user_id = auth.uid()
  ORDER BY de.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- RPC: log_detection_event
CREATE OR REPLACE FUNCTION public.log_detection_event(
  p_camera_id    UUID,
  p_confidence   REAL,
  p_bbox         JSONB DEFAULT '[]'::jsonb,
  p_snapshot_url TEXT DEFAULT '',
  p_status       TEXT DEFAULT 'detected'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.detection_events (user_id, camera_id, confidence, bbox, snapshot_url, status)
  VALUES (auth.uid(), p_camera_id, p_confidence, p_bbox, p_snapshot_url, p_status)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
