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

### Pendiente (del mismo informe)

- Rate limiting compartido entre instancias de Vercel (Turnstile/hCaptcha + Redis/Upstash/Vercel KV) — H-2.
- Migración Node 22 → 24 — H-4, sin urgencia (soporte de Node 22 hasta abril 2027).
