-- Room art is private to each authenticated user; no public image bucket.
CREATE TABLE IF NOT EXISTS public.go_personal_rooms (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  palette_id text NOT NULL CHECK (palette_id IN ('after-rain','peach-dusk','sage-pages','blue-hour','amber-earth','lilac-light')),
  vibe_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_image_path_owner CHECK (image_path IS NULL OR image_path LIKE user_id::text || '/%'),
  CONSTRAINT room_vibes_array CHECK (jsonb_typeof(vibe_ids) = 'array' AND jsonb_array_length(vibe_ids) <= 3)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.go_personal_rooms TO authenticated;
ALTER TABLE public.go_personal_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_select_own" ON public.go_personal_rooms FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "room_insert_own" ON public.go_personal_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "room_update_own" ON public.go_personal_rooms FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "room_delete_own" ON public.go_personal_rooms FOR DELETE TO authenticated USING (auth.uid()=user_id);

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('go-private-rooms','go-private-rooms',false,4194304,ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "go_rooms_storage_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='go-private-rooms' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY "go_rooms_storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='go-private-rooms' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY "go_rooms_storage_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='go-private-rooms' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id='go-private-rooms' AND (storage.foldername(name))[1]=auth.uid()::text);

-- The room-art quota is separate from text analysis and catalog search.
CREATE OR REPLACE FUNCTION public.go_take_request(p_bucket text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cap integer; duration interval; allowed boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_bucket = 'catalog' THEN cap := 20; duration := interval '1 minute';
  ELSIF p_bucket = 'analysis' THEN cap := 5; duration := interval '1 hour';
  ELSIF p_bucket = 'room' THEN cap := 2; duration := interval '1 day';
  ELSE RAISE EXCEPTION 'Invalid request bucket'; END IF;
  INSERT INTO public.go_request_limits(user_id,bucket,window_start,used)
  VALUES(auth.uid(),p_bucket,now(),1)
  ON CONFLICT(user_id,bucket) DO UPDATE
  SET used = CASE WHEN go_request_limits.window_start <= now()-duration THEN 1 ELSE go_request_limits.used+1 END,
      window_start = CASE WHEN go_request_limits.window_start <= now()-duration THEN now() ELSE go_request_limits.window_start END
  WHERE go_request_limits.window_start <= now()-duration OR go_request_limits.used < cap
  RETURNING true INTO allowed;
  RETURN coalesce(allowed,false);
END $$;
