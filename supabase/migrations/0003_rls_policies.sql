-- =============================================================
-- 0003_rls_policies.sql
-- Row Level Security: enabled on every table.
--
-- Model:
--   • Public (anon) can READ only active products/categories/images.
--   • Staff/admin can do everything (checked via public.is_staff()).
--   • orders/order_items/payments are NOT publicly readable.
--   • Order creation happens server-side with the service_role key
--     (bypasses RLS), after server-side stock & price validation.
-- =============================================================

-- ---------------- profiles ----------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------- categories ----------------
alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (is_active = true or public.is_staff());

drop policy if exists "categories_staff_write" on public.categories;
create policy "categories_staff_write"
  on public.categories for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------- products ----------------
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (is_active = true or public.is_staff());

drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write"
  on public.products for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------- product_images ----------------
alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.is_active = true
    )
  );

drop policy if exists "product_images_staff_write" on public.product_images;
create policy "product_images_staff_write"
  on public.product_images for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------- orders ----------------
alter table public.orders enable row level security;

-- No public select. Only staff may read orders.
drop policy if exists "orders_staff_read" on public.orders;
create policy "orders_staff_read"
  on public.orders for select
  using (public.is_staff());

drop policy if exists "orders_staff_write" on public.orders;
create policy "orders_staff_write"
  on public.orders for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------- order_items ----------------
alter table public.order_items enable row level security;

drop policy if exists "order_items_staff_read" on public.order_items;
create policy "order_items_staff_read"
  on public.order_items for select
  using (public.is_staff());

drop policy if exists "order_items_staff_write" on public.order_items;
create policy "order_items_staff_write"
  on public.order_items for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------- payments ----------------
alter table public.payments enable row level security;

drop policy if exists "payments_staff_all" on public.payments;
create policy "payments_staff_all"
  on public.payments for all
  using (public.is_staff())
  with check (public.is_staff());
