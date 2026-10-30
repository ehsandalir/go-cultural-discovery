CREATE TABLE public.go_preferences (
 user_id uuid PRIMARY KEY,
 name text NOT NULL DEFAULT '',
 age integer,
 gender text,
 country text NOT NULL DEFAULT '',
 language text NOT NULL DEFAULT 'English',
 favorites jsonb NOT NULL DEFAULT '{"movies":[],"music":[],"books":[],"style":[]}'::jsonb,
 save_consent boolean NOT NULL DEFAULT false,
 ai_consent boolean NOT NULL DEFAULT false,
 consent_version text NOT NULL DEFAULT 'go-taste-v1',
 consent_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT go_name_length CHECK (char_length(name) <= 60),
 CONSTRAINT go_age_range CHECK (age IS NULL OR age BETWEEN 1 AND 120),
 CONSTRAINT go_gender_length CHECK (gender IS NULL OR char_length(gender) <= 60),
 CONSTRAINT go_country_length CHECK (char_length(country) <= 80),
 CONSTRAINT go_language_length CHECK (char_length(language) <= 60),
 CONSTRAINT go_consent_required CHECK (save_consent = true)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.go_preferences TO authenticated;
GRANT ALL ON public.go_preferences TO service_role;
ALTER TABLE public.go_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY go_read_own ON public.go_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY go_insert_own ON public.go_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY go_update_own ON public.go_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY go_delete_own ON public.go_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE FUNCTION public.go_validate_favorites() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE category text; item jsonb;
BEGIN
 IF jsonb_typeof(NEW.favorites) <> 'object' OR (NEW.favorites - ARRAY['movies','music','books','style']) <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid favorite categories'; END IF;
 FOREACH category IN ARRAY ARRAY['movies','music','books','style'] LOOP
 IF jsonb_typeof(NEW.favorites->category) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid favorites'; END IF;
 IF jsonb_array_length(NEW.favorites->category) > 3 THEN RAISE EXCEPTION 'Maximum three favorites per category'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(NEW.favorites->category) LOOP
 IF jsonb_typeof(item) <> 'object' OR jsonb_typeof(item->'title') IS DISTINCT FROM 'string' OR char_length(item->>'title') NOT BETWEEN 1 AND 120 OR (item->>'source') IS NULL OR (item->>'source') NOT IN ('manual','tmdb','google-books','spotify') OR (item - ARRAY['title','source','id']) <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid favorite item'; END IF;
 IF item ? 'id' AND (jsonb_typeof(item->'id') <> 'string' OR char_length(item->>'id') > 120) THEN RAISE EXCEPTION 'Invalid favorite identifier'; END IF;
 END LOOP;
 END LOOP;
 NEW.updated_at := now(); NEW.consent_at := now(); RETURN NEW;
END $$;
CREATE TRIGGER go_preferences_validate BEFORE INSERT OR UPDATE ON public.go_preferences FOR EACH ROW EXECUTE FUNCTION public.go_validate_favorites();
CREATE TABLE public.go_request_limits (user_id uuid NOT NULL, bucket text NOT NULL, window_start timestamptz NOT NULL DEFAULT now(), used integer NOT NULL DEFAULT 0, PRIMARY KEY(user_id,bucket));
GRANT ALL ON public.go_request_limits TO service_role;
ALTER TABLE public.go_request_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.go_take_request(p_bucket text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cap integer; duration interval; allowed boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF p_bucket = 'catalog' THEN cap := 20; duration := interval '1 minute';
 ELSIF p_bucket = 'analysis' THEN cap := 5; duration := interval '1 hour';
 ELSE RAISE EXCEPTION 'Invalid request bucket'; END IF;
 INSERT INTO public.go_request_limits(user_id,bucket,window_start,used) VALUES(auth.uid(),p_bucket,now(),1)
 ON CONFLICT(user_id,bucket) DO UPDATE SET used = CASE WHEN go_request_limits.window_start <= now()-duration THEN 1 ELSE go_request_limits.used+1 END, window_start = CASE WHEN go_request_limits.window_start <= now()-duration THEN now() ELSE go_request_limits.window_start END
 WHERE go_request_limits.window_start <= now()-duration OR go_request_limits.used < cap
 RETURNING true INTO allowed;
 RETURN coalesce(allowed,false);
END $$;
REVOKE ALL ON FUNCTION public.go_take_request(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.go_take_request(text) TO authenticated;
