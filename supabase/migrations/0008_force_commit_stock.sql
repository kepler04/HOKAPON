-- =============================================================
-- 0008_force_commit_stock.sql
-- Admin "force confirm" payment even without enough stock.
--
-- commit_order_stock_force(order_id) works like commit_order_stock but
-- decrements stock WITHOUT the `stock >= quantity` guard, so stock may go
-- negative. A negative value tells the admin exactly how many units to
-- restock. Still idempotent via the stock_committed flag.
-- =============================================================

create or replace function public.commit_order_stock_force(p_order_id uuid)
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

  -- Decrement each line item WITHOUT a stock-availability guard.
  -- Stock is allowed to go negative on purpose (admin will restock).
  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products
      set stock = stock - v_item.quantity
      where id = v_item.product_id;
  end loop;

  update public.orders set stock_committed = true where id = p_order_id;
end;
$$;
