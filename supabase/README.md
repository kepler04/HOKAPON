# Supabase - HOKAPON

Migraciones SQL y configuracion de base de datos para la tienda.

## Orden de Migraciones

Aplicar siempre en orden:

| Archivo | Proposito |
| --- | --- |
| `0001_init_schema.sql` | Tablas base, indices y relaciones |
| `0002_functions_triggers.sql` | Numero de pedido, perfiles, `updated_at`, `is_staff()` |
| `0003_rls_policies.sql` | Row Level Security |
| `0004_storage.sql` | Buckets de Storage y politicas |
| `0005_seed.sql` | Datos demo |
| `0006_stock_management.sql` | Gestion inicial de stock |
| `0007_category_images.sql` | Imagenes para categorias |
| `0008_force_commit_stock.sql` | Ajustes de commit/stock |
| `0009_allow_negative_stock.sql` | Ajuste temporal para stock negativo |
| `0010_stock_movements.sql` | Kardex/movimientos de inventario |
| `0011_customer_accounts.sql` | Cuentas de cliente, perfiles y pedidos por usuario |
| `0012_max_per_order.sql` | Limite maximo por producto en un pedido |
| `0013_favorites.sql` | Favoritos/wishlist |
| `0014_payment_methods.sql` | Metodos de pago configurables |

## Aplicar Migraciones

### Opcion A: Supabase Dashboard

1. Abrir Supabase > SQL Editor.
2. Ejecutar cada archivo de `supabase/migrations` en orden.
3. Verificar tablas, policies y buckets.

### Opcion B: Supabase CLI

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

## Generar Tipos

```bash
supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
```

O si trabajas con Supabase local:

```bash
npm run db:types
```

## Auth

### Admin

Crear usuario en Supabase Auth y asignar rol:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'admin@tu-dominio.com'
);
```

El login admin de la app usa username. Por ejemplo `yienkid` se transforma en
`yienkid@yienkid.local`.

### Clientes

Los clientes usan `/cuenta` con correo y contrasena o Google OAuth. La tabla
`customer_profiles` guarda datos editables como nombre, telefono y direccion.

## URL Configuration

En Supabase > Authentication > URL Configuration:

```text
https://tu-dominio.vercel.app/auth/callback
https://tu-dominio.vercel.app/cuenta/nueva-clave
http://localhost:3000/auth/callback
http://localhost:3000/cuenta/nueva-clave
```

`/cuenta/nueva-clave` es necesario para recuperacion de contrasena.

## Metodos de Pago

La tabla `payment_methods` controla lo que aparece en
`/checkout/exito/[orderNumber]`.

Campos:

- `kind`: `wallet` o `bank`.
- `label`: nombre visible.
- `number`: numero de Yape/Plin si aplica.
- `holder`: titular.
- `bank_name`, `account`, `cci`: datos bancarios.
- `is_active`: si se muestra al cliente.
- `sort_order`: orden.

Los logos no viven en Supabase. Son archivos estaticos en `public/pagos` y se
detectan por `label` o `bank_name`.

## Seguridad

- RLS activo en tablas publicas.
- `service_role` solo se usa en servidor.
- El cliente nunca envia precios confiables; el servidor recalcula total.
- `/admin/**` requiere sesion y rol `admin` o `staff`.
- Los comprobantes se coordinan por WhatsApp; no hay subida publica de comprobantes.
