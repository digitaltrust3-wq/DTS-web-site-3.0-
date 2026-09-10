# Auditoría técnica — Digital Trust Solutions (Website DTS 3.0)

Fecha: 10 de septiembre de 2026
Alcance: repositorio `digitaltrust3-wq/DTS-web-site-3.0-` (rama `main`, commit `1d7656b`)
Método: revisión de código fuente, historial de git completo, configuración de despliegue (Vercel/Hostinger/GitHub Pages), migraciones de Supabase y documentación del propio proyecto.

> Nota de cumplimiento: `AGENTS.md` (no versionado, ver hallazgo H-6) indica que ningún agente debe hacer `git push`, desplegar ni publicar cambios sin autorización expresa del propietario. Este informe es de solo lectura; ninguna acción "importante" se ha ejecutado. Los cambios de código que se sugieren abajo están listos para aplicarse pero **no se han aplicado ni subido** — quedan a la espera de tu aprobación.

## Resumen ejecutivo

El proyecto está considerablemente mejor construido que la mayoría de sitios de este tamaño: cabeceras de seguridad completas, sesión de administrador firmada con HMAC y comparación en tiempo constante, verificación de firma en el webhook de WhatsApp, RLS habilitado en Supabase con `service_role` separado del rol anónimo, honeypot y validación de tiempo mínimo en formularios, saneamiento HTML en todos los correos salientes, y ningún secreto real ha llegado nunca al historial de git (solo se versionan los `.env.*.example`). Dependabot y un workflow de auditoría (`npm audit --omit=dev`) ya están configurados.

Los puntos que sí requieren atención antes de producción son, en su mayoría, de bajo esfuerzo: dependencias sin usar, dos scripts de npm documentados pero inexistentes, dos archivos de proceso que existen en tu máquina pero nunca se subieron a git, y una posible incompatibilidad entre la política CSP y el video de fondo externo que conviene verificar en un build real.

## 1. Dependencias a eliminar

Se buscó cada paquete en todo el código fuente (`src/`, `server/`, `api/`) y solo aparecen referenciados en `package.json` / `package-lock.json` — ninguna importación real los usa:

| Paquete | Motivo |
|---|---|
| `@react-three/fiber`, `@react-three/drei`, `three` | Pertenecen a un proyecto 3D aparte ("perrito robot") que vive en `animaciones/robot-dog-3d/index.html`. Ese HTML ni siquiera apunta a este repo: carga un script desde una ruta absoluta de tu disco (`C:/Users/germa/.../Desarrollos/Animations/robot-dog-3d/...`), fuera de esta carpeta. No forma parte del build de Vite (no está enlazado desde `index.html` ni desde `src/`). |
| `gsap`, `motion` | Ninguna sección usa animaciones de gsap ni de `motion`/framer-motion. Las transiciones actuales se hacen con CSS y `IntersectionObserver` puro (ver `FixedVideoBackground.tsx`). |
| `hls.js` | El video de fondo se reproduce con la etiqueta `<video>` nativa; no hay streaming HLS en ningún componente. |

Impacto de dejarlos: no afectan el bundle del navegador (Vite hace tree-shaking de lo no importado), pero sí se instalan igual en cada build de Vercel/Hostinger, aumentando el tamaño de `node_modules`, el tiempo de instalación y la superficie de cadena de suministro (más paquetes de terceros con permiso implícito de ejecutar código en tu build).

Cambio sugerido en `package.json` → `dependencies`:

```diff
- "@react-three/drei": "^9.122.0",
- "@react-three/fiber": "^8.18.0",
  "class-variance-authority": "0.7.1",
  "clsx": "2.1.1",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
- "gsap": "^3.15.0",
- "hls.js": "^1.6.16",
  "lucide-react": "0.487.0",
- "motion": "^12.42.2",
  "nodemailer": "^9.0.3",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "tailwind-merge": "3.2.0",
- "three": "^0.185.1"
+ "tailwind-merge": "3.2.0"
```

Después de editar, regenera el lockfile localmente (no pude ejecutar `npm install` desde aquí porque este entorno no tiene salida a `registry.npmjs.org`):

```powershell
npm install
npm run build   # confirma que nada se rompe
git add package.json package-lock.json
git commit -m "chore: remove unused three.js/gsap/motion/hls.js dependencies"
```

