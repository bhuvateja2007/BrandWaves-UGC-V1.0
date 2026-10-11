-- ==============================================================================
-- BRANDWAVES PHASE 5: BRAND OWNER PORTAL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Hackathon: TyCity | Project: BrandWaves
-- Tables: brands, products, brand ownership relations & policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BRAND OWNER HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_brand_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'brand_owner') OR 
         public.has_role(auth.uid(), 'brand_admin') OR 
         public.is_admin();
$$;

-- ------------------------------------------------------------------------------
-- 2. BRANDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL,
  logo TEXT NOT NULL,
  cover_image TEXT,
  location TEXT,
  website TEXT,
  values JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brands_owner ON public.brands(owner_id);
CREATE INDEX IF NOT EXISTS idx_brands_category ON public.brands(category);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Select: Public directory read access
CREATE POLICY "brands_select_policy"
  ON public.brands FOR SELECT
  USING (true);

-- Insert: Brand owners can register brands for themselves, or Admins
CREATE POLICY "brands_insert_policy"
  ON public.brands FOR INSERT
  WITH CHECK (
    (auth.uid() = owner_id AND public.is_brand_owner()) OR
    public.is_admin()
  );

-- Update: Brand owners can update ONLY their own brands
CREATE POLICY "brands_update_policy"
  ON public.brands FOR UPDATE
  USING (
    (auth.uid() = owner_id AND public.is_brand_owner()) OR
    public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = owner_id AND public.is_brand_owner()) OR
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '₹',
  image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  external_purchase_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products(is_archived);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Select: Anyone can view active products; Brand owners and admins can also view archived products
CREATE POLICY "products_select_policy"
  ON public.products FOR SELECT
  USING (
    is_archived = false OR
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE public.brands.id = public.products.brand_id
        AND public.brands.owner_id = auth.uid()
    ) OR
    public.is_admin()
  );

-- Insert: Brand owners can insert products ONLY for brands they own
CREATE POLICY "products_insert_policy"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE public.brands.id = brand_id
        AND (public.brands.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- Update: Brand owners can update products ONLY for brands they own
CREATE POLICY "products_update_policy"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE public.brands.id = public.products.brand_id
        AND (public.brands.owner_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE public.brands.id = public.products.brand_id
        AND (public.brands.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- Delete: Brand owners can delete products ONLY for brands they own
CREATE POLICY "products_delete_policy"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE public.brands.id = public.products.brand_id
        AND (public.brands.owner_id = auth.uid() OR public.is_admin())
    )
  );
