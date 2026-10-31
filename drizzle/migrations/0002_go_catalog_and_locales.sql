-- GO cultural catalog v1. Apply after 0000 and 0001.
-- User-generated suggestions are private until an administrator approves them.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS spoken_language text NOT NULL DEFAULT 'fa',
  ADD COLUMN IF NOT EXISTS birth_year integer;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_preferred_language_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_preferred_language_check CHECK (preferred_language IN ('fa','en','fr','es','de'));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_spoken_language_check CHECK (spoken_language IN ('fa','en','fr','es','de'));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_birth_year_check CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::int);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_country_length CHECK (country IS NULL OR char_length(country) <= 80);

ALTER TABLE public.go_preferences
  ADD COLUMN IF NOT EXISTS birth_year integer;
ALTER TABLE public.go_preferences ADD CONSTRAINT go_birth_year_valid CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::int);

CREATE TABLE IF NOT EXISTS public.go_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL CHECK (module IN ('watch','listen','read')),
  canonical_title text NOT NULL CHECK (char_length(canonical_title) BETWEEN 1 AND 250),
  creator text NOT NULL DEFAULT '',
  release_year integer,
  original_language text,
  -- Global content is shared by everyone; local content is selected for their spoken language.
  scope text NOT NULL CHECK (scope IN ('global','local')),
  language text CHECK (language IN ('fa','en','fr','es','de')),
  primary_vibe text NOT NULL,
  secondary_vibes text[] NOT NULL DEFAULT '{}',
  spectrum_x smallint NOT NULL CHECK (spectrum_x BETWEEN 0 AND 100),
  spectrum_y smallint NOT NULL CHECK (spectrum_y BETWEEN 0 AND 100),
  cover_url text,
  provider text,
  provider_id text,
  curator_notes text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT go_works_scope_language CHECK ((scope='global' AND language IS NULL) OR (scope='local' AND language IS NOT NULL)),
  CONSTRAINT go_works_secondary_limit CHECK (cardinality(secondary_vibes) <= 4),
  CONSTRAINT go_works_unique_external UNIQUE (module,provider,provider_id)
);
CREATE INDEX IF NOT EXISTS go_works_public_lookup ON public.go_works (module,scope,language,primary_vibe) WHERE status='published';
CREATE INDEX IF NOT EXISTS go_works_title_search ON public.go_works USING gin (to_tsvector('simple',canonical_title || ' ' || creator));

CREATE TABLE IF NOT EXISTS public.go_work_editions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 work_id uuid NOT NULL REFERENCES public.go_works(id) ON DELETE CASCADE,
 language text NOT NULL CHECK (language IN ('fa','en','fr','es','de')),
 display_title text NOT NULL,
 publisher_or_translator text,
 source_url text,
 cover_url text,
 UNIQUE(work_id,language)
);

CREATE TABLE IF NOT EXISTS public.go_catalog_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 module text NOT NULL CHECK (module IN ('watch','listen','read')),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 250),
 creator text NOT NULL DEFAULT '',
 provider text NOT NULL CHECK (provider IN ('google','google-books','tmdb','spotify','manual')),
 provider_id text,
 source_url text,
 cover_url text,
 language text CHECK (language IN ('fa','en','fr','es','de')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
 reviewed_by uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 reviewed_work_id uuid REFERENCES public.go_works(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS go_submissions_admin_queue ON public.go_catalog_submissions(status,created_at);
CREATE INDEX IF NOT EXISTS go_submissions_owner ON public.go_catalog_submissions(user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS public.go_user_interests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 module text NOT NULL CHECK (module IN ('watch','listen','read')),
 work_id uuid REFERENCES public.go_works(id) ON DELETE SET NULL,
 submission_id uuid REFERENCES public.go_catalog_submissions(id) ON DELETE SET NULL,
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 250),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT go_user_interest_reference CHECK (work_id IS NOT NULL OR submission_id IS NOT NULL),
 CONSTRAINT go_user_interest_unique_work UNIQUE (user_id,work_id),
 CONSTRAINT go_user_interest_unique_submission UNIQUE (user_id,submission_id)
);

ALTER TABLE public.go_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.go_work_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.go_catalog_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.go_user_interests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.go_works,public.go_work_editions,public.go_catalog_submissions,public.go_user_interests FROM anon,authenticated;
GRANT SELECT ON public.go_works,public.go_work_editions TO anon,authenticated;
GRANT SELECT,INSERT ON public.go_catalog_submissions TO authenticated;
GRANT SELECT,INSERT,DELETE ON public.go_user_interests TO authenticated;
GRANT ALL ON public.go_works,public.go_work_editions,public.go_catalog_submissions,public.go_user_interests TO service_role;
GRANT INSERT,UPDATE,DELETE ON public.go_works,public.go_work_editions TO authenticated;
GRANT UPDATE ON public.go_catalog_submissions TO authenticated;

CREATE POLICY go_works_read ON public.go_works FOR SELECT TO anon,authenticated
 USING (status='published' OR (select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_works_admin_insert ON public.go_works FOR INSERT TO authenticated
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_works_admin_update ON public.go_works FOR UPDATE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)))
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_works_admin_delete ON public.go_works FOR DELETE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_editions_read ON public.go_work_editions FOR SELECT TO anon,authenticated
 USING (EXISTS(SELECT 1 FROM public.go_works w WHERE w.id=work_id));
