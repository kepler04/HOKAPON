# 🛒 ECOMMERCE MASTER PLAN — Tienda YienKid

> **Nota de estado actual:** este documento queda como plan histórico de
> arquitectura. La implementación actual ya incluye tienda pública, checkout,
> cuentas de cliente, favoritos, inventario, panel admin, pagos configurables,
> logos estáticos de pago y despliegue en Vercel. Para operar el proyecto hoy,
> usar [`README.md`](./README.md) y
> [`docs/operacion-y-despliegue.md`](./docs/operacion-y-despliegue.md).

> **Documento de arquitectura y plan de implementación**
> Versión 1.0 · Stack: Next.js 15 · TypeScript · Tailwind CSS · Supabase · Vercel
> Estado: Diseño aprobado — **NO se ha escrito código aún**

---

## 📑 Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Decisiones de arquitectura (ADR)](#2-decisiones-de-arquitectura-adr)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura general del sistema](#4-arquitectura-general-del-sistema)
5. [Diagrama de módulos](#5-diagrama-de-módulos)
6. [Estructura de carpetas](#6-estructura-de-carpetas)
7. [Diseño de base de datos](#7-diseño-de-base-de-datos)
8. [Seguridad y RLS](#8-seguridad-y-rls)
9. [Flujo de usuario (cliente)](#9-flujo-de-usuario-cliente)
10. [Flujo administrativo](#10-flujo-administrativo)
11. [Diseño UI/UX](#11-diseño-uiux)
12. [Roadmap por fases](#12-roadmap-por-fases)
13. [Plan de implementación paso a paso](#13-plan-de-implementación-paso-a-paso)
14. [Buenas prácticas Next.js + Supabase](#14-buenas-prácticas-nextjs--supabase)
15. [Recomendaciones de seguridad](#15-recomendaciones-de-seguridad)
16. [Variables de entorno](#16-variables-de-entorno)
17. [Despliegue en Vercel](#17-despliegue-en-vercel)

---

## 1. Resumen ejecutivo

**Tienda YienKid** es una demo profesional de ecommerce diseñada para evolucionar hacia una plataforma de ventas real. El MVP funciona **sin pasarela de pago**: usa un flujo de **pago manual** (Yape, Plin, transferencia bancaria) coordinado vía **WhatsApp** para el envío del comprobante.

### Principios de diseño
- **Production-ready desde el día uno**: RLS, tipado estricto, números de pedido atómicos en BD.
- **Baja fricción de compra**: guest checkout (sin registro para comprar).
- **Baja carga operativa**: los datos de pago se muestran automáticamente; WhatsApp solo recibe el comprobante.
- **Escalable**: la arquitectura permite añadir pasarela de pago (Stripe/Mercado Pago/Culqi) sin reescribir el dominio.

### Decisiones clave confirmadas
| Decisión | Elección | Razón |
|---|---|---|
| Flujo de pago | Página automática de datos + WhatsApp para comprobante | Menos trabajo manual, UX profesional |
| Autenticación cliente | Guest checkout (solo admin con login) | Cero fricción de compra en una demo |
| Imágenes | Supabase Storage | Todo integrado, control total |

---

## 2. Decisiones de arquitectura (ADR)

Cambios respecto a la idea original, justificados:

### ADR-001 · No usar tabla `users` propia
Supabase gestiona usuarios en el esquema `auth.users`. Crear una tabla `users` pública duplica y desincroniza datos.
**Decisión:** usar `auth.users` (gestionado por Supabase) + tabla `profiles` con FK a `auth.users.id`. El rol (`admin`/`staff`) vive en `profiles`.

### ADR-002 · Número de pedido generado en la base de datos
Generar el código en el cliente o en JS provoca colisiones bajo concurrencia.
**Decisión:** secuencia Postgres + función `generate_order_number()` que produce códigos tipo `YK-2026-000123`. Atómico y único garantizado.

### ADR-003 · Datos de pago en página automática, no por chat
Enviar Yape/Plin manualmente en cada pedido no escala.
**Decisión:** tras crear el pedido, redirigir a `/checkout/exito/[orderNumber]` que muestra los métodos de pago. WhatsApp se usa **solo** para enviar el comprobante.

### ADR-004 · Carrito en cliente (localStorage), no en BD
Persistir el carrito en BD por usuario anónimo añade complejidad innecesaria.
**Decisión:** carrito en `localStorage` con Zustand (persist). Se materializa en BD solo al confirmar el pedido (`orders` + `order_items`).

### ADR-005 · Precios congelados (snapshot) en `order_items`
Si el precio del producto cambia, los pedidos antiguos no deben alterarse.
**Decisión:** `order_items` guarda `unit_price` y `product_name` como copia (snapshot) en el momento de la compra. Histórico inmutable.

### ADR-006 · RLS activado en todas las tablas desde el inicio
**Decisión:** lectura pública solo para `products`/`categories` activos. Escritura solo para admin autenticado. `orders` sin lectura pública.

---

## 3. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server Components, Server Actions, Route Handlers |
| Lenguaje | **TypeScript** (strict) | Tipos generados de Supabase |
| Estilos | **Tailwind CSS** | Diseño utility-first, responsive |
| Componentes UI | **shadcn/ui** + Radix | Accesibles, headless, personalizables |
| Estado cliente | **Zustand** (carrito) | Ligero, con persist en localStorage |
| Base de datos | **Supabase (Postgres)** | RLS, funciones, triggers |
| Auth | **Supabase Auth** | Solo admin (email/password) |
| Storage | **Supabase Storage** | Imágenes de productos |
| Validación | **Zod** | Validación de formularios y Server Actions |
| Formularios | **React Hook Form** + Zod | Checkout y panel admin |
| Iconos | **Lucide React** | — |
| Notificaciones | **Sonner** (toasts) | Feedback de UI |
| Tablas admin | **TanStack Table** | Pedidos/productos con filtros |
| Hosting | **Vercel** | CI/CD automático desde Git |

### Librerías clave a instalar
```bash
# Core
next@latest react react-dom typescript

# Supabase
@supabase/supabase-js @supabase/ssr

# UI
tailwindcss shadcn-ui lucide-react sonner

# Estado / formularios / validación
zustand react-hook-form zod @hookform/resolvers

# Tablas admin
@tanstack/react-table
```

---

## 4. Arquitectura general del sistema

```
┌───────────────────────────────────────────────────────────────┐
│                          CLIENTE (Browser)                      │
│   Sitio Público (SSR/SSG)            Panel Admin (protegido)     │
│   ─ Home, Catálogo, Producto         ─ Dashboard                │
│   ─ Carrito (Zustand+localStorage)   ─ CRUD Productos/Categorías │
│   ─ Checkout                         ─ Gestión de Pedidos        │
└──────────────┬─────────────────────────────┬──────────────────┘
               │                              │
        Server Components            Middleware (auth guard)
        Server Actions               /admin/** → requiere sesión+rol
               │                              │
┌──────────────▼──────────────────────────────▼──────────────────┐
│                       NEXT.JS 15 (Vercel)                        │
│   App Router · Server Actions · Route Handlers · Middleware     │
└──────────────┬──────────────────────────────┬──────────────────┘
               │ @supabase/ssr                 │ service role (server-only)
┌──────────────▼──────────────────────────────▼──────────────────┐
│                           SUPABASE                              │
│   Postgres (RLS) │ Auth │ Storage │ Functions/Triggers         │
│   Tablas: profiles, categories, products, product_images,      │
│           orders, order_items, payments                        │
└───────────────────────────────────────────────────────────────┘
               │
        Integración externa
               ▼
        WhatsApp (deep link wa.me) — envío de comprobante
```

### Tres clientes Supabase (importante)
| Cliente | Dónde se usa | Clave |
|---|---|---|
| **Browser client** | Componentes cliente | `anon key` (pública, segura con RLS) |
| **Server client** | Server Components / Actions | `anon key` + cookies de sesión |
| **Admin client** | Solo operaciones privilegiadas server-side | `service_role key` (**NUNCA al cliente**) |

---

## 5. Diagrama de módulos

```
ECOMMERCE
│
├── 🌐 PÚBLICO
│   ├── Home ───────────── productos destacados, categorías, banners
│   ├── Catálogo ───────── grid + filtros + paginación
│   ├── Categorías ─────── listado por categoría
│   ├── Buscador ───────── búsqueda por nombre/descripción
│   ├── Detalle producto ─ galería, precio, stock, add-to-cart
│   ├── Carrito ────────── Zustand + localStorage
│   ├── Checkout ───────── form (nombre, teléfono, correo)
│   └── Éxito/Pago ─────── nº pedido + datos Yape/Plin/banco + WhatsApp
│
├── 🔐 ADMIN
│   ├── Login ──────────── Supabase Auth
│   ├── Dashboard ──────── métricas (pedidos, productos, ventas, pendientes)
│   ├── Productos ──────── CRUD + activar/desactivar + imágenes
│   ├── Categorías ─────── CRUD
│   └── Pedidos ────────── listar, buscar, filtrar, detalle, cambiar estado
│
├── 🗄️ DATOS (Supabase)
│   ├── profiles · categories · products · product_images
│   ├── orders · order_items · payments
│   ├── Funciones: generate_order_number()
│   └── Triggers: handle_new_user, set_order_number, updated_at
│
└── 🔌 SERVICIOS
    ├── Auth (Supabase)
    ├── Storage (imágenes)
    └── WhatsApp deep-link (wa.me)
```

---

## 6. Estructura de carpetas

```
tienda-yienkid/
├── ECOMMERCE_MASTER_PLAN.md
├── .env.local                      # NO commitear
├── .env.example                    # plantilla
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                   # auth guard /admin
│
├── public/
│   └── (logos, placeholders)
│
├── supabase/
│   ├── migrations/                 # SQL versionado
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_functions_triggers.sql
│   │   ├── 0003_rls_policies.sql
│   │   └── 0004_seed.sql
│   └── config.toml
│
└── src/
    ├── app/
    │   ├── (public)/               # grupo de rutas público
    │   │   ├── layout.tsx          # Navbar + Footer + CartProvider
    │   │   ├── page.tsx            # Home
    │   │   ├── productos/
    │   │   │   ├── page.tsx        # Catálogo
    │   │   │   └── [slug]/page.tsx # Detalle producto
    │   │   ├── categorias/
    │   │   │   └── [slug]/page.tsx
    │   │   ├── buscar/page.tsx
    │   │   ├── carrito/page.tsx
    │   │   └── checkout/
    │   │       ├── page.tsx        # Form de datos
    │   │       └── exito/[orderNumber]/page.tsx  # Datos de pago + WhatsApp
    │   │
    │   ├── admin/                  # grupo protegido
    │   │   ├── layout.tsx          # Sidebar admin + guard
    │   │   ├── page.tsx            # Dashboard
    │   │   ├── productos/
    │   │   │   ├── page.tsx
    │   │   │   ├── nuevo/page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── categorias/page.tsx
    │   │   └── pedidos/
    │   │       ├── page.tsx
    │   │       └── [id]/page.tsx
    │   │
    │   ├── login/page.tsx          # Login admin
    │   ├── auth/
    │   │   ├── callback/route.ts   # OAuth/confirm callback
    │   │   └── signout/route.ts
    │   ├── layout.tsx              # Root layout
    │   ├── globals.css
    │   └── not-found.tsx
    │
    ├── actions/                    # Server Actions
    │   ├── orders.ts               # createOrder, updateOrderStatus
    │   ├── products.ts             # CRUD productos
    │   ├── categories.ts           # CRUD categorías
    │   └── payments.ts             # registrar/validar pago
    │
    ├── components/
    │   ├── ui/                     # shadcn/ui
    │   ├── public/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGrid.tsx
    │   │   ├── CartSheet.tsx
    │   │   ├── SearchBar.tsx
    │   │   └── CategoryNav.tsx
    │   └── admin/
    │       ├── Sidebar.tsx
    │       ├── StatCard.tsx
    │       ├── ProductForm.tsx
    │       ├── ImageUploader.tsx
    │       ├── OrdersTable.tsx
    │       └── OrderStatusBadge.tsx
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts           # browser client
    │   │   ├── server.ts           # server client (cookies)
    │   │   ├── admin.ts            # service_role (server-only)
    │   │   └── middleware.ts       # refresh de sesión
    │   ├── whatsapp.ts             # builder del mensaje wa.me
    │   ├── format.ts               # moneda, fechas
    │   ├── constants.ts            # estados, métodos de pago
    │   └── utils.ts
    │
    ├── store/
    │   └── cart.ts                 # Zustand store (persist)
    │
    ├── types/
    │   ├── database.types.ts       # generado por Supabase CLI
    │   └── index.ts                # tipos de dominio
    │
    └── schemas/
        ├── checkout.schema.ts      # Zod
        ├── product.schema.ts
        └── category.schema.ts
```

---

## 7. Diseño de base de datos

### Diagrama Entidad-Relación

```
auth.users (Supabase) ──1:1──► profiles
                                  │ (role: admin/staff)
categories ──1:N──► products ──1:N──► product_images
                       │
                       └──1:N──► order_items ◄──N:1── orders ──1:N──► payments
```

### Tablas (DDL conceptual)

#### `profiles`
Extiende `auth.users`. Se crea automáticamente vía trigger al registrar un admin.
```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'staff' check (role in ('admin','staff')),
  created_at  timestamptz not null default now()
);
```

#### `categories`
```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_categories_slug on categories(slug);
create index idx_categories_active on categories(is_active);
```

#### `products`
```sql
create table products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),  -- precio tachado
  stock         int not null default 0 check (stock >= 0),
  sku           text unique,
  is_active     boolean not null default true,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_products_category on products(category_id);
create index idx_products_slug on products(slug);
create index idx_products_active on products(is_active);
create index idx_products_featured on products(is_featured) where is_featured = true;
-- Búsqueda de texto:
create index idx_products_search on products
  using gin (to_tsvector('spanish', name || ' ' || coalesce(description,'')));
```

#### `product_images`
```sql
create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,            -- path en Supabase Storage
  alt         text,
  is_primary  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_product_images_product on product_images(product_id);
```

#### `orders`
```sql
create table orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,          -- YK-2026-000123 (trigger)
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
create index idx_orders_status on orders(status);
create index idx_orders_number on orders(order_number);
create index idx_orders_created on orders(created_at desc);
create index idx_orders_email on orders(customer_email);
```

#### `order_items` (snapshot inmutable)
```sql
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null,                 -- snapshot
  unit_price   numeric(10,2) not null,        -- snapshot
  quantity     int not null check (quantity > 0),
  line_total   numeric(10,2) not null,        -- unit_price * quantity
  created_at   timestamptz not null default now()
);
create index idx_order_items_order on order_items(order_id);
```

#### `payments`
```sql
create table payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  method        text not null check (method in ('yape','plin','transferencia')),
  amount        numeric(10,2) not null,
  proof_url     text,                          -- comprobante (Storage)
  status        text not null default 'pendiente'
                check (status in ('pendiente','confirmado','rechazado')),
  confirmed_by  uuid references profiles(id),
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index idx_payments_order on payments(order_id);
```

### Funciones y Triggers

```sql
-- 1) Secuencia + número de pedido legible y atómico
create sequence order_number_seq start 1;

create or replace function set_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number :=
    'YK-' || to_char(now(),'YYYY') || '-' ||
    lpad(nextval('order_number_seq')::text, 6, '0');
  return new;
end; $$;

create trigger trg_set_order_number
  before insert on orders
  for each row when (new.order_number is null)
  execute function set_order_number();

-- 2) Crear profile automáticamente al registrar un usuario admin
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  return new;
end; $$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 3) updated_at automático (aplicar a categories, products, orders)
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
```

### Buenas prácticas aplicadas en BD
- **UUID** como PK (no exponen conteo de registros, mejor para sistemas distribuidos).
- **`numeric(10,2)`** para dinero (nunca `float`).
- **CHECK constraints** para estados y valores no negativos.
- **Snapshots** de precio/nombre en `order_items` (histórico inmutable — ADR-005).
- **Índices** en FKs, slugs, estados y búsqueda full-text en español.
- **`on delete cascade`** donde la relación es de composición; **`set null`** donde es referencia.
- **Timestamps** con zona horaria (`timestamptz`).

---

## 8. Seguridad y RLS

RLS activado en **todas** las tablas. Resumen de políticas:

| Tabla | Lectura pública (anon) | Escritura |
|---|---|---|
| `categories` | Solo `is_active = true` | Solo admin autenticado |
| `products` | Solo `is_active = true` | Solo admin autenticado |
| `product_images` | Sí (de productos activos) | Solo admin |
| `orders` | ❌ No | INSERT vía Server Action (service role); lectura solo admin |
| `order_items` | ❌ No | Igual que orders |
| `payments` | ❌ No | Solo admin |
| `profiles` | ❌ No | Cada uno el suyo; admin todos |

```sql
-- Ejemplo: products
alter table products enable row level security;

create policy "public lee productos activos"
  on products for select
  using (is_active = true);

create policy "admin gestiona productos"
  on products for all
  using (exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','staff')
  ))
  with check (exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','staff')
  ));

-- orders: la creación se hace server-side con service_role (bypassa RLS),
-- por eso no hay policy de INSERT público. Lectura solo admin:
alter table orders enable row level security;
create policy "admin lee pedidos"
  on orders for select
  using (exists (select 1 from profiles where id = auth.uid()));
```

> **Nota clave:** la creación de pedidos se hace en una **Server Action** usando el cliente con `service_role` (solo en el servidor), que ejecuta validación de stock y precios del lado servidor. Así el cliente nunca puede inyectar precios falsos.

---

## 9. Flujo de usuario (cliente)

```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
│   Home /    │──►│   Detalle    │──►│   Carrito   │──►│   Checkout   │
│  Catálogo   │   │  producto    │   │ (localStor.)│   │ (nombre,tel, │
│             │   │ +Add to cart │   │             │   │   correo)    │
└─────────────┘   └──────────────┘   └─────────────┘   └──────┬───────┘
                                                              │
                              Server Action: createOrder()    │
                              ─ valida stock y precios (server)│
                              ─ crea orders + order_items      │
                              ─ trigger genera order_number    │
                                                              ▼
                                              ┌───────────────────────────┐
                                              │  /checkout/exito/[number] │
                                              │  • Nº de pedido           │
                                              │  • Resumen de productos   │
                                              │  • Datos de pago:         │
                                              │    Yape / Plin / Banco    │
                                              │  • Botón "Enviar          │
                                              │    comprobante por        │
                                              │    WhatsApp"              │
                                              └─────────────┬─────────────┘
                                                            │
                                       wa.me con mensaje pre-rellenado:
                                       (nº pedido + items + total)
                                                            ▼
                                              Cliente paga y envía foto
                                              del comprobante por WhatsApp
```

### Mensaje de WhatsApp (autogenerado)
```
Hola! Quiero confirmar mi pedido *YK-2026-000123*

🛍️ Productos:
• Polo algodón (x2) — S/ 39.90 c/u
• Gorro lana (x1) — S/ 25.00

💰 *Total: S/ 104.80*

Adjunto mi comprobante de pago 👇
```

---

## 10. Flujo administrativo

```
Login (Supabase Auth) ──► Middleware verifica sesión + rol ──► /admin
                                                                  │
        ┌──────────────────┬──────────────┬─────────────────────┤
        ▼                  ▼              ▼                       ▼
   Dashboard          Productos      Categorías               Pedidos
   • # pedidos        • Crear        • Crear            • Listar/buscar/filtrar
   • # productos      • Editar       • Editar           • Ver detalle
   • Ventas sim.      • Eliminar     • Eliminar         • Cambiar estado:
   • Pendientes       • Activar/off                       pendiente →
                      • Subir imgs                        esperando_pago →
                                                          pago_enviado →
                                                          pago_confirmado →
                                                          en_preparacion →
                                                          entregado / cancelado
```

### Máquina de estados del pedido
```
pendiente ─► esperando_pago ─► pago_enviado ─► pago_confirmado ─► en_preparacion ─► entregado
     │              │                │                                                  
     └──────────────┴────────────────┴──────────────► cancelado (desde cualquier estado)
```

---

## 11. Diseño UI/UX

Inspiración: **Amazon** (densidad de info y confianza), **Mercado Libre** (cards y filtros), **Shopify** (estética limpia y comercial).

### Sistema de diseño
| Elemento | Definición |
|---|---|
| Tipografía | Inter / Geist (sans-serif moderna) |
| Color primario | Definir marca (ej. azul confianza o naranja energía) |
| Color acento | CTA (botón "Agregar al carrito", "Comprar") |
| Grises | Escala neutra para fondos y bordes |
| Radios | `rounded-lg` / `rounded-2xl` en cards |
| Sombras | Sutiles, elevación en hover |
| Espaciado | Sistema de 4px (Tailwind) |

### Componentes UI clave
- **Navbar** con buscador prominente, categorías y badge del carrito.
- **ProductCard**: imagen, nombre, precio, precio tachado, badge "destacado", botón rápido.
- **Galería de producto** con miniaturas.
- **CartSheet** (panel lateral deslizante).
- **Skeletons** de carga (Suspense).
- **Estados vacíos** diseñados (carrito vacío, sin resultados).
- **Toasts** para feedback (Sonner).
- **Mobile-first**, responsive total.

> Esta capa se construirá apoyándose en la skill **frontend-design** para lograr un acabado comercial, y se auditará con **web-design-guidelines** (accesibilidad/UX).

---

## 12. Roadmap por fases

### 🟢 Fase 0 — Setup (Fundamentos)
- Crear proyecto Next.js 15 + TS + Tailwind.
- Crear proyecto Supabase + variables de entorno.
- Instalar dependencias, shadcn/ui.
- Configurar clientes Supabase (browser/server/admin).
- **Entregable:** proyecto arranca, conexión a Supabase OK.

### 🟢 Fase 1 — Base de datos
- Migraciones SQL: esquema, funciones, triggers, RLS, seed.
- Generar `database.types.ts`.
- Crear bucket de Storage para imágenes.
- **Entregable:** BD completa con datos de prueba.

### 🟢 Fase 2 — Sitio público (catálogo)
- Home, catálogo, categorías, detalle de producto, buscador.
- ProductCard, grid, navbar, footer.
- **Entregable:** se pueden ver productos reales desde Supabase.

### 🟢 Fase 3 — Carrito + Checkout
- Store Zustand, CartSheet, página carrito.
- Form de checkout (RHF + Zod).
- Server Action `createOrder` con validación server-side.
- Página de éxito con datos de pago + WhatsApp.
- **Entregable:** flujo de compra completo funcionando.

### 🟢 Fase 4 — Auth + Panel admin
- Login, middleware, guard de rutas.
- Dashboard con métricas.
- CRUD productos + uploader de imágenes.
- CRUD categorías.
- Gestión de pedidos + cambio de estado.
- **Entregable:** admin operativo.

### 🟢 Fase 5 — Pulido + Deploy
- Estados de carga, errores, SEO básico, OG tags.
- Auditoría de accesibilidad y seguridad.
- Deploy en Vercel.
- **Entregable:** demo en producción.

### 🔵 Fase 6+ — Evolución a producción (futuro)
- Pasarela de pago (Culqi / Mercado Pago / Stripe).
- Cuentas de cliente + historial.
- Cupones, envíos, inventario avanzado.
- Emails transaccionales (Resend).
- Analítica.

---

## 13. Plan de implementación paso a paso

> Orden recomendado de ejecución una vez aprobado este plan.

1. **Inicializar repo + Next.js 15** (`create-next-app`, TS, Tailwind, App Router).
2. **Crear proyecto en Supabase**, copiar URL + keys a `.env.local`.
3. **Escribir migraciones SQL** (4 archivos) y aplicarlas.
4. **Generar tipos** TypeScript desde Supabase CLI.
5. **Configurar clientes Supabase** (`client.ts`, `server.ts`, `admin.ts`, `middleware.ts`).
6. **Instalar shadcn/ui** y componentes base (button, card, input, sheet, table, dialog, badge).
7. **Layout público** (Navbar, Footer) + Home con productos destacados.
8. **Catálogo + detalle de producto** (Server Components leyendo Supabase).
9. **Buscador** (full-text search en español).
10. **Carrito** (Zustand persist + CartSheet + página carrito).
11. **Checkout** (form + Server Action `createOrder` con validación de stock/precio server-side).
12. **Página de éxito** (datos de pago + builder de WhatsApp).
13. **Auth admin** (login + middleware + guard).
14. **Dashboard** (métricas con queries agregadas).
15. **CRUD productos** + ImageUploader (Supabase Storage).
16. **CRUD categorías**.
17. **Gestión de pedidos** (tabla, filtros, detalle, cambio de estado).
18. **Pulido UI** (skeletons, empty states, toasts, responsive).
19. **Auditoría** (security-review + web-design-guidelines).
20. **Deploy en Vercel** + variables de entorno de producción.

---

## 14. Buenas prácticas Next.js + Supabase

- **Server Components por defecto**; `'use client'` solo donde haya interactividad.
- **Server Actions** para mutaciones (crear pedido, CRUD), nunca exponer lógica de negocio al cliente.
- **`@supabase/ssr`** para manejo correcto de cookies/sesión en App Router.
- **`service_role` solo en el servidor** — jamás en componentes cliente ni en `NEXT_PUBLIC_*`.
- **Validar con Zod** en el borde de cada Server Action (no confiar en el cliente).
- **Tipos generados** de Supabase (`database.types.ts`) — fuente de verdad.
- **Revalidación**: `revalidatePath` / `revalidateTag` tras mutaciones.
- **`next/image`** con dominios de Supabase Storage configurados en `next.config.ts`.
- **Streaming + Suspense** para listas con skeletons.
- **No traer precios desde el cliente**: recalcular total en el servidor con los precios reales de BD.
- **Errores tipados** y manejo consistente (`error.tsx`, toasts).
- **Migraciones versionadas** en `supabase/migrations/` (nada de cambios manuales en el dashboard).

---

## 15. Recomendaciones de seguridad

| # | Recomendación |
|---|---|
| 1 | **RLS activado en todas las tablas** desde el inicio. |
| 2 | **`service_role` jamás llega al navegador.** Solo en Server Actions/Route Handlers. |
| 3 | **Validación server-side** de stock y precios; el cliente solo envía IDs y cantidades. |
| 4 | **Middleware** protege `/admin/**` verificando sesión + rol en `profiles`. |
| 5 | **Sanitizar/validar** todos los inputs con Zod (incluido teléfono y email del checkout). |
| 6 | **Rate limiting** en la Server Action de creación de pedidos (evitar spam) — Fase 5. |
| 7 | **Storage con políticas**: subida solo para admin; lectura pública solo del bucket de productos. |
| 8 | **Comprobantes de pago** en bucket privado (acceso firmado), no público. |
| 9 | **No exponer** datos de otros pedidos: `orders` sin lectura pública. |
| 10 | **CSP / headers** de seguridad en `next.config.ts` (Fase 5). |
| 11 | **Secretos** solo en variables de entorno de Vercel, nunca en el repo. |
| 12 | **Confirmación de email** del admin activada en Supabase Auth. |

---

## 16. Variables de entorno

`.env.example` (plantilla a commitear):
```bash
# Supabase (público — seguro con RLS)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (PRIVADO — solo servidor, NUNCA NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=

# Negocio
NEXT_PUBLIC_WHATSAPP_PHONE=51999999999      # número del admin (formato internacional)
NEXT_PUBLIC_STORE_NAME=Tienda YienKid

# Datos de pago manual (mostrados en página de éxito)
NEXT_PUBLIC_YAPE_NUMBER=999999999
NEXT_PUBLIC_PLIN_NUMBER=999999999
NEXT_PUBLIC_BANK_NAME=BCP
NEXT_PUBLIC_BANK_ACCOUNT=191-xxxxxxx-0-xx
NEXT_PUBLIC_BANK_CCI=00219100xxxxxxx0xx12
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **sin** prefijo `NEXT_PUBLIC_`. Si lleva ese prefijo, se filtra al navegador.

---

## 17. Despliegue en Vercel

1. Conectar el repositorio Git a Vercel.
2. Configurar variables de entorno (las de arriba) en el dashboard de Vercel.
3. Añadir el dominio de Supabase a `next.config.ts` (`images.remotePatterns`).
4. Cada push a `main` → deploy automático.
5. Configurar **Preview Deployments** para ramas (revisión antes de merge).
6. Verificar que las migraciones estén aplicadas en el proyecto Supabase de producción.

---

## ✅ Checklist de aprobación antes de codificar

- [x] Arquitectura definida
- [x] Decisiones de diseño confirmadas (pago, auth, imágenes)
- [x] Base de datos diseñada con RLS
- [x] Roadmap por fases
- [x] Flujos de usuario y admin
- [x] Plan de seguridad
- [ ] **Aprobación del cliente para iniciar Fase 0**

---

*Documento generado como base del proyecto. La implementación comienza solo tras aprobación. Stack: Next.js 15 · TypeScript · Tailwind · Supabase · Vercel.*
