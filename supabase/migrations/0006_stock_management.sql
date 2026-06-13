-- =============================================================
-- 0006_stock_management.sql
-- Atomic stock commit/restore tied to order payment confirmation.
--
-- Rules:
--   • Stock is decremented once when an order reaches 'pago_confirmado'.
--   • Stock is restored if a previously-committed order is cancelled.
--   • A flag on orders (stock_committed) makes this idempotent — we never
--     decrement or restore twice for the same order.
-- =============================================================

-- Flag to track whether an order has already consumed stock.
alter table public.orders
  add column if not exists stock_committed boolean not null default false;

-- -------------------------------------------------------------
-- commit_order_stock(order_id)
-- Decrements stock for every line item, atomically. Fails (raises)
-- if any product lacks enough stock. Sets stock_committed = true.
-- No-op if already committed.
-- -------------------------------------------------------------
create or replace function public.commit_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_committed boolean;
  v_item record;
begin
  select stock_committed into v_committed
  from public.orders where id = p_order_id
  for update;

  if v_committed is null then
    raise exception 'Pedido % no existe', p_order_id;
  end if;
  if v_committed then
    return; -- already committed, idempotent
  end if;

  -- Check + decrement each line item that still references a product.
  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products
      set stock = stock - v_item.quantity
      where id = v_item.product_id
        and stock >= v_item.quantity;

    if not found then
      raise exception 'Stock insuficiente para el producto %', v_item.product_id;
    end if;
  end loop;

  update public.orders set stock_committed = true where id = p_order_id;
end;
$$;

-- -------------------------------------------------------------
-- restore_order_stock(order_id)
-- Adds the line-item quantities back to product stock. Sets
-- stock_committed = false. No-op if not currently committed.
-- -------------------------------------------------------------
create or replace function public.restore_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_committed boolean;
  v_item record;
begin
  select stock_committed into v_committed
  from public.orders where id = p_order_id
  for update;

  if v_committed is null then
    raise exception 'Pedido % no existe', p_order_id;
  end if;
  if not v_committed then
    return; -- nothing to restore
  end if;

  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products
      set stock = stock + v_item.quantity
      where id = v_item.product_id;
  end loop;

  update public.orders set stock_committed = false where id = p_order_id;
end;
$$;
