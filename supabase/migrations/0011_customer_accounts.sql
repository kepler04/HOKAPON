-- =============================================================
-- 0011_customer_accounts.sql
-- Customer profiles + link orders to a user account.
--
--   • orders.user_id        : optional link to the buyer's auth user.
--   • customer_profiles      : extra editable data (name, phone, address)
--                              that Supabase Auth does not store.
--
-- RLS: a customer may read/write ONLY their own profile, and read ONLY their
-- own orders (matched by user_id OR by their account email). Staff keep full
-- access (existing policies remain).
-- =============================================================

-- 1) Link orders to a user (nullable: guest checkout still allowed).
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_user on public.orders(user_id);

-- 2) Customer profile table.
create table if not exists public.customer_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  address      text,
  district     text,
  city         text,
  reference    text,
  updated_at   timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

-- Each user manages only their own profile.
drop policy if exists "customer_profiles_self" on public.customer_profiles;
create policy "customer_profiles_self"
  on public.customer_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Staff can read profiles (e.g. to assist with orders).
drop policy if exists "customer_profiles_staff_read" on public.customer_profiles;
create policy "customer_profiles_staff_read"
  on public.customer_profiles for select
  using (public.is_staff());

-- 3) Let customers READ their own orders (by user_id or by their email).
--    Existing staff policies already cover staff; we only add a customer read.
drop policy if exists "orders_customer_read" on public.orders;
create policy "orders_customer_read"
  on public.orders for select
  using (
    auth.uid() = user_id
    or (
      auth.uid() is not null
      and lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Customers may read the items of orders they can see.
drop policy if exists "order_items_customer_read" on public.order_items;
create policy "order_items_customer_read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          auth.uid() = o.user_id
          or (
            auth.uid() is not null
            and lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
        )
    )
  );
