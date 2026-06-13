-- =============================================================
-- 0012_max_per_order.sql
-- Per-product purchase limit.
--
-- max_per_order: maximum units a customer can buy of this product in a single
-- order. NULL or 0 means "no special limit" (only the available stock caps it).
-- The admin can lower this when stock runs low to spread the remaining units.
-- =============================================================

alter table public.products
  add column if not exists max_per_order int
  check (max_per_order is null or max_per_order >= 0);
