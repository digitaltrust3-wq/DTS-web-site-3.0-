# Digital Trust Solutions

Sitio web bilingüe de Digital Trust Solutions, construido con React, Vite y Tailwind CSS. Incluye un formulario de contacto, enlaces a WhatsApp y una base para automatizar respuestas mediante la API oficial de WhatsApp Cloud.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Desarrollo local

```bash
npm install
npm run dev
```

El comando `npm run dev` inicia el sitio de Vite y el servidor local de la API. Para ejecutar solamente el sitio usa `npm run dev:web`; para ejecutar solamente la API usa `npm run dev:api`.

## Compilación y producción

```bash
npm run build
npm start
```

La compilación estática se genera en `dist/`. GitHub Pages puede publicar esa carpeta, pero las funciones del servidor —correo y automatización de WhatsApp— necesitan un servicio compatible con Node.js.

## Variables de entorno

1. Copia `.env.example` como `.env`.
2. Completa las credenciales de correo, WhatsApp y OpenAI que vayas a utilizar.
3. Nunca publiques el archivo `.env` ni credenciales reales en Git.

## Organización

```text
public/
  assets/
    brand/       Recursos de identidad visual
    services/    Imágenes de las tarjetas de servicios
src/
  app/
    components/
      layout/    Navegación y pie de página
      sections/  Secciones principales del sitio
      shared/    Componentes reutilizables
    data/        Contenido estructurado
    i18n/        Traducciones y selector de idioma
    lib/         Utilidades compartidas
  styles/        Estilos globales y tema
server/
  whatsapp/      Webhook, conocimiento y lógica del bot
docs/            Documentación y atribuciones
```

## Comandos disponibles

- `npm run dev`: sitio y API en modo desarrollo.
- `npm run dev:web`: solo Vite.
- `npm run dev:api`: solo el servidor Node.js.
- `npm run build`: genera la versión optimizada del sitio.
- `npm start`: sirve la compilación y habilita la API.
