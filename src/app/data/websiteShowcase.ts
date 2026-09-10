import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Coffee,
  HardHat,
  PawPrint,
  Scissors,
  Shirt,
  Store,
  Stethoscope,
  Sun,
  UtensilsCrossed,
} from "lucide-react";
import type { Language } from "../i18n/translations";

export type ShowcaseService = { title: string; description: string };
export type ShowcaseStat = { value: string; label: string };
export type ShowcaseTestimonial = { quote: string; author: string };

export type ShowcaseCopy = {
  business: string;
  category: string;
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
  nav: [string, string, string];
  services: [ShowcaseService, ShowcaseService, ShowcaseService];
  stats: [ShowcaseStat, ShowcaseStat];
  testimonial: ShowcaseTestimonial;
  footerTagline: string;
};

export type ShowcaseSite = {
  id: string;
  layout: "retail" | "service" | "editorial";
  icon: LucideIcon;
  /** CSS gradient used for the mock hero "photo" — no external images, so nothing to break. */
  gradient: string;
  accent: string;
  domain: string;
  copy: Record<Language, ShowcaseCopy>;
};

/**
 * Ten small-business website mockups used purely as a visual capability
 * showcase (see the portfolio/showcase section). None of these are real
 * clients or live sites — "domain" is a fictitious label for the mock
 * browser chrome, not a working link.
 */
