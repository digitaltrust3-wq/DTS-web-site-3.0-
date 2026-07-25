import {
  Bot,
  BrainCircuit,
  Braces,
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
import { ImageWithFallback } from "../shared/ImageWithFallback";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/translations";

type Technology = {
  label: Record<Language, string>;
  icon: LucideIcon;
  ai?: boolean;
};

const technologies: Technology[] = [
  { label: { en: "Generative AI", es: "IA generativa" }, icon: Sparkles, ai: true },
  { label: { en: "AI agents", es: "Agentes de IA" }, icon: Bot, ai: true },
  { label: { en: "RAG + vector databases", es: "RAG + bases vectoriales" }, icon: BrainCircuit, ai: true },
  { label: { en: "OpenAI API", es: "API de OpenAI" }, icon: Network, ai: true },
  { label: { en: "React + Next.js", es: "React + Next.js" }, icon: Code2 },
  { label: { en: "TypeScript", es: "TypeScript" }, icon: Braces },
  { label: { en: "Node.js + Bun", es: "Node.js + Bun" }, icon: Server },
  { label: { en: "Python + FastAPI", es: "Python + FastAPI" }, icon: Workflow },
  { label: { en: "Supabase", es: "Supabase" }, icon: Database },
  { label: { en: "PostgreSQL", es: "PostgreSQL" }, icon: Database },
  { label: { en: "AWS Serverless", es: "AWS Serverless" }, icon: Cloud },
  { label: { en: "Docker + Kubernetes", es: "Docker + Kubernetes" }, icon: Container },
];

export function TechStack() {
  const { copy, language } = useLanguage();
  const techCopy = copy.tech;
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
              {technologies.map(({ label, icon: Icon, ai }) => (
                <li className={`tech-chip${ai ? " tech-chip--ai" : ""}`} key={label.en}>
                  <span className="tech-chip__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>{label[language]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
