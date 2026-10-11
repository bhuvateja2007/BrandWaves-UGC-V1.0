-- ==============================================================================
-- BRANDWAVES PHASE 3: CUSTOMER SAVED PRODUCTS (WISHLIST) SCHEMA & RLS
-- ==============================================================================

create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists idx_saved_products_user on public.saved_products(user_id);
create index if not exists idx_saved_products_product on public.saved_products(product_id);

-- Enable Row Level Security (RLS)
alter table public.saved_products enable row level security;

-- 1. Customers can read only their own saved products
create policy "Customers can view own saved products"
  on public.saved_products
  for select
  using (auth.uid() = user_id);

-- 2. Customers can insert only for themselves
create policy "Customers can insert own saved products"
  on public.saved_products
  for insert
  with check (auth.uid() = user_id);

-- 3. Customers can delete only their own saved products
create policy "Customers can delete own saved products"
  on public.saved_products
  for delete
  using (auth.uid() = user_id);