CREATE POLICY go_editions_admin_insert ON public.go_work_editions FOR INSERT TO authenticated
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_editions_admin_update ON public.go_work_editions FOR UPDATE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)))
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_editions_admin_delete ON public.go_work_editions FOR DELETE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_submissions_owner_read ON public.go_catalog_submissions FOR SELECT TO authenticated
 USING (user_id=(select auth.uid()) OR (select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_submissions_owner_insert ON public.go_catalog_submissions FOR INSERT TO authenticated
 WITH CHECK (user_id=(select auth.uid()) AND status='pending' AND reviewed_by IS NULL AND reviewed_at IS NULL AND reviewed_work_id IS NULL);
CREATE POLICY go_submissions_admin_update ON public.go_catalog_submissions FOR UPDATE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)))
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_interests_owner_read ON public.go_user_interests FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY go_interests_owner_insert ON public.go_user_interests FOR INSERT TO authenticated
 WITH CHECK (user_id=(select auth.uid()) AND
  (work_id IS NULL OR EXISTS(SELECT 1 FROM public.go_works w WHERE w.id=work_id AND w.status='published')) AND
  (submission_id IS NULL OR EXISTS(SELECT 1 FROM public.go_catalog_submissions s WHERE s.id=submission_id AND s.user_id=(select auth.uid()))));
CREATE POLICY go_interests_owner_delete ON public.go_user_interests FOR DELETE TO authenticated USING (user_id=(select auth.uid()));

-- Existing auth trigger stores country and language for password sign-ups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pref_lang text; birth_val integer;
BEGIN
  pref_lang := CASE WHEN NEW.raw_user_meta_data->>'spoken_language' IN ('fa','en','fr','es','de') THEN NEW.raw_user_meta_data->>'spoken_language' ELSE 'fa' END;
  birth_val := CASE WHEN NEW.raw_user_meta_data->>'birth_year' ~ '^[0-9]{4}$' THEN (NEW.raw_user_meta_data->>'birth_year')::integer ELSE NULL END;
  INSERT INTO public.profiles (id, display_name, preferred_language, spoken_language, country, birth_year)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
          CASE WHEN pref_lang = 'fa' THEN 'fa' ELSE 'en' END, pref_lang,
          left(nullif(NEW.raw_user_meta_data->>'country',''),80),
          CASE WHEN birth_val BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::int THEN birth_val ELSE NULL END)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

