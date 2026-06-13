# Configurar "Iniciar sesión con Google" (clientes)

El código ya está listo (botón en el header, sesión del cliente, callback). Falta
**activar el proveedor Google**, que se hace una sola vez. Son 2 partes: Google
Cloud y Supabase. ~10 minutos.

> Importante: esto es para **clientes**. El login del **admin** (usuario/contraseña)
> sigue funcionando igual y no se toca.

---

## Datos que necesitarás

- **URL de tu proyecto Supabase:** `https://mqikdfabcilglqoovyon.supabase.co`
- **Callback de Supabase (la usarás en Google):**
  `https://mqikdfabcilglqoovyon.supabase.co/auth/v1/callback`

---

## Parte 1 — Google Cloud Console

1. Entra a https://console.cloud.google.com/ con tu cuenta de Google.
2. Arriba, crea un proyecto (o elige uno). Nombre: `HOKAPON`.
3. Menú ☰ → **APIs y servicios** → **Pantalla de consentimiento de OAuth**
   (OAuth consent screen):
   - Tipo de usuario: **Externos** → Crear.
   - Nombre de la app: `HOKAPON`. Correo de asistencia: el tuyo.
   - Datos de contacto del desarrollador: tu correo. Guarda y continúa hasta
     el final (puedes dejar scopes por defecto).
   - En "Usuarios de prueba" agrega tu propio correo si te lo pide (mientras
     la app esté en modo prueba).
4. Menú ☰ → **APIs y servicios** → **Credenciales** → **Crear credenciales** →
   **ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**.
   - Nombre: `HOKAPON Web`.
   - **Orígenes autorizados de JavaScript** → agrega:
     - `https://hokapon.vercel.app`
     - `http://localhost:3000`
   - **URIs de redireccionamiento autorizados** → agrega EXACTAMENTE:
     - `https://mqikdfabcilglqoovyon.supabase.co/auth/v1/callback`
   - Crear. Te dará un **Client ID** y un **Client Secret** → cópialos.

---

## Parte 2 — Supabase

1. Entra a tu proyecto en https://supabase.com → **Authentication** →
   **Sign In / Providers** (o "Providers").
2. Busca **Google** → actívalo (Enable).
3. Pega el **Client ID** y el **Client Secret** del paso anterior. Guarda.
4. Ve a **Authentication** → **URL Configuration**:
   - **Site URL:** `https://hokapon.vercel.app`
   - **Redirect URLs** → agrega ambas (una por línea):
     - `https://hokapon.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
   - Guarda.

---

## Probar

1. Local: `npm run dev` → abre http://localhost:3000 → botón **"Iniciar sesión"**
   (arriba a la derecha) → elige tu cuenta Google → debe volver a la tienda con
   tu nombre/foto en el header.
2. Producción: igual en https://hokapon.vercel.app

Si sale un error de "redirect_uri_mismatch", revisa que la URI de
redireccionamiento en Google sea EXACTAMENTE la de Supabase
(`.../auth/v1/callback`).

---

## Notas

- Un cliente que entra con Google **no** tiene acceso al panel `/admin` (su rol
  no es staff). Eso es intencional y seguro.
- Por ahora iniciar sesión solo muestra su nombre/foto y un menú con "Cerrar
  sesión" y "Seguir mi pedido". Más adelante se le pueden sumar funciones
  (autocompletar checkout, "Mis pedidos", etc.).
