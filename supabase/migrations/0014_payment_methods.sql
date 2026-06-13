-- =============================================================
-- 0014_payment_methods.sql
-- Admin-configurable payment methods (replaces hardcoded env values).
--
-- kind: 'wallet' (Yape/Plin/etc.) or 'bank' (transfer).
--   wallet → uses number + holder
--   bank   → uses bank_name + holder + account + cci
-- Public reads only active methods; staff manage everything.
-- =============================================================

create table if not exists public.payment_methods (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('wallet', 'bank')),
  label       text not null,            -- e.g. "Yape", "Plin", "BCP"
  number      text,                     -- wallet phone number
  holder      text,                     -- account holder name
  bank_name   text,                     -- for banks
  account     text,                     -- account number
  cci         text,                     -- interbank code
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_payment_methods_order
  on public.payment_methods(sort_order);

alter table public.payment_methods enable row level security;

-- Public can read active methods (shown on the success/payment page).
drop policy if exists "payment_methods_public_read" on public.payment_methods;
create policy "payment_methods_public_read"
  on public.payment_methods for select
  using (is_active = true or public.is_staff());

-- Staff manage all methods.
drop policy if exists "payment_methods_staff_write" on public.payment_methods;
create policy "payment_methods_staff_write"
  on public.payment_methods for all
  using (public.is_staff())
  with check (public.is_staff());

-- Seed with the current (env-based) data so nothing disappears.
insert into public.payment_methods (kind, label, number, holder, sort_order)
values
  ('wallet', 'Yape', '948792314', 'HOKAPON', 1),
  ('wallet', 'Plin', '948792314', 'HOKAPON', 2)
on conflict do nothing;

insert into public.payment_methods (kind, label, bank_name, holder, account, cci, sort_order)
values
  ('bank', 'BCP', 'BCP', 'HOKAPON SAC', '191-XXXXXXX-0-XX', '002-191-00XXXXXXX0XX-12', 3)
on conflict do nothing;
