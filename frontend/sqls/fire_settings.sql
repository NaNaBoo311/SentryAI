-- =============================================================
-- FIRE_SETTINGS: cấu hình cảm biến cháy cho user
-- =============================================================

CREATE TABLE IF NOT EXISTS public.fire_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fire_detection_enabled BOOLEAN DEFAULT true,
  temperature_threshold REAL DEFAULT 20.0,  -- °C
  device_ip           TEXT DEFAULT '',  -- IP của mạch (optional)
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fire_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fire settings"
  ON public.fire_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own fire settings"
  ON public.fire_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER fire_settings_updated_at
  BEFORE UPDATE ON public.fire_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create fire settings khi profile được tạo
CREATE OR REPLACE FUNCTION public.handle_new_fire_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.fire_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_profile_created_fire_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_fire_settings();

-- RPC: get_my_fire_settings
CREATE OR REPLACE FUNCTION public.get_my_fire_settings()
RETURNS SETOF public.fire_settings
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.fire_settings WHERE user_id = auth.uid();
$$;

-- RPC: update_fire_settings
CREATE OR REPLACE FUNCTION public.update_fire_settings(
  p_fire_detection_enabled BOOLEAN DEFAULT NULL,
  p_temperature_threshold  REAL DEFAULT NULL,
  p_device_ip              TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fire_settings
  SET
    fire_detection_enabled = COALESCE(p_fire_detection_enabled, fire_detection_enabled),
    temperature_threshold  = COALESCE(p_temperature_threshold, temperature_threshold),
    device_ip              = COALESCE(p_device_ip, device_ip)
  WHERE user_id = auth.uid();
END;
$$;