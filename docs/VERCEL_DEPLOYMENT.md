# Despliegue seguro en Vercel

La aplicación usa una sola API Express. `server/app.mjs` define la aplicación, `server/index.mjs` la ejecuta localmente y `api/[...path].mjs` expone la misma instancia como Vercel Function.

## Preparación

1. Crear el proyecto Supabase y ejecutar, en orden, las migraciones de `supabase/migrations/`.
2. Regenerar el token de Google Calendar con `npm run google:calendar:connect` y comprobarlo localmente.
3. Configurar y verificar el buzón SMTP con `npm run verify:email`.
4. Importar el repositorio de GitHub en Vercel.
5. Configurar las variables usando `.env.vercel.example` como referencia. Los valores privados deben existir únicamente en Vercel.

## Configuración de Vercel

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Node.js: 22.
- Root directory: raíz del repositorio.

Configurar `VITE_BASE_PATH=/`, `PUBLIC_BASE_PATH=/` y las URL públicas HTTPS del dominio definitivo.

## Supabase

La clave `SUPABASE_SERVICE_ROLE_KEY` se usa únicamente en la función backend. Las tablas tienen RLS habilitado y no conceden acceso al rol anónimo. La segunda migración agrega idempotencia para reservas y almacenamiento del contenido administrable.

## Verificación

Después del despliegue:

```text
GET  /api/health
GET  /api/ready
GET  /api/ready?deep=1
POST /api/contact
GET  /api/scheduling/availability?date=AAAA-MM-DD
POST /api/scheduling/book
```

`/api/ready?deep=1` valida conectividad real con Supabase, Google OAuth y SMTP. No debe usarse como monitor de alta frecuencia.

Completar una reserva real y confirmar:

1. Evento en Google Calendar.
2. Enlace de Google Meet.
3. Registro `lead` y `appointment` en Supabase.
4. Correo interno y confirmación al cliente.

## Seguridad aplicada

- CSP, HSTS, protección contra iframes, `nosniff` y política de permisos.
- Validación de origen en operaciones que modifican datos.
- Cookies administrativas `HttpOnly`, `Secure` y `SameSite=Strict`.
- Sesión administrativa firmada, compatible con serverless.
- Payload JSON limitado a 64 KB.
- Rate limiting defensivo por instancia.
- Honeypot y tiempo mínimo en el formulario de contacto.
- Idempotencia y exclusión de horarios duplicados mediante Supabase.
- Logs de producción sin datos personales ni respuestas completas de proveedores.

Para protección anti-bot distribuida, el siguiente control recomendado es Cloudflare Turnstile validado en el servidor.
