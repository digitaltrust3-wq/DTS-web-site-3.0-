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

const serviceIcons: Record<string, LucideIcon> = {
  code: Code2,
  mobile: Smartphone,
  cloud: Cloud,
  data: Database,
  security: ShieldCheck,
  integration: Workflow,
};

export function Services() {
  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="services-shell">
        <header className="services-heading">
          <p className="services-eyebrow">What we do</p>
          <h2 id="services-title">Technology services built around trust</h2>
          <p>
            Explore each capability for a concise view of the business outcome,
            delivery approach and value it adds.
          </p>
        </header>

        <div className="services-grid">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Code2;

            return (
              <article className="service-card hover-card" key={service.id} tabIndex={0}>
                <img
                  className="service-card__image"
                  src={service.image}
                  alt="Abstract secure cloud infrastructure"
                />
                <div className="service-card__scrim" aria-hidden="true" />

                <div className="service-card__summary">
                  <span className="service-card__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <p>{service.shortDescription}</p>
                  <h3>{service.title}</h3>
                </div>

                <div className="service-card__details">
                  <span className="service-card__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.longDescription}</p>
                  <a href="#contact">
                    Discuss this service <ArrowRight aria-hidden="true" />
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
