-- =============================================================
-- DETECTION_SETTINGS: per-user detection configuration
-- =============================================================

-- Table
CREATE TABLE IF NOT EXISTS public.detection_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  detection_enabled     BOOLEAN DEFAULT true,
  confidence_threshold  REAL DEFAULT 0.5,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.detection_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detection settings"
  ON public.detection_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own detection settings"
  ON public.detection_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER detection_settings_updated_at
  BEFORE UPDATE ON public.detection_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create default settings when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.detection_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_settings();

-- RPC: get_my_detection_settings
CREATE OR REPLACE FUNCTION public.get_my_detection_settings()
RETURNS SETOF public.detection_settings
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.detection_settings WHERE user_id = auth.uid();
$$;

-- RPC: update_detection_settings
CREATE OR REPLACE FUNCTION public.update_detection_settings(
  p_detection_enabled    BOOLEAN DEFAULT NULL,
  p_confidence_threshold REAL DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.detection_settings
  SET
    detection_enabled    = COALESCE(p_detection_enabled, detection_enabled),
    confidence_threshold = COALESCE(p_confidence_threshold, confidence_threshold)
  WHERE user_id = auth.uid();
END;
$$;
