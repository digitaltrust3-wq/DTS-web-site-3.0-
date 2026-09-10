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

export type ShowcaseCopy = {
  business: string;
  category: string;
  headline: string;
  subheadline: string;
  cta: string;
  nav: [string, string, string];
  services: [string, string, string];
};

export type ShowcaseSite = {
  id: string;
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
    icon: PawPrint,
    gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #5eead4 100%)",
    accent: "#2dd4bf",
    domain: "clinicavetplus.com",
    copy: {
      es: {
        business: "Veterinaria",
        category: "Salud animal",
        headline: "Cuidamos a tu mascota como familia",
        subheadline: "Consultas, vacunación y cirugía con atención cercana.",
        cta: "Agendar cita",
        nav: ["Servicios", "Equipo", "Contacto"],
        services: ["Consultas", "Vacunación", "Cirugía"],
      },
      en: {
        business: "Veterinary Clinic",
        category: "Animal health",
        headline: "We care for your pet like family",
        subheadline: "Consultations, vaccines and surgery with close attention.",
        cta: "Book a visit",
        nav: ["Services", "Team", "Contact"],
        services: ["Consultations", "Vaccines", "Surgery"],
      },
    },
  },
  {
    id: "restaurant",
    icon: UtensilsCrossed,
    gradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #fb923c 100%)",
    accent: "#fb923c",
    domain: "sabordecasa.rest",
    copy: {
      es: {
        business: "Restaurante",
        category: "Gastronomía",
        headline: "Sabores auténticos, todos los días",
        subheadline: "Reserva tu mesa y descubre el menú de temporada.",
        cta: "Ver menú",
        nav: ["Menú", "Reservas", "Ubicación"],
        services: ["Almuerzo", "Cenas", "Eventos"],
      },
      en: {
        business: "Restaurant",
        category: "Dining",
        headline: "Authentic flavors, every day",
        subheadline: "Reserve your table and discover the seasonal menu.",
        cta: "View menu",
        nav: ["Menu", "Reservations", "Location"],
        services: ["Lunch", "Dinner", "Events"],
      },
    },
  },
  {
    id: "cafe",
    icon: Coffee,
    gradient: "linear-gradient(135deg, #451a03 0%, #92400e 55%, #d97706 100%)",
    accent: "#d97706",
    domain: "cafetostado.co",
    copy: {
      es: {
        business: "Cafetería",
        category: "Café de especialidad",
        headline: "Tu pausa perfecta empieza aquí",
        subheadline: "Café de origen, repostería artesanal y buen ambiente.",
        cta: "Ver ubicaciones",
        nav: ["Menú", "Nosotros", "Locales"],
        services: ["Café", "Repostería", "Para llevar"],
      },
      en: {
        business: "Coffee Shop",
        category: "Specialty coffee",
        headline: "Your perfect break starts here",
        subheadline: "Single-origin coffee, fresh pastries and a great vibe.",
        cta: "Find a location",
        nav: ["Menu", "About", "Locations"],
        services: ["Coffee", "Pastries", "To go"],
      },
    },
  },
  {
    id: "clinic",
    icon: Stethoscope,
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%)",
    accent: "#60a5fa",
    domain: "consultoriosalud.med",
    copy: {
      es: {
        business: "Consultorio médico",
        category: "Salud",
        headline: "Atención médica cercana y confiable",
        subheadline: "Citas en línea con especialistas en menos de 24 horas.",
        cta: "Agendar cita",
        nav: ["Especialidades", "Doctores", "Contacto"],
        services: ["Medicina general", "Laboratorio", "Telemedicina"],
      },
      en: {
        business: "Medical Clinic",
        category: "Healthcare",
        headline: "Trusted, attentive medical care",
        subheadline: "Book with a specialist online in under 24 hours.",
        cta: "Book appointment",
        nav: ["Specialties", "Doctors", "Contact"],
        services: ["General care", "Lab tests", "Telehealth"],
      },
    },
  },
  {
    id: "clothing",
    icon: Shirt,
    gradient: "linear-gradient(135deg, #831843 0%, #db2777 55%, #f472b6 100%)",
    accent: "#f472b6",
    domain: "estiloyforma.shop",
    copy: {
      es: {
        business: "Tienda de ropa",
        category: "Moda",
        headline: "Nueva colección ya disponible",
        subheadline: "Diseños únicos para cada estación del año.",
        cta: "Comprar ahora",
        nav: ["Mujer", "Hombre", "Ofertas"],
        services: ["Envíos", "Cambios", "Tienda física"],
      },
      en: {
        business: "Clothing Store",
        category: "Fashion",
        headline: "New collection now available",
        subheadline: "Unique designs for every season.",
        cta: "Shop now",
        nav: ["Women", "Men", "Sale"],
        services: ["Shipping", "Exchanges", "In-store pickup"],
      },
    },
  },
  {
    id: "construction",
    icon: HardHat,
    gradient: "linear-gradient(135deg, #713f12 0%, #ca8a04 55%, #facc15 100%)",
    accent: "#facc15",
    domain: "construyemas.build",
    copy: {
      es: {
        business: "Empresa de construcción",
        category: "Construcción",
        headline: "Construimos proyectos que perduran",
        subheadline: "Obra civil, remodelaciones y proyectos a la medida.",
        cta: "Solicitar cotización",
        nav: ["Proyectos", "Servicios", "Cotizar"],
        services: ["Obra nueva", "Remodelación", "Consultoría"],
      },
      en: {
        business: "Construction Company",
        category: "Construction",
        headline: "We build projects that last",
        subheadline: "Civil works, remodeling and custom builds.",
        cta: "Request a quote",
        nav: ["Projects", "Services", "Get a quote"],
        services: ["New builds", "Remodeling", "Consulting"],
      },
    },
  },
  {
    id: "barbershop",
    icon: Scissors,
    gradient: "linear-gradient(135deg, #18181b 0%, #3f3f46 55%, #a1a1aa 100%)",
    accent: "#d4d4d8",
    domain: "barberiaelcorte.style",
    copy: {
      es: {
        business: "Barbería",
        category: "Estilo y cuidado",
        headline: "Estilo clásico, corte perfecto",
        subheadline: "Reserva tu turno y evita la espera.",
        cta: "Reservar turno",
        nav: ["Servicios", "Barberos", "Reservar"],
        services: ["Corte", "Barba", "Afeitado clásico"],
      },
      en: {
        business: "Barbershop",
        category: "Style & grooming",
        headline: "Classic style, perfect cut",
        subheadline: "Book your slot and skip the wait.",
        cta: "Book a slot",
        nav: ["Services", "Barbers", "Book now"],
        services: ["Haircut", "Beard", "Classic shave"],
      },
    },
  },
  {
    id: "professional-services",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #818cf8 100%)",
    accent: "#818cf8",
    domain: "consultoresasociados.pro",
    copy: {
      es: {
        business: "Firma de servicios profesionales",
        category: "Consultoría",
        headline: "Asesoría experta para tu negocio",
        subheadline: "Contabilidad, legal y consultoría estratégica.",
        cta: "Agendar consulta",
        nav: ["Servicios", "Equipo", "Contacto"],
        services: ["Contabilidad", "Legal", "Estrategia"],
      },
      en: {
        business: "Professional Services Firm",
        category: "Consulting",
        headline: "Expert guidance for your business",
        subheadline: "Accounting, legal and strategic consulting.",
        cta: "Book a consultation",
        nav: ["Services", "Team", "Contact"],
        services: ["Accounting", "Legal", "Strategy"],
      },
    },
  },
  {
    id: "solar",
    icon: Sun,
    gradient: "linear-gradient(135deg, #713f12 0%, #eab308 55%, #fde047 100%)",
    accent: "#fde047",
    domain: "energiasolarplus.green",
    copy: {
      es: {
        business: "Paneles solares",
        category: "Energía renovable",
        headline: "Ahorra energía, cuida el planeta",
        subheadline: "Instalación de paneles solares con garantía de 20 años.",
        cta: "Calcular ahorro",
        nav: ["Instalación", "Financiamiento", "Contacto"],
        services: ["Diagnóstico", "Instalación", "Mantenimiento"],
      },
      en: {
        business: "Solar Panels",
        category: "Renewable energy",
        headline: "Save energy, protect the planet",
        subheadline: "Solar panel installation with a 20-year warranty.",
        cta: "Calculate savings",
        nav: ["Installation", "Financing", "Contact"],
        services: ["Assessment", "Installation", "Maintenance"],
      },
    },
  },
  {
    id: "local-shop",
    icon: Store,
    gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #c4b5fd 100%)",
    accent: "#c4b5fd",
    domain: "tiendabarrio.local",
    copy: {
      es: {
        business: "Comercio local",
        category: "Retail de barrio",
        headline: "Todo lo que necesitas, cerca de ti",
        subheadline: "Productos de calidad con atención personalizada.",
        cta: "Ver catálogo",
        nav: ["Catálogo", "Ofertas", "Ubicación"],
        services: ["Domicilios", "Apartado", "Pago en línea"],
      },
      en: {
        business: "Local Shop",
        category: "Neighborhood retail",
        headline: "Everything you need, close to home",
        subheadline: "Quality products with a personal touch.",
        cta: "View catalog",
        nav: ["Catalog", "Deals", "Location"],
        services: ["Delivery", "Layaway", "Online payment"],
      },
    },
  },
];
