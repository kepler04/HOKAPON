-- =============================================================
-- 0013_favorites.sql
-- Wishlist / favorites: a customer can save products to buy later.
--
-- One row per (user, product). RLS: each user manages only their own rows.
-- =============================================================

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);

alter table public.favorites enable row level security;

-- Each user reads/writes only their own favorites.
drop policy if exists "favorites_self" on public.favorites;
create policy "favorites_self"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
