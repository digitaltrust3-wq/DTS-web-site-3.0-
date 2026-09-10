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
