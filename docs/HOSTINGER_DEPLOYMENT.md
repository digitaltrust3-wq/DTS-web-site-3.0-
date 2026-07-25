# Despliegue de Digital Trust Solutions en Hostinger

Esta configuración publica el frontend React, la API Express, el panel privado y los correos automáticos como una sola aplicación Node.js.

## 1. Crear los buzones

En hPanel abre **Emails**, selecciona el dominio y crea dos cuentas:

- `hola@tu-dominio.com`: buzón autenticado que envía la bienvenida.
- `cotizaciones@tu-dominio.com`: buzón donde llegan las solicitudes.

Guarda la contraseña del buzón `hola`. No la agregues al repositorio.

La configuración oficial de Hostinger Email es:

```text
Servidor SMTP: smtp.hostinger.com
Puerto: 465
Cifrado: SSL
Usuario: dirección completa del buzón
```

Si SSL 465 falla, la alternativa oficial es puerto `587`, TLS/STARTTLS y `SMTP_SECURE=false`.

## 2. Crear la aplicación Node.js

En hPanel:

1. Abre **Websites** y selecciona **Add website**.
2. Elige **Node.js Web App**.
3. Selecciona **Import Git Repository**.
4. Autoriza GitHub y elige `digitaltrust3-wq/DTS-web-site-3.0-`.
5. Usa la rama `main`.
6. Selecciona Node.js 22.

Configuración de compilación:

```text
Build command: npm run build
Start command: npm start
Entry file: server/index.mjs
```

Hostinger instala las dependencias del `package-lock.json` durante el despliegue.

## 3. Variables de entorno

Copia las claves de `.env.hostinger.example` en **Environment Variables** dentro del panel de la aplicación. Reemplaza `your-domain.com` por el dominio real.

Valores esenciales:

```env
NODE_ENV=production
PUBLIC_BASE_PATH=/
PUBLIC_SITE_URL=https://tu-dominio.com/
VITE_BASE_PATH=/
VITE_SITE_URL=https://tu-dominio.com/
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hola@tu-dominio.com
SMTP_PASS=CONTRASEÑA_DEL_BUZÓN_HOLA
CONTACT_FROM="Digital Trust Solutions <hola@tu-dominio.com>"
CONTACT_TO=cotizaciones@tu-dominio.com
```

Añade también las variables `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` del panel privado. Nunca copies `.env` al repositorio.

Para activar reservas y Google Meet, agrega también estas variables privadas:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REFRESH_TOKEN=tu-refresh-token
GOOGLE_CALENDAR_ID=primary
GOOGLE_TIME_ZONE=America/Bogota
SCHEDULING_UTC_OFFSET=-05:00
SCHEDULING_START_HOUR=8
SCHEDULING_END_HOUR=21
SCHEDULING_SLOT_MINUTES=30
SCHEDULING_DAYS_AHEAD=30
SCHEDULING_MIN_NOTICE_HOURS=4
```

No agregues estas credenciales con prefijo `VITE_`. El puerto `3012` se usa únicamente en tu equipo para generar el refresh token; el servidor publicado debe usar el valor `PORT` asignado por Hostinger.

## 4. Dominio y HTTPS

Conecta el dominio a la aplicación desde el panel de Hostinger y espera a que el certificado SSL quede activo. `PUBLIC_SITE_URL` y `VITE_SITE_URL` deben comenzar con `https://` y terminar con `/`.

Si el dominio y el correo se administran en Hostinger, hPanel normalmente presenta los registros MX necesarios. Verifica el estado del dominio en **Emails** antes de probar SMTP.

## 5. Verificación

La aplicación expone:

```text
https://tu-dominio.com/api/health
```

Debe responder con `{"status":"ok"}`.

También verifica:

```text
https://tu-dominio.com/api/ready
```

Debe responder con estado HTTP 200 y `{"status":"ready"}`. Antes de publicar, ejecuta `npm run check:deployment` para detectar variables faltantes o puertos mal configurados.

Para verificar las credenciales SMTP desde un entorno que tenga las variables configuradas:

```bash
npm run verify:email
```

Para enviar además un mensaje real a `CONTACT_TO`, configura temporalmente:

```env
EMAIL_SEND_TEST=true
```

Después vuelve a `false`.

## 6. Flujo del formulario

Cuando un cliente envía el formulario:

1. La API valida nombre, correo, teléfono y descripción.
2. `cotizaciones@tu-dominio.com` recibe todos los datos.
3. El cliente recibe una confirmación desde `hola@tu-dominio.com` en español o inglés.
4. El botón Responder del correo interno se dirige al correo del cliente.

## Nota sobre el panel administrativo

El contenido se guarda en `server/data/content.json`. Antes de cada nuevo despliegue conviene descargar una copia desde el servidor, ya que algunos entornos administrados reconstruyen el sistema de archivos al publicar una nueva versión. Para persistencia permanente entre despliegues, el siguiente paso recomendado es mover este contenido a una base de datos.
