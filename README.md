# HOKAPON

Ecommerce en Next.js 15, TypeScript, Tailwind CSS, Supabase y Vercel.
La tienda usa pago manual con Yape, Plin o transferencia y coordina el
comprobante por WhatsApp.

> Guia operativa completa: [docs/operacion-y-despliegue.md](./docs/operacion-y-despliegue.md)

## Estado Actual

El proyecto ya incluye:

- Tienda publica con home, productos, categorias, busqueda, favoritos y carrito.
- Checkout con cuenta de cliente o invitado.
- Pagina de pedido confirmado con resumen, numero de pedido, datos de pago y WhatsApp.
- Logos estaticos para metodos de pago: Yape, Plin, BCP y BBVA.
- Cuentas de cliente con login, Google OAuth, recuperacion y cambio de contrasena.
- Panel admin protegido con dashboard, productos, categorias, inventario, pedidos y pagos.
- Supabase con migraciones versionadas hasta `0014_payment_methods.sql`.
- Deploy preparado para Vercel.

## Requisitos

- Node.js compatible con Next.js 15.
- Proyecto Supabase creado.
- Variables de entorno en `.env.local`.

## Instalacion Local

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor local |
| `npm run build` | Build de produccion |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm run db:types` | Generar tipos desde Supabase local |

## Variables de Entorno

Usa `.env.example` como plantilla:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STORE_NAME=HOKAPON
NEXT_PUBLIC_WHATSAPP_PHONE=51...
NEXT_PUBLIC_CURRENCY_SYMBOL=S/
```

Notas importantes:

- `SUPABASE_SERVICE_ROLE_KEY` nunca debe llevar `NEXT_PUBLIC_`.
- Las variables `NEXT_PUBLIC_*` quedan embebidas en el build de Next.js. Si cambian en Vercel, hay que redeployar.
- No subir `.env.local` ni archivos con secretos.

## Supabase

Aplicar las migraciones en orden desde `supabase/migrations` o usar:

```bash
supabase db push
```

Ver detalles en [supabase/README.md](./supabase/README.md).

## Login

Hay dos flujos distintos:

- Cliente: `/cuenta`, usa correo y contrasena. Tambien soporta Google OAuth y recuperacion de contrasena.
- Admin: `/login`, usa nombre de usuario. Internamente `yienkid` se convierte en `yienkid@yienkid.local`.

El panel `/admin/**` esta protegido por middleware y requiere rol `admin` o `staff` en `profiles`.

## Pagos

Los metodos se administran desde:

```text
/admin/pagos
```

La pagina `/checkout/exito/[orderNumber]` muestra solo metodos activos desde la tabla `payment_methods`.

Los logos son estaticos:

| Texto detectado | Imagen |
| --- | --- |
| `Yape` | `public/pagos/yape.png` |
| `Plin` | `public/pagos/plin.png` |
| `BCP` | `public/pagos/bcp.webp` |
| `BBVA` | `public/pagos/bbva.png` |

Si agregas otro metodo con logo fijo, agrega la imagen en `public/pagos` y actualiza el mapper en `src/features/checkout/components/payment-methods.tsx`.

## Checkout

Al confirmar pedido:

1. El cliente ve un overlay inmediato de preparacion.
2. El servidor valida productos, stock, limites y precios reales.
3. Se crea el pedido y sus items en Supabase.
4. Se redirige con `router.replace` a `/checkout/exito/[orderNumber]`.
5. El carrito se limpia al entrar a la pagina de confirmacion.

Esto evita que se vea una pantalla intermedia de checkout vacio.

## Seguimiento de Pedido

Ruta:

```text
/seguimiento
```

El cliente debe ingresar:

- Numero de pedido.
- Correo o telefono usado en la compra.

La pagina muestra estado actual, timeline, total, productos y boton de WhatsApp.
El contacto es obligatorio para no exponer un pedido solo por adivinar el numero.

## Vercel

Cada push a `main` despliega en Vercel si el proyecto esta conectado al repo.

Checklist:

- Variables de entorno cargadas en Vercel.
- Supabase Auth con URLs de redireccion configuradas.
- Migraciones aplicadas en la base de produccion.
- Redeploy despues de cambiar variables `NEXT_PUBLIC_*`.

Si en produccion algo funciona en local pero no en Vercel:

- Hacer hard refresh (`Ctrl + F5`).
- Revisar que Vercel tenga las variables correctas.
- Redeployar para regenerar el bundle.
- Revisar URLs permitidas en Supabase Auth.

## Documentacion Relacionada

- [Operacion y despliegue](./docs/operacion-y-despliegue.md)
- [Configurar Google Login](./docs/google-login-setup.md)
- [Supabase](./supabase/README.md)
- [Master plan historico](./ECOMMERCE_MASTER_PLAN.md)
