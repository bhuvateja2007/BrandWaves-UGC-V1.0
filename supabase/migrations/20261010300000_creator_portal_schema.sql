-- ==============================================================================
-- BRANDWAVES PHASE 4: CREATOR PORTAL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Hackathon: TyCity | Project: BrandWaves
-- Tables: creator_portfolios, campaign_applications
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREATOR PORTFOLIOS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creator_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Reel' CHECK (format IN ('Reel', 'Short Video', 'YouTube Video', 'Photo Carousel', 'Story')),
  thumbnail TEXT NOT NULL,
  views TEXT NOT NULL DEFAULT '12.4K',
  engagement TEXT NOT NULL DEFAULT '4.2%',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  related_brand_id TEXT,
  related_product_id TEXT,
  related_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creator_portfolios_creator ON public.creator_portfolios(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_portfolios_created ON public.creator_portfolios(created_at DESC);

-- Enable RLS
ALTER TABLE public.creator_portfolios ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone (authenticated or public) can view public portfolio items
CREATE POLICY "creator_portfolios_select_policy"
  ON public.creator_portfolios FOR SELECT
  USING (true);

-- Insert policy: Creators can insert portfolio items only for themselves
CREATE POLICY "creator_portfolios_insert_policy"
  ON public.creator_portfolios FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Update policy: Creators can update only their own portfolio items
CREATE POLICY "creator_portfolios_update_policy"
  ON public.creator_portfolios FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Delete policy: Creators can delete only their own portfolio items
CREATE POLICY "creator_portfolios_delete_policy"
  ON public.creator_portfolios FOR DELETE
  USING (auth.uid() = creator_id);

-- ------------------------------------------------------------------------------
-- 2. CAMPAIGN APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  proposed_deliverable TEXT NOT NULL,
  portfolio_sample_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT campaign_applications_creator_campaign_unique UNIQUE (creator_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator ON public.campaign_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign ON public.campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON public.campaign_applications(status);

-- Enable RLS
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Select policy: Creators can view only their own applications; Brand Admins / Admins can view applications for their campaigns
CREATE POLICY "campaign_applications_select_policy"
  ON public.campaign_applications FOR SELECT
  USING (
    auth.uid() = creator_id OR
    public.is_brand_admin() OR
    public.is_admin()
  );

-- Insert policy: Creators can apply only for themselves; initial status must be 'pending'
CREATE POLICY "campaign_applications_insert_policy"
  ON public.campaign_applications FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    status = 'pending'
  );

-- Update policy (Creators): Creators can ONLY withdraw their pending applications
CREATE POLICY "campaign_applications_creator_update_policy"
  ON public.campaign_applications FOR UPDATE
  USING (
    auth.uid() = creator_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = creator_id AND
    status = 'withdrawn'
  );

-- Update policy (Brand Admins / Admins): Authorized brand operators can approve or reject applications
CREATE POLICY "campaign_applications_admin_update_policy"
  ON public.campaign_applications FOR UPDATE
  USING (
    public.is_brand_admin() OR
    public.is_admin()
  )
  WITH CHECK (
    public.is_brand_admin() OR
    public.is_admin()
  );
