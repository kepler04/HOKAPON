-- =============================================================
-- 0010_stock_movements.sql
-- Inventory ledger: entradas (in) / salidas (out) per product.
--
--   • Manual movements: admin records restocks (entrada) and adjustments /
--     losses (salida). These adjust products.stock atomically.
--   • Automatic movements: a sale logs a 'salida' when an order's payment is
--     confirmed (inserted from the server action, referencing the order).
-- =============================================================

-- 1) Table
create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  type        text not null check (type in ('entrada', 'salida')),
  quantity    int  not null check (quantity > 0),
  reason      text,
  order_id    uuid references public.orders(id) on delete set null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_stock_movements_product on public.stock_movements(product_id);
create index if not exists idx_stock_movements_created on public.stock_movements(created_at desc);

-- 2) RLS — staff only (read + write).
alter table public.stock_movements enable row level security;

drop policy if exists "stock_movements_staff_all" on public.stock_movements;
create policy "stock_movements_staff_all"
  on public.stock_movements for all
  using (public.is_staff())
  with check (public.is_staff());

-- 3) Atomic manual movement: insert ledger row + adjust product stock.
--    entrada => stock + qty ; salida => stock - qty (may go negative).
create or replace function public.register_stock_movement(
  p_product_id uuid,
  p_type       text,
  p_quantity   int,
  p_reason     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if p_type not in ('entrada', 'salida') then
    raise exception 'Tipo inválido: %', p_type;
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  select true into v_exists from public.products where id = p_product_id for update;
  if v_exists is null then
    raise exception 'Producto % no existe', p_product_id;
  end if;

  update public.products
    set stock = stock + (case when p_type = 'entrada' then p_quantity else -p_quantity end)
    where id = p_product_id;

  insert into public.stock_movements (product_id, type, quantity, reason, created_by)
  values (p_product_id, p_type, p_quantity, nullif(btrim(p_reason), ''), auth.uid());
end;
$$;
