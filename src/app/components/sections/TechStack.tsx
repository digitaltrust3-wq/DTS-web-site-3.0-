import {
  Bot,
  BrainCircuit,
  Braces,
  ChevronDown,
  Cloud,
  Code2,
  Container,
  Database,
  Network,
  Server,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../shared/ImageWithFallback";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/translations";

type LocalizedText = Record<Language, string>;
type LocalizedTags = Record<Language, readonly string[]>;

type Technology = {
  label: LocalizedText;
  benefit: LocalizedText;
  useCases: LocalizedTags;
  icon: LucideIcon;
  ai?: boolean;
};

const technologies: Technology[] = [
  {
    label: { en: "Generative AI", es: "IA generativa" },
    benefit: {
      en: "Creates content and insights faster while reducing repetitive work.",
      es: "Crea contenido y análisis más rápido mientras reduce tareas repetitivas.",
    },
    useCases: { en: ["Automation", "Content", "AI"], es: ["Automatización", "Contenido", "IA"] },
    icon: Sparkles,
    ai: true,
  },
  {
    label: { en: "AI agents", es: "Agentes de IA" },
    benefit: {
      en: "Executes connected workflows and assists customers around the clock.",
      es: "Ejecuta flujos conectados y atiende clientes de forma continua.",
    },
    useCases: { en: ["Support", "Workflows", "24/7"], es: ["Soporte", "Procesos", "24/7"] },
    icon: Bot,
    ai: true,
  },
  {
    label: { en: "RAG + vector databases", es: "RAG + bases vectoriales" },
    benefit: {
      en: "Turns private knowledge into accurate, contextual and traceable answers.",
      es: "Convierte conocimiento privado en respuestas precisas, contextuales y trazables.",
    },
    useCases: { en: ["Knowledge", "Search", "AI"], es: ["Conocimiento", "Búsqueda", "IA"] },
    icon: BrainCircuit,
    ai: true,
  },
  {
    label: { en: "OpenAI API", es: "API de OpenAI" },
    benefit: {
      en: "Adds conversational intelligence to products and internal business processes.",
      es: "Integra inteligencia conversacional en productos y procesos internos.",
    },
    useCases: { en: ["Chat", "APIs", "Automation"], es: ["Chat", "APIs", "Automatización"] },
    icon: Network,
    ai: true,
  },
  {
    label: { en: "React + Next.js", es: "React + Next.js" },
    benefit: {
      en: "Delivers fast, accessible web experiences designed to convert.",
      es: "Crea experiencias web rápidas, accesibles y orientadas a convertir.",
    },
    useCases: { en: ["Web", "SEO", "Performance"], es: ["Web", "SEO", "Rendimiento"] },
    icon: Code2,
  },
  {
    label: { en: "TypeScript", es: "TypeScript" },
    benefit: {
      en: "Reduces production errors and makes software easier to evolve.",
      es: "Reduce errores en producción y facilita la evolución del software.",
    },
    useCases: { en: ["Quality", "Scale", "Web"], es: ["Calidad", "Escala", "Web"] },
    icon: Braces,
  },
  {
    label: { en: "Node.js + Bun", es: "Node.js + Bun" },
    benefit: {
      en: "Powers fast APIs and real-time services with efficient infrastructure.",
      es: "Impulsa APIs rápidas y servicios en tiempo real con eficiencia.",
    },
    useCases: { en: ["APIs", "Realtime", "Backend"], es: ["APIs", "Tiempo real", "Backend"] },
    icon: Server,
  },
  {
    label: { en: "Python + FastAPI", es: "Python + FastAPI" },
    benefit: {
      en: "Accelerates intelligent backends, automation and data integrations.",
      es: "Acelera backends inteligentes, automatizaciones e integraciones de datos.",
    },
    useCases: { en: ["AI", "Data", "APIs"], es: ["IA", "Datos", "APIs"] },
    icon: Workflow,
  },
  {
    label: { en: "Supabase", es: "Supabase" },
    benefit: {
      en: "Launches secure products faster with authentication and real-time data.",
      es: "Lanza productos seguros más rápido con autenticación y datos en vivo.",
    },
    useCases: { en: ["Auth", "Realtime", "Cloud"], es: ["Acceso", "Tiempo real", "Nube"] },
    icon: Database,
  },
  {
    label: { en: "PostgreSQL", es: "PostgreSQL" },
    benefit: {
      en: "Protects critical business data with proven reliability and scale.",
      es: "Protege datos críticos con confiabilidad comprobada y capacidad de crecimiento.",
    },
    useCases: { en: ["Data", "Secure", "Scalable"], es: ["Datos", "Seguro", "Escalable"] },
    icon: Database,
  },
  {
    label: { en: "AWS Serverless", es: "AWS Serverless" },
    benefit: {
      en: "Adapts capacity automatically while optimizing infrastructure costs.",
      es: "Adapta la capacidad automáticamente y optimiza costos de infraestructura.",
    },
    useCases: { en: ["Cloud", "Scale", "Costs"], es: ["Nube", "Escala", "Costos"] },
    icon: Cloud,
  },
  {
    label: { en: "Docker + Kubernetes", es: "Docker + Kubernetes" },
    benefit: {
      en: "Keeps deployments consistent and services available as demand grows.",
      es: "Mantiene despliegues consistentes y servicios disponibles al crecer.",
    },
    useCases: { en: ["DevOps", "Cloud", "Scalable"], es: ["DevOps", "Nube", "Escalable"] },
    icon: Container,
  },
];

export function TechStack() {
  const { copy, language } = useLanguage();
  const techCopy = copy.tech;
  const [expandedTechnology, setExpandedTechnology] = useState<string | null>(null);
  const desktopImageUrl = `${import.meta.env.BASE_URL}assets/sections/software-ai-architecture.webp`;
  const mobileImageUrl = `${import.meta.env.BASE_URL}assets/sections/software-ai-architecture-mobile.webp`;

  return (
    <section className="content-section content-section--tech">
      <div className="wide-shell">
        <div className="content-split content-split--tech">
          <div className="content-media tech-visual order-2 lg:order-1">
            <div className="tech-visual__frame">
              <picture>
                <source media="(max-width: 767px)" srcSet={mobileImageUrl} type="image/webp" />
                <ImageWithFallback
                  src={desktopImageUrl}
                  alt={techCopy.imageAlt}
                  className="tech-visual__image"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          </div>

          <div className="content-copy tech-copy order-1 lg:order-2">
            <h2>{techCopy.title}</h2>
            <p>{techCopy.description}</p>

            <ul
              className="tech-grid"
              aria-label={language === "es" ? "Tecnologías que utilizamos" : "Technologies we use"}
            >
              {technologies.map(({ label, benefit, useCases, icon: Icon, ai }) => {
                const isExpanded = expandedTechnology === label.en;

                return (
                  <li className="tech-grid__item" key={label.en}>
                    <button
                      type="button"
                      className={`tech-chip${ai ? " tech-chip--ai" : ""}${isExpanded ? " tech-chip--expanded" : ""}`}
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedTechnology(isExpanded ? null : label.en)}
                    >
                      <span className="tech-chip__heading">
                        <span className="tech-chip__icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="tech-chip__name">{label[language]}</span>
                        <span className="tech-chip__toggle" aria-hidden="true">
                          <ChevronDown />
                        </span>
                      </span>

                      <span className="tech-chip__details">
                        <span className="tech-chip__details-inner">
                          <span className="tech-chip__benefit">{benefit[language]}</span>
                          <span className="tech-chip__tags" aria-hidden="true">
                            {useCases[language].map((useCase) => (
                              <span key={useCase}>{useCase}</span>
                            ))}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
