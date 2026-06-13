-- =============================================================
-- 0002_functions_triggers.sql
-- Functions, sequences and triggers
-- =============================================================

-- -------------------------------------------------------------
-- 1) Atomic, human-readable order numbers: YK-2026-000123
-- -------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  new.order_number :=
    'YK-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.set_order_number();

-- -------------------------------------------------------------
-- 2) Auto-create a profile when a new auth user is created
--    SECURITY DEFINER so it can write to public.profiles.
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -------------------------------------------------------------
-- 3) Auto-update updated_at on row changes
-- -------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------
-- 4) Helper: is the current user an admin/staff?
--    Used by RLS policies. SECURITY DEFINER to avoid recursive
--    RLS evaluation on the profiles table.
-- -------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin','staff')
  );
$$;
