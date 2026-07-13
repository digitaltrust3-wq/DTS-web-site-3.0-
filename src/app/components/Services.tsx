import {
  ArrowRight,
  Cloud,
  Code2,
  Database,
  ShieldCheck,
  Smartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import services from "../data/services.json";
import { useLanguage } from "../i18n/LanguageContext";

const serviceIcons: Record<string, LucideIcon> = {
  code: Code2,
  mobile: Smartphone,
  cloud: Cloud,
  data: Database,
  security: ShieldCheck,
  integration: Workflow,
};

export function Services() {
  const { copy } = useLanguage();
  const serviceCopy = copy.services;

  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="services-shell">
        <header className="services-heading">
          <p className="services-eyebrow">{serviceCopy.eyebrow}</p>
          <h2 id="services-title">{serviceCopy.title}</h2>
          <p>{serviceCopy.description}</p>
        </header>

        <div className="services-grid">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Code2;
            const item = serviceCopy.items[service.id as keyof typeof serviceCopy.items];

            return (
              <article className="service-card hover-card" key={service.id} tabIndex={0}>
                <img
                  className="service-card__image"
                  src={`${import.meta.env.BASE_URL}${service.image.replace(/^\//, "")}`}
                  alt={serviceCopy.imageAlt}
                />
                <div className="service-card__scrim" aria-hidden="true" />

                <div className="service-card__summary">
                  <span className="service-card__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <p>{item.short}</p>
                  <h3>{item.title}</h3>
                </div>

                <div className="service-card__details">
                  <span className="service-card__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.long}</p>
                  <a href="#contact">
                    {serviceCopy.discuss} <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
