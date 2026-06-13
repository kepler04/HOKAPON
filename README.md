# Tienda YienKid 🛒

Demo profesional de ecommerce — Next.js 15 · TypeScript · Tailwind · Supabase · Vercel.
Pago manual (Yape / Plin / transferencia) coordinado por WhatsApp.

> Arquitectura completa en [`ECOMMERCE_MASTER_PLAN.md`](./ECOMMERCE_MASTER_PLAN.md).

## Estado actual

✅ **Fase 0 (Setup)** y **Fase 1 (Base de datos)** completas. El proyecto compila
y construye (`next build` ✓). La tienda pública (Fase 2) aún no está construida.

## Puesta en marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el proyecto Supabase y aplicar la BD
Sigue [`supabase/README.md`](./supabase/README.md):
- Crea el proyecto en supabase.com.
- Ejecuta las migraciones `0001` → `0005` (SQL Editor o `supabase db push`).
- Crea el usuario admin y promuévelo a `role = 'admin'`.

### 3. Configurar variables de entorno
Copia los valores de tu proyecto Supabase en `.env.local`
(plantilla documentada en [`.env.example`](./.env.example)):
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # ⚠️ solo servidor
NEXT_PUBLIC_WHATSAPP_PHONE=51...     # tu número de admin
# + datos de Yape / Plin / banco
```

### 4. (Opcional) Regenerar los tipos de la BD
```bash
npm run db:types   # requiere supabase CLI enlazado
```
Hasta entonces, `src/types/database.types.ts` es un placeholder fiel al esquema.

### 5. Arrancar
```bash
npm run dev        # http://localhost:3000
```

## Scripts
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:types` | Generar tipos desde Supabase |

## Estructura
```
src/
├── app/              # rutas (App Router)
│   ├── page.tsx      # home (placeholder Fase 0)
│   ├── login/        # login admin (placeholder; Fase 4)
│   └── auth/         # callback + signout (route handlers)
├── lib/
│   ├── supabase/     # client / server / admin / middleware
│   ├── constants.ts  # estados, métodos de pago, datos de pago
│   ├── format.ts     # moneda, fechas
│   ├── whatsapp.ts   # builder del mensaje wa.me
│   └── utils.ts      # cn(), slugify()
├── schemas/          # validación Zod (checkout, product, category)
├── store/            # (Fase 3) carrito Zustand
└── types/            # database.types.ts + tipos de dominio
middleware.ts         # guard de /admin + refresh de sesión
supabase/migrations/  # SQL versionado (0001–0005)
```

## Seguridad (ya implementado en la base)
- RLS activado en todas las tablas (`supabase/migrations/0003_rls_policies.sql`).
- `service_role` aislado en el servidor (`import "server-only"` en `lib/supabase/admin.ts`).
- Middleware protege `/admin/**` verificando sesión + rol.
- Bucket de comprobantes privado; bucket de imágenes público de solo lectura.
- Self-signup deshabilitado (admins provisionados manualmente).
