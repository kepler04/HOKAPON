# Operacion y Despliegue

Esta guia resume las indicaciones actuales para mantener HOKAPON en local,
Supabase, Vercel y GitHub.

## Flujo Diario

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Antes de subir cambios:

```bash
npm run typecheck
npm run build
git status --short
```

## GitHub y Vercel

El remoto principal es:

```text
https://github.com/kepler04/HOKAPON.git
```

Flujo recomendado:

```bash
git add .
git commit -m "mensaje claro"
git push origin main
```

Vercel deberia desplegar automaticamente cada push a `main`.

Si Vercel muestra una version vieja:

- Hacer hard refresh en el navegador (`Ctrl + F5`).
- Revisar el deploy mas reciente en Vercel.
- Forzar redeploy si cambiaste variables `NEXT_PUBLIC_*`.
- Recordar que las variables `NEXT_PUBLIC_*` se insertan en el bundle al construir.

## Variables en Vercel

Configurar en Vercel > Project > Settings > Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STORE_NAME=HOKAPON
NEXT_PUBLIC_WHATSAPP_PHONE=51...
NEXT_PUBLIC_CURRENCY=PEN
NEXT_PUBLIC_CURRENCY_SYMBOL=S/
```

Tambien pueden existir datos de pago publicos por compatibilidad, pero la fuente
actual para la pagina de exito es la tabla `payment_methods`.

Reglas:

- No poner `SUPABASE_SERVICE_ROLE_KEY` en variables publicas.
- No subir `.env.local`.
- Si cambias una variable `NEXT_PUBLIC_*`, redeploy obligatorio.

## Supabase Auth

Configurar en Supabase > Authentication > URL Configuration.

Site URL de produccion:

```text
https://tu-dominio.vercel.app
```

Redirect URLs recomendadas:

```text
https://tu-dominio.vercel.app/auth/callback
https://tu-dominio.vercel.app/cuenta/nueva-clave
http://localhost:3000/auth/callback
http://localhost:3000/cuenta/nueva-clave
```

Usos:

- `/auth/callback`: Google OAuth y confirmaciones/callbacks generales.
- `/cuenta/nueva-clave`: recuperacion de contrasena de clientes.

## Login de Cliente

Ruta:

```text
/cuenta
```

Permite:

- Iniciar sesion con correo y contrasena.
- Registrarse como cliente.
- Continuar con Google si el proveedor esta configurado.
- Recuperar contrasena desde `/cuenta/recuperar`.

La recuperacion envia un enlace a `/cuenta/nueva-clave`. Si local funciona y
Vercel no, revisar Redirect URLs y hacer redeploy.

## Login Admin

Ruta:

```text
/login
```

El admin no usa correo visible en el formulario. Usa usuario:

```text
yienkid
```

Internamente se transforma en:

```text
yienkid@yienkid.local
```

Para entrar al panel el usuario debe tener rol `admin` o `staff` en
`public.profiles`.

## Admin de Pedidos

Ruta:

```text
/admin/pedidos
```

Uso recomendado:

- Usar "Requiere accion" para ver pedidos `pendiente`, `esperando_pago` y
  `pago_enviado`.
- Buscar por numero de pedido, nombre, correo o telefono.
- Filtrar por rango de fechas cuando revises ventas de un dia o semana.
- Abrir WhatsApp desde la fila para escribir al cliente con el numero de pedido.
- Copiar el numero de pedido desde la fila cuando se coordine por chat.
- Avanzar estado desde la fila solo para casos normales.

Regla importante: al avanzar a `pago_confirmado`, la app intenta descontar stock.
Si no hay stock suficiente, la accion rapida se detiene y debes abrir el detalle
del pedido para revisar el faltante o confirmar manualmente segun corresponda.

## Pagos

Ruta admin:

```text
/admin/pagos
```

Los metodos activos salen en:

```text
/checkout/exito/[orderNumber]
```

Tabla:

```text
payment_methods
```

Campos importantes:

- `kind`: `wallet` o `bank`.
- `label`: nombre visible, por ejemplo `Yape`, `Plin`, `Transferencia BCP`.
- `number`, `holder`, `bank_name`, `account`, `cci`.
- `is_active`: controla si aparece en la pagina de pago.
- `sort_order`: orden de visualizacion.

## Logos Estaticos de Pago

Los logos no se suben desde el admin. Estan fijos en `public/pagos`:

| Metodo o banco detectado | Archivo |
| --- | --- |
| `Yape` | `public/pagos/yape.png` |
| `Plin` | `public/pagos/plin.png` |
| `BCP` | `public/pagos/bcp.webp` |
| `BBVA` | `public/pagos/bbva.png` |

El componente detecta el logo leyendo `label` y `bank_name`.

Archivo:

```text
src/features/checkout/components/payment-methods.tsx
```

Para agregar otro logo estatico:

1. Colocar la imagen en `public/pagos`.
2. Agregar el caso en `getPaymentLogo`.
3. Verificar con `npm run build`.

## Checkout

Ruta:

```text
/checkout
```

Comportamiento actual:

- El cliente llena sus datos.
- Al presionar "Confirmar pedido" aparece un overlay inmediato.
- El pedido se crea en una Server Action con `service_role`.
- El servidor recalcula precios, valida stock y limites por producto.
- Navega con `router.replace` a `/checkout/exito/[orderNumber]`.
- El carrito se limpia al montar la pagina confirmada.

No limpiar el carrito antes de navegar, porque eso hace que se vea el checkout
vacio durante la espera.

## Pagina de Pedido Confirmado

Ruta:

```text
/checkout/exito/[orderNumber]
```

Muestra:

- Numero de pedido copiable.
- Resumen con imagenes de productos.
- Total a pagar.
- Metodos de pago activos.
- Boton de WhatsApp con mensaje prellenado.
- Link a seguimiento.

## Seguimiento de Pedido

Ruta:

```text
/seguimiento
```

El cliente ingresa:

- Numero de pedido.
- Correo o telefono usado en la compra.

Si ambos coinciden con el pedido, se muestra:

- Estado actual.
- Timeline completo.
- Fecha de creacion.
- Total.
- Productos con imagen.
- Boton de WhatsApp con mensaje de consulta.

El lookup publico esta protegido por contacto: `getPublicOrderForTracking`
requiere numero de pedido y correo/telefono coincidente.

## Migraciones

Todas las migraciones estan en:

```text
supabase/migrations
```

Aplicar siempre en orden. La version actual llega hasta:

```text
0014_payment_methods.sql
```

Despues de cambiar la BD, actualizar tipos:

```bash
npm run db:types
```

## Verificacion Rapida

```bash
npm run typecheck
npm run build
```

Warnings conocidos actuales:

- `src/components/layout/footer.tsx`: import sin usar `STORE_NAME`.
- `src/features/inventory/types.ts`: import sin usar `StockMovementType`.

No bloquean el build.
