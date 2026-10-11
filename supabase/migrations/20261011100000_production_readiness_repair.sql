-- ==============================================================================
-- BRANDWAVES PRODUCTION READINESS REPAIR: ROLE COMPATIBILITY & RLS HARMONIZATION
-- Migration: 20261011100000_production_readiness_repair.sql
-- ==============================================================================

-- 1. Harmonize profiles role check constraint non-destructively
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('customer', 'creator', 'brand_owner', 'brand', 'brand_admin', 'admin', 'user'));

-- 2. Update current_app_role() helper to recognize all valid brand and customer representations
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN p.role IN ('brand', 'brand_owner', 'brand_admin') THEN 'brand'
    WHEN p.role = 'admin' THEN 'admin'
    WHEN p.role = 'customer' THEN 'customer'
    ELSE 'creator'
  END
  FROM public.profiles p
  WHERE p.id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- 3. Enhance role protection trigger to handle service_role, superuser, and admin actions safely
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (old.role IS DISTINCT FROM new.role) THEN
    -- Allow service_role key, postgres superuser, or admin
    IF (
      current_user IN ('postgres', 'service_role', 'supabase_admin')
      OR (auth.jwt() IS NOT NULL AND auth.jwt()->>'role' = 'service_role')
      OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
    ) THEN
      RETURN new;
    END IF;

    RAISE EXCEPTION 'Profile roles cannot be changed through the client';
  END IF;
  RETURN new;
END;
$$;


-- 4. Correct profile roles for existing seed users matching their auth metadata
UPDATE public.profiles
SET role = 'brand', updated_at = now()
WHERE id = 'eaf5fdfb-d71a-422e-a850-055631bfd8c4' AND role = 'creator';

UPDATE public.profiles
SET role = 'brand', updated_at = now()
WHERE id = '67bd4401-8dcb-4c67-afaa-9d644af8a693' AND role = 'creator';

UPDATE public.profiles
SET role = 'customer', updated_at = now()
WHERE id = '848de01c-efed-4eb8-8685-71651f9e49d4' AND role = 'creator';

-- 5. Enable public read access for anonymous visitors to discovery catalog
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.community_posts TO anon;
GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT ON public.post_likes TO anon;

-- Ensure RLS policies allow anon to view published/public items
DROP POLICY IF EXISTS "Published campaigns are viewable by everyone" ON public.campaigns;
CREATE POLICY "Published campaigns are viewable by everyone"
  ON public.campaigns FOR SELECT
  TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.community_posts;
CREATE POLICY "Published posts are viewable by everyone"
  ON public.community_posts FOR SELECT
  TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS "Comments on published posts are viewable by anon" ON public.post_comments;
CREATE POLICY "Comments on published posts are viewable by anon"
  ON public.post_comments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts p 
      WHERE p.id = post_comments.post_id AND p.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Likes on published posts are viewable by anon" ON public.post_likes;
CREATE POLICY "Likes on published posts are viewable by anon"
  ON public.post_likes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts p 
      WHERE p.id = post_likes.post_id AND p.status = 'published'
    )
  );
