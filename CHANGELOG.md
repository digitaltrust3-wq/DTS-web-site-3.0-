# Changelog

Registro de cambios de mantenimiento y corrección de código del proyecto.
Formato: fecha, qué se hizo, por qué, y el commit asociado (si existe).

No incluye el historial completo de features del sitio (eso está en `git log`) —
es el rastro de la revisión y limpieza de código en curso.

## 2026-09-09/10

Origen: [`Claude outputs/AUDIT_REPORT_DTS_web_2026-09-10.md`](Claude%20outputs/AUDIT_REPORT_DTS_web_2026-09-10.md)
(auditoría técnica completa: seguridad, dependencias, configuración de despliegue).

- **Lockfile sincronizado y vulnerabilidades corregidas** — `npm install` regeneró
  `package-lock.json` (quitó 81 paquetes transitivos de `three`/`gsap`/`motion`/`hls.js`,
  ya removidos de `package.json` en un commit previo pero nunca re-lockeados).
  `npm audit fix` cerró 2 vulnerabilidades (nodemailer alta severidad, `qs` moderada).
  0 vulnerabilidades restantes.
  Commit: `1ca89e8`
- **Typecheck agregado al pipeline** — se creó `tsconfig.json` (strict, con
  `types: ["vite/client"]` para que `import.meta.env` tipe bien) y el script
  `npm run typecheck`. Verificado: pasa limpio junto con `npm run build`.
  Commit: `05ffb31`
- **CSP no bloqueaba el video del hero** — faltaba `media-src` en la Content-Security-Policy
  (`vercel.json` y `server/lib/security.mjs`), lo que podía bloquear el video servido
  desde `d8j0ntlcm91z4.cloudfront.net` en escritorio. Se agregó el origen explícitamente.
  De paso, `createRateLimiter` ahora purga entradas vencidas del `Map` en memoria
  (evita fuga de memoria lenta en el proceso persistente de Hostinger).
  Commit: `40e9395`
- **Manifest sin íconos** — `public/manifest.json` tenía `"icons": []`, lo que hace que
  Lighthouse marque el sitio como no instalable como PWA. Se agregaron `brand-mark.svg`
  y `social-preview-logo.png`.
  Commit: `bc5c408`
- **`AGENTS.md` versionado** — las reglas de colaboración con IA (sin `git push`/deploy sin
  autorización explícita) existían solo en local y nunca se habían comiteado.
  Commit: `dd2983d`

Con esto se cerró todo el checklist del informe original.

## 2026-09-10 (4) — Asistente de IA conectado al sitio web

Commit: `a0cf77f`

Objetivo: que todos los botones de "contáctanos/cotizar/hablemos" del sitio abran una
conversación con el agente de IA en vez del formulario de contacto estático. El formulario
de agenda de reunión (Google Meet) se mantiene aparte, sin cambios.

- **Agente compartido**: se movió la lógica del bot (`server/whatsapp/bot.mjs` +
  `knowledge.mjs`) a `server/assistant/` para que WhatsApp y el chat del sitio web usen
  exactamente el mismo conocimiento de la empresa y las mismas reglas (no inventar precios,
  escalar a humano, límites de seguridad). `server/whatsapp/webhook.mjs` solo actualizó su import.
- **Nuevo endpoint** [`POST /api/chat`](server/chat.mjs): valida sesión/mensaje, aplica rate
  limiting (20 msj/5 min por IP, mismo store compartido de H-2) y llama al agente.
- **Nuevo widget de chat** ([ChatWidget.tsx](src/app/components/shared/ChatWidget.tsx) +
  [ChatContext.tsx](src/app/chat/ChatContext.tsx)): un modal de conversación montado una sola
  vez en la app. Persiste la conversación en `localStorage` (por navegador, no por servidor).
  Cuando un botón lo abre con un mensaje contextual, lo envía automáticamente si es una
  conversación nueva, o solo lo precarga en el campo de texto si ya hay una charla en curso
  (para no interrumpirla).