export const websiteShowcase: ShowcaseSite[] = [
  {
    id: "veterinary",
    layout: "service",
    icon: PawPrint,
    gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #5eead4 100%)",
    accent: "#2dd4bf",
    domain: "clinicavetplus.com",
    copy: {
      es: {
        business: "Veterinaria",
        category: "Salud animal",
        badge: "Urgencias 24/7",
        headline: "Cuidamos a tu mascota como familia",
        subheadline: "Consultas, vacunación y cirugía con atención cercana.",
        cta: "Agendar cita",
        nav: ["Servicios", "Equipo", "Contacto"],
        services: [
          { title: "Consultas", description: "Chequeos generales y diagnóstico a tiempo." },
          { title: "Vacunación", description: "Esquemas completos para cada etapa de vida." },
          { title: "Cirugía", description: "Quirófano propio con monitoreo especializado." },
        ],
        stats: [
          { value: "5,000+", label: "Mascotas atendidas" },
          { value: "15", label: "Años de experiencia" },
        ],
        testimonial: { quote: "Atendieron a mi perro un domingo de emergencia. Nunca lo voy a olvidar.", author: "Camila R., cliente" },
        footerTagline: "Salud y bienestar animal, todos los días del año.",
      },
      en: {
        business: "Veterinary Clinic",
        category: "Animal health",
        badge: "24/7 emergency care",
        headline: "We care for your pet like family",
        subheadline: "Consultations, vaccines and surgery with close attention.",
        cta: "Book a visit",
        nav: ["Services", "Team", "Contact"],
        services: [
          { title: "Consultations", description: "General checkups and timely diagnosis." },
          { title: "Vaccines", description: "Full schedules for every stage of life." },
          { title: "Surgery", description: "In-house operating room with specialized monitoring." },
        ],
        stats: [
          { value: "5,000+", label: "Pets treated" },
          { value: "15", label: "Years of experience" },
        ],
        testimonial: { quote: "They treated my dog on an emergency Sunday. I'll never forget it.", author: "Camila R., client" },
        footerTagline: "Animal health and wellness, every day of the year.",
      },
    },
  },
  {
    id: "restaurant",
    layout: "editorial",
    icon: UtensilsCrossed,
    gradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #fb923c 100%)",
    accent: "#fb923c",
    domain: "sabordecasa.rest",
    copy: {
      es: {
        business: "Restaurante",
        category: "Gastronomía",
        badge: "Reservas abiertas",
        headline: "Sabores auténticos, todos los días",
        subheadline: "Reserva tu mesa y descubre el menú de temporada.",
        cta: "Ver menú",
        nav: ["Menú", "Reservas", "Ubicación"],
        services: [
          { title: "Almuerzo", description: "Menú ejecutivo servido en 20 minutos." },
          { title: "Cenas", description: "Ambiente íntimo con carta de temporada." },
          { title: "Eventos", description: "Espacios privados para hasta 40 personas." },
        ],
        stats: [
          { value: "20", label: "Años de tradición" },
          { value: "4.9★", label: "Calificación promedio" },
        ],
        testimonial: { quote: "El mejor lugar para celebrar en familia. Siempre volvemos.", author: "Andrés M., comensal" },
        footerTagline: "Cocina de casa, hecha con ingredientes locales.",
      },
      en: {
        business: "Restaurant",
        category: "Dining",
        badge: "Reservations open",
        headline: "Authentic flavors, every day",
        subheadline: "Reserve your table and discover the seasonal menu.",
        cta: "View menu",
        nav: ["Menu", "Reservations", "Location"],
        services: [
          { title: "Lunch", description: "Executive menu served in 20 minutes." },
          { title: "Dinner", description: "Intimate setting with a seasonal menu." },
          { title: "Events", description: "Private spaces for up to 40 guests." },
        ],
        stats: [
          { value: "20", label: "Years of tradition" },
          { value: "4.9★", label: "Average rating" },
        ],
        testimonial: { quote: "The best place to celebrate with family. We always come back.", author: "Andrés M., guest" },
        footerTagline: "Home cooking, made with local ingredients.",
      },
    },
  },
  {
    id: "cafe",
    layout: "retail",
    icon: Coffee,
    gradient: "linear-gradient(135deg, #451a03 0%, #92400e 55%, #d97706 100%)",
    accent: "#d97706",
    domain: "cafetostado.co",
    copy: {
      es: {
        business: "Cafetería",
        category: "Café de especialidad",
        badge: "Tueste de la semana",
        headline: "Tu pausa perfecta empieza aquí",
        subheadline: "Café de origen, repostería artesanal y buen ambiente.",
        cta: "Ver ubicaciones",
        nav: ["Menú", "Nosotros", "Locales"],
        services: [
          { title: "Café", description: "Granos de origen tostados cada semana." },
          { title: "Repostería", description: "Horneado fresco todas las mañanas." },
          { title: "Para llevar", description: "Pide en la app y recógelo sin filas." },
        ],
        stats: [
          { value: "8", label: "Locales en la ciudad" },
          { value: "12,000+", label: "Tazas al mes" },
        ],
        testimonial: { quote: "El latte con leche de avena es mi ritual de cada mañana.", author: "Sofía T., clienta habitual" },
        footerTagline: "Café de especialidad, tostado con propósito.",
      },
      en: {
        business: "Coffee Shop",
        category: "Specialty coffee",
        badge: "This week's roast",
        headline: "Your perfect break starts here",
        subheadline: "Single-origin coffee, fresh pastries and a great vibe.",
        cta: "Find a location",
        nav: ["Menu", "About", "Locations"],
        services: [
          { title: "Coffee", description: "Single-origin beans roasted weekly." },
          { title: "Pastries", description: "Baked fresh every morning." },
          { title: "To go", description: "Order in the app and skip the line." },
        ],
        stats: [
          { value: "8", label: "Locations citywide" },
          { value: "12,000+", label: "Cups a month" },
        ],
        testimonial: { quote: "The oat milk latte is my morning ritual.", author: "Sofía T., regular" },
        footerTagline: "Specialty coffee, roasted with purpose.",
      },
    },
  },
  {
    id: "clinic",
    layout: "service",
    icon: Stethoscope,
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%)",
    accent: "#60a5fa",
    domain: "consultoriosalud.med",
    copy: {
      es: {
        business: "Consultorio médico",
        category: "Salud",
        badge: "Citas el mismo día",
        headline: "Atención médica cercana y confiable",
        subheadline: "Citas en línea con especialistas en menos de 24 horas.",
        cta: "Agendar cita",
        nav: ["Especialidades", "Doctores", "Contacto"],
        services: [
          { title: "Medicina general", description: "Consulta con médicos certificados." },
          { title: "Laboratorio", description: "Resultados en línea el mismo día." },
          { title: "Telemedicina", description: "Consulta por video desde donde estés." },
        ],
        stats: [
          { value: "30+", label: "Especialistas" },
          { value: "98%", label: "Pacientes satisfechos" },
        ],
        testimonial: { quote: "Conseguí una cita el mismo día y el doctor fue muy claro.", author: "Laura G., paciente" },
        footerTagline: "Cuidado médico integral para toda la familia.",
      },
      en: {
        business: "Medical Clinic",
        category: "Healthcare",
        badge: "Same-day appointments",
        headline: "Trusted, attentive medical care",
        subheadline: "Book with a specialist online in under 24 hours.",
        cta: "Book appointment",
        nav: ["Specialties", "Doctors", "Contact"],
        services: [
          { title: "General care", description: "Consultations with certified physicians." },
          { title: "Lab tests", description: "Results online the same day." },
          { title: "Telehealth", description: "Video consultations from anywhere." },
        ],
        stats: [
          { value: "30+", label: "Specialists" },
          { value: "98%", label: "Satisfied patients" },
        ],
        testimonial: { quote: "I got a same-day appointment and the doctor was very clear.", author: "Laura G., patient" },
        footerTagline: "Complete medical care for the whole family.",
      },
    },
  },
  {
    id: "clothing",
    layout: "retail",
    icon: Shirt,
    gradient: "linear-gradient(135deg, #831843 0%, #db2777 55%, #f472b6 100%)",
    accent: "#f472b6",
    domain: "estiloyforma.shop",
    copy: {
      es: {
        business: "Tienda de ropa",
        category: "Moda",
        badge: "Nueva temporada",
        headline: "Nueva colección ya disponible",
        subheadline: "Diseños únicos para cada estación del año.",
        cta: "Comprar ahora",
        nav: ["Mujer", "Hombre", "Ofertas"],
        services: [
          { title: "Envíos", description: "A todo el país en 2 a 4 días hábiles." },
          { title: "Cambios", description: "30 días para cambios sin costo." },
          { title: "Tienda física", description: "Recoge tu compra el mismo día." },
        ],
        stats: [
          { value: "200+", label: "Diseños activos" },
          { value: "25,000+", label: "Clientes felices" },
        ],
        testimonial: { quote: "La calidad de la tela superó lo que esperaba por el precio.", author: "Valentina P., clienta" },
        footerTagline: "Moda con identidad, para cada temporada.",
      },
      en: {
        business: "Clothing Store",
        category: "Fashion",
        badge: "New season",
        headline: "New collection now available",
        subheadline: "Unique designs for every season.",
        cta: "Shop now",
        nav: ["Women", "Men", "Sale"],
        services: [
          { title: "Shipping", description: "Nationwide delivery in 2-4 business days." },
          { title: "Exchanges", description: "30 days for free exchanges." },
          { title: "In-store pickup", description: "Pick up your order the same day." },
        ],
        stats: [
          { value: "200+", label: "Active designs" },
          { value: "25,000+", label: "Happy customers" },
        ],
        testimonial: { quote: "The fabric quality exceeded what I expected for the price.", author: "Valentina P., customer" },
        footerTagline: "Fashion with identity, for every season.",
      },
    },
  },
  {
    id: "construction",
    layout: "editorial",
    icon: HardHat,
    gradient: "linear-gradient(135deg, #713f12 0%, #ca8a04 55%, #facc15 100%)",
    accent: "#facc15",
    domain: "construyemas.build",
    copy: {
      es: {
        business: "Empresa de construcción",
        category: "Construcción",
        badge: "Experiencia garantizada",
        headline: "Construimos proyectos que perduran",
        subheadline: "Obra civil, remodelaciones y proyectos a la medida.",
        cta: "Solicitar cotización",
        nav: ["Proyectos", "Servicios", "Cotizar"],
        services: [
          { title: "Obra nueva", description: "Diseño y construcción llave en mano." },
          { title: "Remodelación", description: "Ampliaciones y renovaciones integrales." },
          { title: "Consultoría", description: "Estudios técnicos y presupuestos detallados." },
        ],
        stats: [
          { value: "120+", label: "Proyectos entregados" },
          { value: "18", label: "Años en el mercado" },
        ],
        testimonial: { quote: "Cumplieron el cronograma al pie de la letra. Muy profesionales.", author: "Jorge L., cliente" },
        footerTagline: "Ingeniería y construcción con garantía real.",
      },
      en: {
        business: "Construction Company",
        category: "Construction",
        badge: "Guaranteed experience",
        headline: "We build projects that last",
        subheadline: "Civil works, remodeling and custom builds.",
        cta: "Request a quote",
        nav: ["Projects", "Services", "Get a quote"],
        services: [
          { title: "New builds", description: "Turnkey design and construction." },
          { title: "Remodeling", description: "Full renovations and expansions." },
          { title: "Consulting", description: "Technical studies and detailed budgets." },
        ],
        stats: [
          { value: "120+", label: "Projects delivered" },
          { value: "18", label: "Years in business" },
        ],
        testimonial: { quote: "They kept the schedule to the letter. Very professional.", author: "Jorge L., client" },
        footerTagline: "Engineering and construction with a real warranty.",
      },
    },
  },
  {
    id: "barbershop",
    layout: "service",
    icon: Scissors,
    gradient: "linear-gradient(135deg, #18181b 0%, #3f3f46 55%, #a1a1aa 100%)",
    accent: "#d4d4d8",
    domain: "barberiaelcorte.style",
    copy: {
      es: {
        business: "Barbería",
        category: "Estilo y cuidado",
        badge: "Reserva en línea",
        headline: "Estilo clásico, corte perfecto",
        subheadline: "Reserva tu turno y evita la espera.",
        cta: "Reservar turno",
        nav: ["Servicios", "Barberos", "Reservar"],
        services: [
          { title: "Corte", description: "Estilos clásicos y modernos a la medida." },
          { title: "Barba", description: "Perfilado, hidratación y acabado." },
          { title: "Afeitado clásico", description: "Toalla caliente y navaja tradicional." },
        ],
        stats: [
          { value: "10", label: "Barberos expertos" },
          { value: "4.8★", label: "Calificación de clientes" },
        ],
        testimonial: { quote: "Salgo siempre con el mismo estilo que pido. Nunca falla.", author: "Daniel S., cliente" },
        footerTagline: "Tradición y estilo en cada corte.",
      },
      en: {
        business: "Barbershop",
        category: "Style & grooming",
        badge: "Book online",
        headline: "Classic style, perfect cut",
        subheadline: "Book your slot and skip the wait.",
        cta: "Book a slot",
        nav: ["Services", "Barbers", "Book now"],
        services: [
          { title: "Haircut", description: "Classic and modern styles, tailored to you." },
          { title: "Beard", description: "Shaping, conditioning and finishing." },
          { title: "Classic shave", description: "Hot towel and traditional straight razor." },
        ],
        stats: [
          { value: "10", label: "Expert barbers" },
          { value: "4.8★", label: "Customer rating" },
        ],
        testimonial: { quote: "I always leave with exactly the style I asked for.", author: "Daniel S., client" },
        footerTagline: "Tradition and style in every cut.",
      },
    },
  },
  {
    id: "professional-services",
    layout: "editorial",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #818cf8 100%)",
    accent: "#818cf8",
    domain: "consultoresasociados.pro",
    copy: {
      es: {
        business: "Firma de servicios profesionales",
        category: "Consultoría",
        badge: "Asesoría certificada",
        headline: "Asesoría experta para tu negocio",
        subheadline: "Contabilidad, legal y consultoría estratégica.",
        cta: "Agendar consulta",
        nav: ["Servicios", "Equipo", "Contacto"],
        services: [
          { title: "Contabilidad", description: "Estados financieros y declaraciones al día." },
          { title: "Legal", description: "Contratos, cumplimiento y protección societaria." },
          { title: "Estrategia", description: "Planes de crecimiento basados en datos." },
        ],
        stats: [
          { value: "300+", label: "Empresas asesoradas" },
          { value: "22", label: "Años de trayectoria" },
        ],
        testimonial: { quote: "Nos ayudaron a ordenar la empresa en tiempo récord.", author: "Marcela V., gerente general" },
        footerTagline: "Decisiones informadas, resultados medibles.",
      },
      en: {
        business: "Professional Services Firm",
        category: "Consulting",
        badge: "Certified advisory",
        headline: "Expert guidance for your business",
        subheadline: "Accounting, legal and strategic consulting.",
        cta: "Book a consultation",
        nav: ["Services", "Team", "Contact"],
        services: [
          { title: "Accounting", description: "Up-to-date financial statements and filings." },
          { title: "Legal", description: "Contracts, compliance and corporate protection." },
          { title: "Strategy", description: "Data-driven growth plans." },
        ],
        stats: [
          { value: "300+", label: "Companies advised" },
          { value: "22", label: "Years in practice" },
        ],
        testimonial: { quote: "They helped us get the business organized in record time.", author: "Marcela V., general manager" },
        footerTagline: "Informed decisions, measurable results.",
      },
    },
  },
  {
    id: "solar",
    layout: "retail",
    icon: Sun,
    gradient: "linear-gradient(135deg, #713f12 0%, #eab308 55%, #fde047 100%)",
    accent: "#fde047",
    domain: "energiasolarplus.green",
    copy: {
      es: {
        business: "Paneles solares",
        category: "Energía renovable",
        badge: "Ahorro certificado",
        headline: "Ahorra energía, cuida el planeta",
        subheadline: "Instalación de paneles solares con garantía de 20 años.",
        cta: "Calcular ahorro",
        nav: ["Instalación", "Financiamiento", "Contacto"],
        services: [
          { title: "Diagnóstico", description: "Estudio gratuito de consumo energético." },
          { title: "Instalación", description: "Equipos certificados por técnicos propios." },
          { title: "Mantenimiento", description: "Revisiones periódicas incluidas." },
        ],
        stats: [
          { value: "1,500+", label: "Instalaciones activas" },
          { value: "40%", label: "Ahorro promedio" },
        ],
        testimonial: { quote: "Recuperé la inversión antes de lo que me prometieron.", author: "Ricardo A., cliente" },
        footerTagline: "Energía limpia, ahorro real desde el primer mes.",
      },
      en: {
        business: "Solar Panels",
        category: "Renewable energy",
        badge: "Certified savings",
        headline: "Save energy, protect the planet",
        subheadline: "Solar panel installation with a 20-year warranty.",
        cta: "Calculate savings",
        nav: ["Installation", "Financing", "Contact"],
        services: [
          { title: "Assessment", description: "Free energy consumption study." },
          { title: "Installation", description: "Certified equipment, in-house technicians." },
          { title: "Maintenance", description: "Periodic checkups included." },
        ],
        stats: [
          { value: "1,500+", label: "Active installations" },
          { value: "40%", label: "Average savings" },
        ],
        testimonial: { quote: "I recovered the investment sooner than they promised.", author: "Ricardo A., client" },
        footerTagline: "Clean energy, real savings from month one.",
      },
    },
  },
  {
    id: "local-shop",
    layout: "retail",
    icon: Store,
    gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #c4b5fd 100%)",
    accent: "#c4b5fd",
    domain: "tiendabarrio.local",
    copy: {
      es: {
        business: "Comercio local",
        category: "Retail de barrio",
        badge: "Entrega el mismo día",
        headline: "Todo lo que necesitas, cerca de ti",
        subheadline: "Productos de calidad con atención personalizada.",
        cta: "Ver catálogo",
        nav: ["Catálogo", "Ofertas", "Ubicación"],
        services: [
          { title: "Domicilios", description: "Entrega en menos de 40 minutos." },
          { title: "Apartado", description: "Reserva productos y paga después." },
          { title: "Pago en línea", description: "Tarjeta, transferencia o efectivo." },
        ],
        stats: [
          { value: "3", label: "Sucursales" },
          { value: "10,000+", label: "Pedidos entregados" },
        ],
        testimonial: { quote: "Siempre tienen lo que busco y me conocen por mi nombre.", author: "Patricia N., clienta" },
        footerTagline: "Tu tienda de confianza, en tu barrio.",
      },
      en: {
        business: "Local Shop",
        category: "Neighborhood retail",
        badge: "Same-day delivery",
        headline: "Everything you need, close to home",
        subheadline: "Quality products with a personal touch.",
        cta: "View catalog",
        nav: ["Catalog", "Deals", "Location"],
        services: [
          { title: "Delivery", description: "Delivered in under 40 minutes." },
          { title: "Layaway", description: "Reserve products and pay later." },
          { title: "Online payment", description: "Card, transfer or cash." },
        ],
        stats: [
          { value: "3", label: "Locations" },
          { value: "10,000+", label: "Orders delivered" },
        ],
        testimonial: { quote: "They always have what I need and know me by name.", author: "Patricia N., customer" },
        footerTagline: "Your trusted shop, right in your neighborhood.",
      },
    },
  },
];