-- The 24 immutable GO vibes are a database reference set, not free-form labels.
CREATE TABLE public.go_vibes (
 id text PRIMARY KEY,
 spectrum_x smallint NOT NULL CHECK (spectrum_x BETWEEN 0 AND 100),
 spectrum_y smallint NOT NULL CHECK (spectrum_y BETWEEN 0 AND 100)
);
INSERT INTO public.go_vibes(id,spectrum_x,spectrum_y) VALUES
('existential-void',10,15),
('beautiful-suffering',25,15),
('melancholic-beauty',40,15),
('psychological-abyss',10,35),
('surreal-mind',25,35),
('intellectual-maze',40,35),
('dark-curiosity',10,65),
('beautiful-chaos',25,65),
('rebellion',40,65),
('twisted-humor',10,85),
('dangerous-desire',25,85),
('adrenaline-rush',40,85),
('hope-renewal',60,15),
('human-connection',75,15),
('romantic-longing',90,15),
('spiritual-wonder',60,35),
('quiet-wisdom',75,35),
('bittersweet-nostalgia',90,35),
('quiet-comfort',60,65),
('playful-joy',75,65),
('feel-good-escape',90,65),
('dreamy-romance',60,85),
('sunny-optimism',75,85),
('pure-fun',90,85)
ON CONFLICT(id) DO NOTHING;
ALTER TABLE public.go_vibes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.go_vibes TO anon,authenticated;
GRANT ALL ON public.go_vibes TO service_role;
CREATE POLICY go_vibes_read ON public.go_vibes FOR SELECT TO anon,authenticated USING (true);
ALTER TABLE public.go_works ADD CONSTRAINT go_primary_vibe_fk FOREIGN KEY (primary_vibe) REFERENCES public.go_vibes(id);

-- Dedicated 24-dimensional vibe vector, alongside the display position (X,Y).
CREATE TABLE public.go_work_vibe_scores (
 work_id uuid NOT NULL REFERENCES public.go_works(id) ON DELETE CASCADE,
 vibe_id text NOT NULL REFERENCES public.go_vibes(id),
 score smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
 scoring_method text NOT NULL DEFAULT 'editorial' CHECK (scoring_method IN ('editorial','spectrum-seed')),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(work_id,vibe_id)
);
CREATE INDEX go_scores_find_by_vibe ON public.go_work_vibe_scores(vibe_id,score DESC);
ALTER TABLE public.go_work_vibe_scores ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.go_work_vibe_scores TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.go_work_vibe_scores TO authenticated;
GRANT ALL ON public.go_work_vibe_scores TO service_role;
CREATE POLICY go_scores_read ON public.go_work_vibe_scores FOR SELECT TO anon,authenticated
 USING (EXISTS(SELECT 1 FROM public.go_works w WHERE w.id=work_id));
CREATE POLICY go_scores_insert_admin ON public.go_work_vibe_scores FOR INSERT TO authenticated
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_scores_update_admin ON public.go_work_vibe_scores FOR UPDATE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)))
 WITH CHECK ((select public.has_role((select auth.uid()),'admin'::public.app_role)));
CREATE POLICY go_scores_delete_admin ON public.go_work_vibe_scores FOR DELETE TO authenticated
 USING ((select public.has_role((select auth.uid()),'admin'::public.app_role)));

-- Automatically create a complete 24-vibe score vector for every work.
-- Editorially overridden scores are preserved when the position changes.
CREATE FUNCTION public.go_seed_vibe_scores() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 INSERT INTO public.go_work_vibe_scores(work_id,vibe_id,score,scoring_method)
 SELECT NEW.id,v.id,
    (CASE WHEN v.id=NEW.primary_vibe THEN 100 ELSE
      greatest(0,least(100,round(100 - 0.8 * sqrt(
        power(NEW.spectrum_x-v.spectrum_x,2)::float8 +
        power(NEW.spectrum_y-v.spectrum_y,2)::float8
      )))) END)::smallint,
    'spectrum-seed'
 FROM public.go_vibes v
 ON CONFLICT(work_id,vibe_id) DO UPDATE
 SET score=EXCLUDED.score,updated_at=now()
 WHERE public.go_work_vibe_scores.scoring_method='spectrum-seed';
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.go_seed_vibe_scores() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER go_works_fill_vibe_scores
AFTER INSERT OR UPDATE OF primary_vibe,spectrum_x,spectrum_y ON public.go_works
FOR EACH ROW EXECUTE FUNCTION public.go_seed_vibe_scores();