El resto de dependencias (`@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `express`, `nodemailer`, `dotenv`) sí están en uso y coinciden con versiones vigentes o razonablemente recientes.

## 2. Hallazgos de seguridad y configuración

### H-1 (Verificar antes de producción) — CSP puede bloquear el video de fondo externo
`vercel.json` y `server/lib/security.mjs` aplican `Content-Security-Policy` con `default-src 'self'` y **sin** directiva `media-src`. Los navegadores usan `default-src` como respaldo para `media-src` cuando no está declarada explícitamente. El video del hero en escritorio (`App.tsx`) apunta a un dominio externo:

```
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZ.../hf_....mp4
```

Con la política actual, ese origen no está permitido y el navegador debería bloquear la carga del `<video src>` en desktop (las variantes móviles sí son locales y no se ven afectadas). Recomendación: agregar explícitamente ese origen a `media-src` (o mejor, migrar el video a tu propio CDN/`public/assets/video/` como ya haces con las variantes móviles, para no depender de una cuenta de terceros) y luego **probar el build de producción real en el navegador**, no solo `npm run dev`, porque el dev server de Vite no aplica esta CSP.

```diff
"Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; upgrade-insecure-requests"
+ "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; media-src 'self' https://d8j0ntlcm91z4.cloudfront.net; connect-src 'self'; upgrade-insecure-requests"
```
(Cámbialo en los dos lugares: `vercel.json` y `server/lib/security.mjs`.)

### H-2 (Medio) — Rate limiting y bloqueo de intentos de login viven en memoria del proceso
`createRateLimiter`, `loginAttempts`, `bookingRequests` y `processedMessages` (WhatsApp) son `Map()` en memoria. En Vercel (funciones serverless con múltiples instancias frías) esto significa que el límite de 5 intentos de login o de 6 reservas/10 min se aplica **por instancia**, no de forma global — un atacante que llegue a instancias distintas puede evadir el límite. Ya lo documentan ustedes mismos en `docs/VERCEL_DEPLOYMENT.md` ("Rate limiting defensivo por instancia... el siguiente control recomendado es Cloudflare Turnstile"), así que no es una sorpresa, pero conviene priorizarlo antes de producción si el panel de administración va a estar expuesto públicamente: añadir Turnstile/hCaptcha en el login y considerar un contador compartido (Upstash Redis, Vercel KV o la propia tabla `leads`/`appointments` de Supabase) para el límite de intentos de login.

Adicional: ninguno de esos `Map` purga entradas cuyo `resetAt` ya pasó si esa clave no vuelve a pedir — en un despliegue de larga duración (Hostinger, proceso Node persistente) esto es una fuga de memoria lenta. Es de bajo riesgo con el tráfico esperado, pero es fácil de corregir con un `setInterval` de limpieza o una librería como `lru-cache`.

### H-3 (Medio) — No hay verificación de tipos de TypeScript en el build
No existe `tsconfig.json` en el repo. Vite/esbuild compila los `.tsx` eliminando los tipos sin comprobarlos — un error de tipos no rompe `npm run build`, solo se vería en el editor si tienes tipado activado. Recomendación: agregar `tsconfig.json` y un script `"typecheck": "tsc --noEmit"`, e incluirlo en CI (`.github/workflows/deploy-pages.yml`) y en el `release:check` sugerido en H-5.

### H-4 (Bajo) — Node.js 22 está en Maintenance LTS, no en Active LTS
`package.json` fija `"engines": { "node": "22.x" }` y toda la documentación de despliegue especifica Node 22. Según el calendario oficial, Node 22 pasó a *Maintenance LTS* y Node 24 es la *Active LTS* actual (soporte de Node 22 continúa con parches de seguridad hasta abril de 2027, así que no es urgente, pero conviene planificar la migración a 24.x en los próximos meses). ([endoflife.ai](https://endoflife.ai/article-nodejs-eol))

### H-5 (Bajo, pero rompe vuestro propio checklist) — Scripts de npm documentados que no existen
`docs/PRODUCTION_TEST_CHECKLIST.md` (ver H-6, tampoco está en git) instruye a ejecutar:

```powershell
npm run release:check
npm run smoke:production
```

Ninguno de los dos existe en `package.json` — solo están definidos `build`, `dev`, `dev:web`, `dev:api`, `start`, `check:deployment`, `verify:email`, `google:calendar:connect`. Sí existe el archivo `server/scripts/smoke-production.mjs`, simplemente no tiene un script de npm que lo invoque. Sugerido:

```json
"smoke:production": "node server/scripts/smoke-production.mjs",
"release:check": "npm run build && npm audit --omit=dev --audit-level=high && npm run smoke:production"
```

### H-6 (Medio) — `AGENTS.md` y `docs/PRODUCTION_TEST_CHECKLIST.md` no están versionados
Ambos archivos existen en tu carpeta local pero `git ls-files` confirma que nunca se han añadido al repositorio (no están excluidos por `.gitignore`; simplemente no se hizo `git add`). Esto es justo lo contrario de lo que uno querría: son las reglas de colaboración con IA y el checklist de salida a producción — el tipo de documento que más falta hace si alguien clona el repo en otra máquina o si cambias de equipo. Sugerencia: `git add AGENTS.md docs/PRODUCTION_TEST_CHECKLIST.md && git commit`.

### H-7 (Muy bajo) — `public/manifest.json` sin íconos
`"icons": []`. La app ya tiene `assets/brand/brand-mark.svg` y `assets/brand/social-preview-logo.png`; añadir esas rutas (idealmente también un PNG 192×192 y 512×512) evita que Lighthouse marque el sitio como "no instalable" como PWA.

### Cosas que revisé específicamente y están **bien**
- **Secretos:** revisé el historial completo de git (`git log --all --full-history`) para `.env` y variantes — el archivo real `.env` nunca se ha commiteado, solo los `.env*.example` con placeholders. El `.gitignore` cubre `.env`, `.env.*` (con excepción explícita de los `.example`) y `server/data/content.json`.
- **CSRF:** mitigado por verificación de `Origin` en todas las rutas no seguras de `/api` + cookies `SameSite=Strict`.
- **Sesión de admin:** HMAC-SHA256 con `crypto.timingSafeEqual`, cookie `HttpOnly`, `Secure` en producción, expiración de 8 h.
- **RLS de Supabase:** `leads`, `appointments`, `google_reviews`, `managed_site_content` tienen RLS habilitado y revocado el acceso a `anon`/`authenticated`; solo `service_role` (usado únicamente en el servidor) tiene acceso.
- **WhatsApp:** el webhook valida `x-hub-signature-256` con HMAC y comparación en tiempo constante antes de procesar cualquier mensaje.
- **Correo saliente:** todos los campos de usuario (nombre, email, teléfono, mensaje) pasan por `escapeHtml()` antes de insertarse en el HTML del correo — no hay inyección de HTML en los correos.
- **Formularios:** honeypot (`website`), tiempo mínimo de llenado, límites de longitud, `Idempotency-Key` en reservas para evitar dobles bookings.

## 3. Checklist priorizado para producción

1. Verificar en un build de producción real (no `npm run dev`) que el video del hero carga con la CSP activa; ajustar `media-src` si hace falta (H-1).
2. Eliminar las 6 dependencias sin usar y regenerar el lockfile (sección 1).
3. Añadir `release:check` / `smoke:production` a `package.json` para que el checklist de pruebas (`docs/PRODUCTION_TEST_CHECKLIST.md`) sea ejecutable tal cual está escrito (H-5).
4. Commitear `AGENTS.md` y `docs/PRODUCTION_TEST_CHECKLIST.md` (H-6).
5. Ejecutar el checklist existente de principio a fin: `docs/PRODUCTION_TEST_CHECKLIST.md` ya cubre reserva de prueba, verificación de Supabase/Calendar/SMTP, pruebas móviles y de seguridad — es un buen checklist, solo falta poder correrlo con los scripts de npm (punto 3).
5. Añadir Cloudflare Turnstile (o similar) al formulario de login de admin y considerar un backend compartido (Redis/Upstash/Supabase) para el rate limiting en Vercel (H-2).
6. Agregar `tsconfig.json` + `tsc --noEmit` al pipeline de CI (H-3).
7. Completar `public/manifest.json` con íconos reales (H-7).
8. Planificar (sin urgencia) la migración de Node 22 → 24 (H-4).

## 4. Lo que NO se tocó en esta auditoría
Por instrucción de `AGENTS.md`, no se ejecutó ningún `git push`, no se desplegó nada, no se modificaron credenciales ni servicios externos (Supabase, Google, Vercel, Hostinger, WhatsApp). Todo lo anterior son recomendaciones para que las apliques o me autorices a aplicar.
