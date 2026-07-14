import type { Language } from "../i18n/translations";

type SiteCopy = {
  title: string;
  category: string;
  description: string;
};

export type PortfolioSite = {
  id: string;
  enabled: boolean;
  url: string;
  image: string;
  tags: string[];
  copy: Record<Language, SiteCopy>;
};

const emptyCopy: Record<Language, SiteCopy> = {
  en: { title: "New website", category: "Website", description: "Add a short project description here." },
  es: { title: "Nuevo sitio web", category: "Sitio web", description: "Agrega aquí una descripción breve del proyecto." },
};

const emptySite = (number: number): PortfolioSite => ({
  id: `site-${String(number).padStart(2, "0")}`,
  enabled: false,
  url: "https://example.com",
  image: "",
  tags: [],
  copy: emptyCopy,
});

/**
 * Catálogo editable del carrusel (máximo 20 sitios).
 * Para publicar un espacio: cambia enabled a true y completa url, image,
 * tags y los textos en español/inglés. La imagen puede ser una URL pública.
 */
export const portfolioSites: PortfolioSite[] = [
  {
    id: "fintech-mobile",
    enabled: true,
    url: "https://example.com",
    image: "https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    tags: ["React Native", "AI/ML", "Cloud"],
    copy: {
      en: { title: "FinTech Mobile Platform", category: "Mobile App", description: "A mobile banking solution with AI-powered financial insights." },
      es: { title: "Plataforma móvil FinTech", category: "Aplicación móvil", description: "Una solución de banca móvil con análisis financieros impulsados por IA." },
    },
  },
  {
    id: "healthcare-analytics",
    enabled: true,
    url: "https://example.org",
    image: "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    tags: ["React", "D3.js", "Node.js"],
    copy: {
      en: { title: "Healthcare Analytics Dashboard", category: "Web Application", description: "Real-time patient data visualization and predictive analytics platform." },
      es: { title: "Panel de analítica para salud", category: "Aplicación web", description: "Visualización de datos de pacientes en tiempo real y analítica predictiva." },
    },
  },
  {
    id: "ecommerce-platform",
    enabled: true,
    url: "https://example.net",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    tags: ["Next.js", "PostgreSQL", "AWS"],
    copy: {
      en: { title: "E-Commerce Transformation", category: "Full Stack", description: "Scalable multi-vendor marketplace with advanced search and recommendations." },
      es: { title: "Transformación de comercio electrónico", category: "Desarrollo integral", description: "Marketplace escalable para múltiples vendedores, con búsqueda avanzada y recomendaciones." },
    },
  },
  emptySite(4),
  emptySite(5),
  emptySite(6),
  emptySite(7),
  emptySite(8),
  emptySite(9),
  emptySite(10),
  emptySite(11),
  emptySite(12),
  emptySite(13),
  emptySite(14),
  emptySite(15),
  emptySite(16),
  emptySite(17),
  emptySite(18),
  emptySite(19),
  emptySite(20),
];
