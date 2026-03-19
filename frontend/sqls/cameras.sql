-- =============================================================
-- CAMERAS: user-owned camera records
-- =============================================================

-- Table
CREATE TABLE IF NOT EXISTS public.cameras (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Camera',
  device_id  TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cameras_user_id ON public.cameras(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cameras_user_device ON public.cameras(user_id, device_id);

-- RLS
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cameras"
  ON public.cameras FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cameras"
  ON public.cameras FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cameras"
  ON public.cameras FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cameras"
  ON public.cameras FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER cameras_updated_at
  BEFORE UPDATE ON public.cameras
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RPC: get_my_cameras
CREATE OR REPLACE FUNCTION public.get_my_cameras()
RETURNS SETOF public.cameras
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.cameras WHERE user_id = auth.uid() ORDER BY created_at;
$$;

-- RPC: upsert_camera
CREATE OR REPLACE FUNCTION public.upsert_camera(
  p_name      TEXT,
  p_device_id TEXT
)
RETURNS public.cameras
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.cameras;
BEGIN
  INSERT INTO public.cameras (user_id, name, device_id)
  VALUES (auth.uid(), p_name, p_device_id)
  ON CONFLICT (user_id, device_id)
  DO UPDATE SET name = EXCLUDED.name, updated_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

-- RPC: delete_camera
CREATE OR REPLACE FUNCTION public.delete_camera(p_camera_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cameras WHERE id = p_camera_id AND user_id = auth.uid();
END;
$$;

-- RPC: set_camera_active
CREATE OR REPLACE FUNCTION public.set_camera_active(
  p_camera_id  UUID,
  p_is_active  BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cameras
  SET is_active = p_is_active
  WHERE id = p_camera_id AND user_id = auth.uid();
END;
$$;
