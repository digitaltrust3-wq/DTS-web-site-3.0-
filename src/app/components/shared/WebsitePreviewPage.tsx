import type { CSSProperties } from "react";
import { Facebook, Instagram, MapPin, Phone, Quote, Star, Twitter } from "lucide-react";
import type { ShowcaseSite } from "../../data/websiteShowcase";
import type { Language } from "../../i18n/translations";

type WebsitePreviewPageProps = {
  site: ShowcaseSite;
  language: Language;
};

const microcopy = {
  es: {
    call: "Llamar ahora",
    home: "Inicio",
    address: "Av. Principal 123, tu ciudad",
    hours: "Abierto todos los días",
  },
  en: {
    call: "Call now",
    home: "Home",
    address: "123 Main Ave, your city",
    hours: "Open every day",
  },
};

/**
 * A richer, light-themed "finished homepage" preview shown in the enlarged
 * modal. Three layout families — retail, service and editorial — inspired by
 * patterns seen on real small-business sites (centered product-forward nav,
 * icon-badge service rows with a dual-action bar, bold editorial headlines
 * with a layered photo card) but built with this project's own colors,
 * icons and copy — no cloned branding, no external images.
 */
export function WebsitePreviewPage({ site, language }: WebsitePreviewPageProps) {
  const copy = site.copy[language];
  const micro = microcopy[language];
  const Icon = site.icon;
  const style = { "--preview-accent": site.accent } as CSSProperties;

  if (site.layout === "retail") {
    return (
      <div className="preview-page preview-page--retail" style={style}>
        <div className="preview-announce">{copy.badge}</div>
        <nav className="preview-nav preview-nav--centered">
          <span className="preview-nav__side">
            {copy.nav[0]}<span>{copy.nav[1]}</span>
          </span>
          <span className="preview-nav__brand"><Icon aria-hidden="true" />{copy.business}</span>
          <span className="preview-nav__side preview-nav__side--right">{copy.nav[2]}</span>
        </nav>

        <div className="preview-retail-hero">
          <div className="preview-retail-hero__copy">
            <p className="preview-eyebrow" style={{ color: site.accent }}>{copy.category}</p>
            <h2>{copy.headline}</h2>
            <p className="preview-sub">{copy.subheadline}</p>
            <button type="button" className="preview-pill-cta" style={{ background: site.accent }}>{copy.cta}</button>
          </div>
          <div className="preview-retail-hero__visual" style={{ background: site.gradient }}>
            <Icon aria-hidden="true" />
            <span className="preview-floating-badge">{copy.badge}</span>
          </div>
        </div>

        <div className="preview-retail-grid">
          {copy.services.map((service) => (
            <div className="preview-retail-card" key={service.title}>
              <span className="preview-retail-card__icon" style={{ background: `${site.accent}22`, color: site.accent }}>
                <Icon aria-hidden="true" />
              </span>
              <p className="preview-retail-card__title">{service.title}</p>
              <p className="preview-retail-card__desc">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="preview-retail-stats">
          {copy.stats.map((stat) => (
            <span key={stat.label}><strong style={{ color: site.accent }}>{stat.value}</strong> {stat.label}</span>
          ))}
        </div>

        <div className="preview-testimonial preview-testimonial--light">
          <div className="preview-stars" style={{ color: site.accent }}>
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} fill="currentColor" aria-hidden="true" />)}
          </div>
          <p>&ldquo;{copy.testimonial.quote}&rdquo;</p>
          <span>{copy.testimonial.author}</span>
        </div>

        <footer className="preview-footer preview-footer--light">
          <div>
            <p className="preview-footer__brand"><Icon aria-hidden="true" />{copy.business}</p>
            <p className="preview-footer__tagline">{copy.footerTagline}</p>
          </div>
          <div className="preview-footer__socials">
            <Facebook aria-hidden="true" /><Instagram aria-hidden="true" /><Twitter aria-hidden="true" />
          </div>
        </footer>
      </div>
    );
  }

  if (site.layout === "service") {
    return (
      <div className="preview-page preview-page--service" style={style}>
        <nav className="preview-nav">
          <span className="preview-nav__brand"><Icon aria-hidden="true" />{copy.business}</span>
          <span className="preview-nav__links">
            {copy.nav.map((label) => <span key={label}>{label}</span>)}
          </span>
        </nav>

        <div className="preview-breadcrumb">{micro.home} <span>/</span> {copy.category}</div>

        <div className="preview-service-hero">
          <span className="preview-urgency-badge" style={{ background: `${site.accent}22`, color: site.accent }}>{copy.badge}</span>
          <h2>{copy.headline}</h2>
          <p className="preview-sub">{copy.subheadline}</p>

          <div className="preview-icon-row">
            {copy.services.map((service) => (
              <div className="preview-icon-badge" key={service.title}>
                <span style={{ background: `${site.accent}1c`, color: site.accent }}><Icon aria-hidden="true" /></span>
                <p>{service.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-trust-line">
          {copy.stats.map((stat) => (
            <span key={stat.label}><strong style={{ color: site.accent }}>{stat.value}</strong> {stat.label}</span>
          ))}
        </div>

        <div className="preview-testimonial preview-testimonial--light">
          <Quote className="preview-testimonial__icon" style={{ color: site.accent }} aria-hidden="true" />
          <p>&ldquo;{copy.testimonial.quote}&rdquo;</p>
          <span>{copy.testimonial.author}</span>
        </div>

        <div className="preview-address-line">
          <MapPin aria-hidden="true" /> {micro.address} · {micro.hours}
        </div>

        <div className="preview-action-bar">
          <button type="button" className="preview-action-bar__secondary">
            <Phone aria-hidden="true" /> {micro.call}
          </button>
          <button type="button" className="preview-action-bar__primary" style={{ background: site.accent }}>
            {copy.cta}
          </button>
        </div>
      </div>
    );
  }

  // editorial
  const headlineWords = copy.headline.split(" ");
  const lastWord = headlineWords.pop();

  return (
    <div className="preview-page preview-page--editorial" style={style}>
      <nav className="preview-nav preview-nav--centered">
        <span className="preview-nav__side">{copy.nav[0]}</span>
        <span className="preview-nav__brand"><Icon aria-hidden="true" />{copy.business}</span>
        <span className="preview-nav__side preview-nav__side--right">{copy.nav[1]}<span>{copy.nav[2]}</span></span>
      </nav>

      <div className="preview-editorial-photo" style={{ background: site.gradient }}>
        <Icon aria-hidden="true" />
      </div>

      <div className="preview-editorial-card">
        <p className="preview-eyebrow" style={{ color: site.accent }}>{copy.category}</p>
        <h2>{headlineWords.join(" ")} <span style={{ color: site.accent }}>{lastWord}</span></h2>
        <p className="preview-sub">{copy.subheadline}</p>
        <div className="preview-editorial-actions">
          <button type="button" className="preview-pill-cta preview-pill-cta--dark">{copy.cta}</button>
          <span className="preview-trust-badge">{copy.badge}</span>
        </div>
      </div>

      <div className="preview-editorial-services">
        {copy.services.map((service, index) => (
          <div className="preview-editorial-service" key={service.title}>
            <span className="preview-editorial-service__index" style={{ color: site.accent }}>0{index + 1}</span>
            <div>
              <p className="preview-editorial-service__title">{service.title}</p>
              <p className="preview-editorial-service__desc">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="preview-editorial-stats">
        {copy.stats.map((stat) => (
          <div key={stat.label}>
            <strong style={{ color: site.accent }}>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="preview-testimonial preview-testimonial--bordered" style={{ borderColor: `${site.accent}55` }}>
        <Quote className="preview-testimonial__icon" style={{ color: site.accent }} aria-hidden="true" />
        <p>&ldquo;{copy.testimonial.quote}&rdquo;</p>
        <span>{copy.testimonial.author}</span>
      </div>

      <footer className="preview-footer preview-footer--dark">
        <div>
          <p className="preview-footer__brand"><Icon aria-hidden="true" />{copy.business}</p>
          <p className="preview-footer__tagline">{copy.footerTagline}</p>
        </div>
        <div className="preview-footer__socials">
          <Facebook aria-hidden="true" /><Instagram aria-hidden="true" /><Twitter aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
