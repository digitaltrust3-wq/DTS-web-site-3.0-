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

Commit: `159a4a2`

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

## 2026-09-10 (6) — Rediseño de la sección "Proyectos destacados" como demo visual

Commit: `06757f6`

Reemplazado el carrusel de proyectos reales (con fotos de stock y URLs falsas como
`react.dev`/`vite.dev`) por dos bloques de demostración de capacidades, sin backend ni
integraciones reales — tal como se pidió:

- **Galería de 10 sitios web** ([websiteShowcase.ts](src/app/data/websiteShowcase.ts) +
  [WebsiteMockupCard.tsx](src/app/components/shared/WebsiteMockupCard.tsx) +
  [WebsiteGallery.tsx](src/app/components/sections/WebsiteGallery.tsx)): veterinaria,
  restaurante, cafetería, consultorio médico, tienda de ropa, constructora, barbería,
  servicios profesionales, paneles solares y comercio local. Cada una es una maqueta de
  navegador (chrome falso + nav + hero + servicios) construida solo con CSS/gradientes e
  íconos — sin fotos externas, así que nada puede romperse por un enlace de imagen caído.
  Carrusel horizontal con scroll-snap, flechas, y modal de vista ampliada.
- **Diagrama de arquitectura de agentes de IA**
  ([AgentNetwork.tsx](src/app/components/sections/AgentNetwork.tsx)): orquestador central
  + 10 agentes especializados (atención, ventas, soporte, datos, CRM, correo, WhatsApp,
  conocimiento, automatización, monitoreo) + 8 chips de sistemas externos (CRM, base de
  datos, APIs, email, WhatsApp, sistemas internos, base de conocimiento, automatizaciones),
  todo posicionado por trigonometría (no coordenadas fijas a mano) sobre un SVG. Líneas de
  conexión con animación de flujo sutil vía CSS (respeta `prefers-reduced-motion`), sin JS
  en el loop de animación.
- `Portfolio.tsx`, `portfolioSites.ts` y el editor de "Proyectos" del panel admin quedan
  intactos pero sin usar en la página pública — si más adelante quieren mostrar
  proyectos reales, ya está todo listo para reactivarlo.
- Ambas secciones tienen su propio diccionario de textos ES/EN (no pasan por
  `translations.ts` ni por el CMS de `content.json`), así que no hay riesgo de que el
  panel de administración las sobreescriba ni de que quede contenido inconsistente.
- Verificado visualmente en escritorio y móvil (viewport 375px): en móvil las etiquetas de
  los nodos del diagrama se ocultan automáticamente para no saturar la pantalla. `npm run
  typecheck` y `npm run build` pasan limpio.

## 2026-09-10 (7) — Maquetas más elaboradas + carrusel con movimiento restaurado

Commit: `41f1c44`

Ajuste pedido tras ver el resultado anterior: las maquetas debían verse como páginas
totalmente terminadas, y el carrusel debía moverse igual que el original (efecto de
rueda 3D + auto-scroll al pasar el mouse por los bordes).

- **Maquetas más completas** ([websiteShowcase.ts](src/app/data/websiteShowcase.ts) +
  [WebsiteMockupCard.tsx](src/app/components/shared/WebsiteMockupCard.tsx)): cada una de
  las 10 ahora incluye, además de nav/hero/servicios: descripciones por servicio (no solo
  una palabra), una fila de 2 estadísticas (ej. "5,000+ Mascotas atendidas"), un testimonio
  de cliente con cita y autor, y un pie de página con marca, tagline y redes sociales.
  Sigue sin usar imágenes externas — todo es CSS/gradientes/íconos.
- **Movimiento del carrusel restaurado** ([WebsiteGallery.tsx](src/app/components/sections/WebsiteGallery.tsx)):
  se portó el motor completo del carrusel original de `Portfolio.tsx` — loop infinito
  (tripla el arreglo), zonas de movimiento en los bordes, aceleración según posición del
  mouse, autoplay en móvil que pausa al tocar y retoma a los 2.4s, y el efecto de rueda 3D
  (`perspective` + `rotateY` + `translateY` + `scale` vía variables CSS) aplicado ahora a
  `.mockup-slide`. Respeta `prefers-reduced-motion` igual que antes.
- Verificado en el navegador: el carrusel se mueve solo al pasar el mouse por los bordes
  (igual que el original), el modal de vista ampliada muestra la maqueta completa con
  estadísticas/testimonio/footer, y todo compila limpio (`npm run typecheck`,
  `npm run build`).

## 2026-09-10 (8) — Rediseño de las páginas de vista previa (3 plantillas reales)

Pedido explícito: la vista ampliada ("página de visualización") es donde se va a
concentrar toda la atención, así que necesitaba diseños más innovadores. Se investigaron
tres sitios reales que el usuario compartió como referencia de estilo (una cafetería,
una clínica veterinaria y una constructora) — **solo como inspiración de estructura y
lenguaje visual, no para clonarlos**: colores, íconos, textos y marca siguen siendo
propios de cada maqueta de DTS.

- **Nuevo componente** [WebsitePreviewPage.tsx](src/app/components/shared/WebsitePreviewPage.tsx)
  con 3 plantillas claramente distintas, cada una asignada a las 10 maquetas según el
  tipo de negocio:
  - **`retail`** (cafetería, tienda de ropa, paneles solares, comercio local): barra de
    anuncio superior, nav centrado, hero a dos columnas con una tarjeta de producto
    inclinada y una insignia flotante, grid de 3 tarjetas de servicio, testimonio con
    estrellas — inspirado en el patrón de e-commerce cálido de una cafetería real.
  - **`service`** (veterinaria, consultorio médico, barbería): breadcrumb, insignia de
    urgencia/reserva, fila de íconos circulares por servicio, línea de dirección/horario,
    y una barra de doble acción al final (llamar + agendar) — inspirado en el patrón de
    una clínica veterinaria real con atención 24/7.
  - **`editorial`** (restaurante, constructora, servicios profesionales): foto de fondo +
    tarjeta blanca superpuesta con titular en negrita y una palabra resaltada en el color
    de marca, lista de servicios numerada, insignia de confianza, estadísticas grandes —
    inspirado en el patrón editorial de una constructora real.
- [websiteShowcase.ts](src/app/data/websiteShowcase.ts): se agregó `layout` (qué plantilla
  usa cada negocio) y `badge` (texto corto de urgencia/promoción, ES/EN) a las 10 maquetas.
- La tarjeta pequeña del carrusel ([WebsiteMockupCard.tsx](src/app/components/shared/WebsiteMockupCard.tsx))
  no cambió — sigue siendo el teaser oscuro; el rediseño aplica específicamente a la vista
  ampliada, que es donde el usuario pidió concentrar el trabajo.
- Verificado visualmente en escritorio y móvil las tres plantillas (cafetería, veterinaria,
  constructora); ajuste de responsive en el nav para pantallas muy angostas.
  `npm run typecheck` y `npm run build` pasan limpio.
