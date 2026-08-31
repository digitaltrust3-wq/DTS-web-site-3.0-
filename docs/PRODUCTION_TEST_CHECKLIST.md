# Website DTS 3.0 — Checklist de pruebas de producción

Fecha objetivo: 31 de agosto de 2026  
Zona horaria: America/Bogota  
Regla de publicación: no desplegar una nueva versión hasta completar todos los controles.

## 1. Preflight de solo lectura

Ejecutar:

```powershell
npm run release:check
```

El comando compila el sitio, ejecuta la auditoría de dependencias y termina con el smoke test remoto. También puede ejecutarse únicamente la parte remota con `npm run smoke:production`.

Debe aprobar:

- Página pública y política de privacidad con HTTP 200.
- API `/api/health` con estado `ok`.
- Supabase, Google Calendar y SMTP configurados y accesibles.
- Disponibilidad en `America/Bogota` entre las 08:00 y las 21:00.
- Cabeceras CSP y HSTS presentes.

Este comando no crea contactos, reservas ni eventos.

## 2. Validaciones locales

```powershell
npm run build
npm audit --omit=dev --audit-level=high
npm run check:deployment
```

## 3. Pruebas controladas de escritura

Solo después de aprobar el preflight:

1. Enviar un formulario de contacto de prueba.
2. Confirmar el registro en `leads` de Supabase.
3. Confirmar la notificación interna y el correo del cliente.
4. Crear una reserva de prueba en un horario disponible.
5. Confirmar el registro `appointment` con estado `confirmed`.
6. Confirmar el evento de Google Calendar y el enlace de Meet.
7. Confirmar la invitación recibida por el asistente.
8. Eliminar el evento, la cita y el lead de prueba.
9. Repetir el envío con el mismo identificador para comprobar idempotencia.
10. Intentar reservar el mismo horario y comprobar que se rechaza el duplicado.

## 4. Experiencia y dispositivos

- Desktop: Chrome, Edge y Firefox.
- Móvil: Android y iPhone, usando datos móviles además de Wi-Fi.
- Idiomas: español e inglés completos.
- Formularios: teclado, validación, cierre, scroll y mensajes de error.
- Accesibilidad: navegación por teclado, foco visible y reducción de movimiento.
- Rendimiento: reproducción del video, imágenes responsivas y carga inicial.

## 5. Seguridad

- CSP, HSTS, `nosniff`, protección contra iframes y política de permisos.
- Solicitudes de origen no autorizado rechazadas.
- Payload superior a 64 KB rechazado.
- Honeypot y consentimiento obligatorio verificados.
- Login administrativo limitado y cookie segura.
- No deben aparecer secretos ni datos personales en logs o bundle del navegador.

## 6. Criterio de salida

Publicar únicamente cuando:

- Todos los servicios de `/api/ready?deep=1` estén configurados y accesibles.
- Contacto y reserva funcionen de extremo a extremo.
- Las pruebas móviles y de seguridad no tengan bloqueos críticos.
- Los datos de prueba hayan sido eliminados.
- Exista una persona responsable de aprobar el despliegue.
