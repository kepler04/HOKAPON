# Confirmación de cuenta por código (OTP de 6 dígitos)

El registro ya **no** pide hacer clic en un enlace: tras crear la cuenta, el
cliente ve una pantalla para escribir el **código de 6 dígitos** que le llega
por correo. Para que el correo traiga ese código (y no el enlace de siempre),
hay que ajustar **una plantilla en Supabase**. Es un cambio de un minuto.

## Paso único: editar la plantilla "Confirm signup"

1. Entra al **Dashboard de Supabase** → tu proyecto.
2. Menú lateral: **Authentication** → **Email Templates**.
3. Selecciona la plantilla **"Confirm signup"**.
4. Reemplaza el contenido por uno que muestre el **código** (`{{ .Token }}`)
   en lugar del enlace. Por ejemplo:

```html
<h2>Confirma tu cuenta en HOKAPON</h2>
<p>Usa este código para activar tu cuenta:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px;">{{ .Token }}</p>
<p>El código vence en 1 hora. Si no creaste esta cuenta, ignora este correo.</p>
```

5. **Guarda** (Save).

> Importante: lo que habilita el código es la variable **`{{ .Token }}`**.
> La plantilla por defecto usa `{{ .ConfirmationURL }}` (el enlace) — esa es la
> que hay que cambiar. Puedes dejar también el enlace si quieres ofrecer ambas
> opciones, pero con el código basta.

## Requisitos que ya están bien

- **Email provider activo** (Authentication → Providers → Email): ✅
- **"Confirm email" activado** (que pida confirmación): ✅ (`mailer_autoconfirm` en
  `false`). Si lo pones en `true`, las cuentas entran sin código y esta pantalla
  no aparece.

## Cómo se ve el flujo ya implementado

1. Cliente llena correo + contraseña → **Crear cuenta**.
2. Supabase envía el correo con el código de 6 dígitos.
3. Aparece la pantalla **"Verifica tu correo"** con un campo para el código.
4. Escribe el código → **Confirmar y entrar** → queda logueado al instante.
5. Botones extra: **Reenviar código** y **Volver**.

Código relevante:
- `src/features/customer-auth/actions.ts` → `verifySignupOtp`, `resendSignupOtp`
- `src/features/customer-auth/components/account-forms.tsx` → `OtpStep`
