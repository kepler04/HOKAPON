-- =============================================================
-- 0001_init_schema.sql
-- Tienda YienKid — base schema (tables, indexes, FKs)
-- =============================================================

-- pgcrypto provides gen_random_uuid()
create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- profiles : extends auth.users with role info
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'staff' check (role in ('admin','staff')),
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- categories
-- -------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_categories_slug   on public.categories(slug);
create index if not exists idx_categories_active on public.categories(is_active);

-- -------------------------------------------------------------
-- products
-- -------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),
  stock         int not null default 0 check (stock >= 0),
  sku           text unique,
  is_active     boolean not null default true,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug     on public.products(slug);
create index if not exists idx_products_active   on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured)
  where is_featured = true;
-- Full-text search (Spanish) on name + description
create index if not exists idx_products_search on public.products
  using gin (to_tsvector('spanish', name || ' ' || coalesce(description,'')));

-- -------------------------------------------------------------
-- product_images
-- -------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  is_primary  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id);

-- -------------------------------------------------------------
-- orders
-- -------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text not null,
  status          text not null default 'pendiente'
                  check (status in ('pendiente','esperando_pago','pago_enviado',
                                    'pago_confirmado','en_preparacion','entregado','cancelado')),
  payment_method  text check (payment_method in ('yape','plin','transferencia','whatsapp')),
  subtotal        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_orders_status  on public.orders(status);
create index if not exists idx_orders_number  on public.orders(order_number);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_email   on public.orders(customer_email);

-- -------------------------------------------------------------
-- order_items (immutable snapshot of name + price)
-- -------------------------------------------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(10,2) not null,
  quantity     int not null check (quantity > 0),
  line_total   numeric(10,2) not null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- -------------------------------------------------------------
-- payments
-- -------------------------------------------------------------
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  method        text not null check (method in ('yape','plin','transferencia')),
  amount        numeric(10,2) not null,
  proof_url     text,
  status        text not null default 'pendiente'
                check (status in ('pendiente','confirmado','rechazado')),
  confirmed_by  uuid references public.profiles(id),
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);
