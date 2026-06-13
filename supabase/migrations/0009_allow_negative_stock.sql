-- =============================================================
-- 0009_allow_negative_stock.sql
-- Allow negative product stock.
--
-- The admin can force-confirm a payment without enough stock (they will
-- restock that day). Stock then goes negative to signal how many units are
-- owed. The original `check (stock >= 0)` constraint blocked this, so we drop
-- it. The column default stays 0.
-- =============================================================

alter table public.products
  drop constraint if exists products_stock_check;