- **Botones reconectados**: Hero ("Iniciar proyecto"), Navbar ("Contáctanos"), Footer
  ("Contáctanos"), CTA ("Contáctanos") y cada tarjeta de Servicios ("Consultar este
  servicio", con un mensaje contextual por servicio, ej. "quiero más información sobre
  Agentes de IA empresariales"). El componente `ContactModal.tsx` y su endpoint
  `/api/contact` (con Supabase + email) se dejaron intactos pero sin usar por ahora —
  disponibles si se quiere un flujo híbrido más adelante.
- **Sin `OPENAI_API_KEY` configurada** (el caso actual): el asistente responde con
  respuestas predefinidas por palabra clave, igual que WhatsApp hoy. En cuanto se agregue
  la clave a `.env`/Vercel/Hostinger, ambos canales pasan a generar respuestas reales con
  el modelo configurado, sin tocar código.
- **Bug de infraestructura descubierto y corregido de paso**: `vite.config.ts` no restringía
  qué archivos escanea el optimizador de dependencias de Vite en modo `dev`, así que
  también rastreaba `animaciones/robot-dog-3d/index.html` (un demo huérfano que carga un
  proyecto 3D externo vía ruta absoluta, ya señalado como no usado en la auditoría). Al
  haber quitado `three`/`gsap`/`@react-three/*` de `package.json` en la limpieza de
  dependencias, esa ruta dejó de resolver y rompía el dev server con errores de React
  duplicado. Se acotó `optimizeDeps.entries` a los archivos reales del proyecto.
- Verificado manualmente en el navegador: auto-envío del mensaje contextual, envío manual,
  detección de idioma (ES/EN), i18n completo del widget, persistencia de la conversación,
  handoff a especialista, validaciones del backend (sesión inválida, mensaje vacío) y
  rate limiting (bloqueó correctamente a partir de la solicitud 21). `npm run typecheck`
  y `npm run build` pasan limpio.

## 2026-09-10 (2)

Commit: `f402ef3`

- **H-2 — Rate limiting compartido + Turnstile en login de admin.** Ambas piezas son
  opt-in por variables de entorno; sin configurarlas, el comportamiento es idéntico
  al de antes (fallback automático).
  - [`server/lib/rateStore.mjs`](server/lib/rateStore.mjs) (nuevo): contador compartido vía
    Upstash Redis REST API (`UPSTASH_REDIS_REST_URL`/`TOKEN`) cuando está configurado;
    si no, cae al `Map` en memoria de antes. `createRateLimiter` (contacto, disponibilidad,
    reservas) y el limitador de intentos de login de `server/admin.mjs` ahora usan este store.
  - [`server/lib/turnstile.mjs`](server/lib/turnstile.mjs) (nuevo): verificación server-side
    de Cloudflare Turnstile, activa solo si `TURNSTILE_SECRET_KEY` está seteada.
  - [`src/app/admin/AdminPage.tsx`](src/app/admin/AdminPage.tsx): widget de Turnstile en el
    formulario de login, renderizado solo si `VITE_TURNSTILE_SITE_KEY` está definida.
  - CSP (`vercel.json` y `server/lib/security.mjs`): se agregó `challenges.cloudflare.com`
    a `script-src`, `frame-src` y `connect-src` para permitir el widget.
  - `.env.example` / `.env.vercel.example`: documentadas las 4 variables nuevas, todas opcionales.
  - Verificado: `npm run typecheck`, `npm run build` y prueba unitaria aislada del store en
    memoria (increment/peek/reset) pasan limpio.
  - Fuera de alcance de este cambio (quedan igual que antes, son mapas de deduplicación,
    no de rate limiting): `bookingRequests` en `server/scheduling.mjs` y el caché de
    mensajes procesados de WhatsApp.

## 2026-09-10 (3)

Commit: `a1de19d`

- **H-4 — Migración Node 22 → 24.** Verificado antes de migrar: Vercel soporta 24.x (y
  ya es su default) y Hostinger también ofrece 24.x en hPanel — no había riesgo de
  romper ninguno de los dos despliegues.
  - `package.json`: `engines.node` → `24.x`, `@types/node` → `^24.13.4`.
  - `.github/workflows/deploy-pages.yml`: `node-version: 24`.
  - `docs/HOSTINGER_DEPLOYMENT.md` y `docs/VERCEL_DEPLOYMENT.md`: instrucciones actualizadas.
  - `package-lock.json` regenerado con `npm install` (ya no hay warning `EBADENGINE`,
    porque el entorno local ya corre Node 24.17.0). 0 vulnerabilidades.
  - Verificado: `npm run typecheck` y `npm run build` pasan limpio.

## 2026-09-10 (5) — Copy de las 6 tarjetas de Servicios

- Reescritas las 6 tarjetas de la sección Servicios (título, texto corto, texto largo) en
  [translations.ts](src/app/i18n/translations.ts) y [services.json](src/app/data/services.json), en
  inglés y español. Cada tarjeta ahora vende un resultado distinto para el cliente en vez de
  repetir "IA/inteligente" en casi todos los títulos (antes 5/6 títulos lo hacían, ahora 3/6).
- **Hallazgo importante durante la verificación**: el sitio tiene un panel de administración
  (`/admin`) que guarda una copia editable de TODO el contenido en `server/data/content.json`
  (local, fuera de git) o en Supabase (producción). Esa copia **sobreescribe en tiempo real**
  lo que está en `translations.ts` — por eso el cambio no se veía reflejado al probarlo en el
  navegador hasta que también actualicé `content.json` con el mismo texto nuevo.
  **Importante**: si ya se usó el panel de admin en producción (con Supabase configurado), ese
  contenido vive aparte y este cambio de código no lo toca — habría que volver a guardarlo
  desde `/admin` o migrar el texto a Supabase directamente.
- Verificado visualmente en el navegador (build de producción con `vite preview` + servidor
  del panel de admin corriendo), en inglés y español, con capturas confirmando los títulos y
  las descripciones nuevas. `npm run typecheck` y `npm run build` pasan limpio.
