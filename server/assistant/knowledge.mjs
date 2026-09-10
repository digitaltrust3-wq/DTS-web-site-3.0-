export const companyKnowledge = `
Digital Trust Solutions diseña y desarrolla productos digitales seguros para empresas.

Servicios principales:
- Desarrollo de software a medida: plataformas web, portales internos, automatización y modernización de sistemas.
- Aplicaciones móviles: diseño y desarrollo para iOS y Android.
- Soluciones en la nube: arquitectura, migración, automatización, observabilidad y escalabilidad.
- Analítica de datos: integración de fuentes, paneles, indicadores y analítica predictiva.
- Ciberseguridad: evaluación de riesgos, controles de acceso y seguridad durante el ciclo de desarrollo.
- Integración de API: conexión confiable entre sistemas, monitoreo y recuperación ante errores.

Forma de trabajo:
- Primero se entienden el objetivo, los usuarios, el alcance, las integraciones y el plazo esperado.
- La propuesta, el precio y el calendario dependen del alcance. El bot nunca debe inventarlos.
- Se puede solicitar una conversación con un especialista para revisar el proyecto.
- La atención está disponible en español e inglés.

Datos que conviene solicitar para calificar un proyecto:
- Nombre y empresa.
- Problema que desea resolver.
- Tipo de solución requerida.
- Sistemas que se deben integrar.
- Plazo aproximado.
- Presupuesto aproximado, solo si el cliente desea compartirlo.

Límites:
- No prometer precios, fechas, garantías contractuales ni resultados que no estén confirmados.
- No solicitar contraseñas, números de tarjeta, códigos de autenticación ni información sensible.
- Para pagos, contratos, incidentes de seguridad o solicitudes legales, transferir a una persona.
`.trim();

export const quickAnswers = [
  {
    keywords: ["precio", "precios", "costo", "costos", "cotización", "presupuesto", "price", "cost", "quote"],
    es: "El costo depende del alcance, las integraciones y el plazo. Cuéntame qué necesitas construir y te ayudaré a preparar la información para una cotización.",
    en: "Pricing depends on scope, integrations and timeline. Tell me what you need to build and I will help prepare the information for a quote.",
  },
  {
    keywords: ["móvil", "movil", "app", "android", "ios", "mobile"],
    es: "Desarrollamos aplicaciones para iOS y Android, desde la definición del producto hasta su publicación. ¿Qué problema resolverá tu aplicación?",
    en: "We build iOS and Android applications from product definition through release. What problem should your app solve?",
  },
  {
    keywords: ["nube", "cloud", "aws", "azure", "migración", "migracion"],
    es: "Podemos diseñar, migrar y optimizar infraestructura en la nube, con automatización y monitoreo. ¿Ya utilizas algún proveedor de nube?",
    en: "We can design, migrate and optimize cloud infrastructure with automation and monitoring. Are you already using a cloud provider?",
  },
  {
    keywords: ["seguridad", "ciberseguridad", "security", "riesgo", "vulnerabilidad"],
    es: "Ayudamos a evaluar riesgos y fortalecer accesos, aplicaciones e infraestructura. Si existe un incidente activo, solicitaré que un especialista continúe la conversación.",
    en: "We help assess risk and strengthen access, applications and infrastructure. If there is an active incident, I will request a specialist to continue the conversation.",
  },
  {
    keywords: ["datos", "analítica", "analitica", "dashboard", "data", "analytics"],
    es: "Integramos fuentes de datos y creamos paneles e indicadores confiables. ¿Qué decisiones necesitas tomar con esos datos?",
    en: "We integrate data sources and build reliable dashboards and metrics. What decisions do you need those data to support?",
  },
  {
    keywords: ["api", "integración", "integracion", "integration", "conectar"],
    es: "Diseñamos integraciones de API con contratos claros, monitoreo y recuperación ante errores. ¿Qué sistemas necesitas conectar?",
    en: "We build API integrations with clear contracts, monitoring and recovery paths. Which systems do you need to connect?",
  },
];
