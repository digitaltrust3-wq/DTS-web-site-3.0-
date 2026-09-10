import type { CSSProperties } from "react";
import { Facebook, Instagram, Quote, Twitter } from "lucide-react";
import type { ShowcaseSite } from "../../data/websiteShowcase";
import type { Language } from "../../i18n/translations";

type WebsiteMockupCardProps = {
  site: ShowcaseSite;
  language: Language;
};

/**
 * A self-contained, stylized preview of a small-business homepage — browser
 * chrome, nav, hero, services, stats, a testimonial and a footer. Built
 * entirely from CSS (gradients + icons) instead of photos, so nothing here
 * depends on an external image host or can render as a broken link.
 */
export function WebsiteMockupCard({ site, language }: WebsiteMockupCardProps) {
  const copy = site.copy[language];
  const Icon = site.icon;

  return (
    <article className="mockup-card" style={{ "--mockup-accent": site.accent } as CSSProperties}>
      <div className="mockup-chrome">
        <span className="mockup-dot mockup-dot--red" />
        <span className="mockup-dot mockup-dot--yellow" />
        <span className="mockup-dot mockup-dot--green" />
        <span className="mockup-url">{site.domain}</span>
      </div>

      <div className="mockup-nav">
        <span className="mockup-nav__brand">
          <Icon aria-hidden="true" />
          {copy.business}
        </span>
        <span className="mockup-nav__links">
          {copy.nav.map((label) => <span key={label}>{label}</span>)}
        </span>
        <span className="mockup-nav__cta">{copy.cta}</span>
      </div>

      <div className="mockup-hero" style={{ background: site.gradient }}>
        <Icon className="mockup-hero__icon" aria-hidden="true" />
        <p className="mockup-hero__category">{copy.category}</p>
        <h3 className="mockup-hero__headline">{copy.headline}</h3>
        <p className="mockup-hero__subheadline">{copy.subheadline}</p>
        <span className="mockup-hero__button">{copy.cta}</span>
      </div>

      <div className="mockup-services">
        {copy.services.map((service) => (
          <div key={service.title} className="mockup-services__item">
            <span className="mockup-services__dot" />
            <div>
              <p className="mockup-services__title">{service.title}</p>
              <p className="mockup-services__description">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mockup-stats">
        {copy.stats.map((stat) => (
          <div key={stat.label} className="mockup-stats__item">
            <span className="mockup-stats__value">{stat.value}</span>
            <span className="mockup-stats__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mockup-testimonial">
        <Quote className="mockup-testimonial__icon" aria-hidden="true" />
        <p className="mockup-testimonial__quote">&ldquo;{copy.testimonial.quote}&rdquo;</p>
        <p className="mockup-testimonial__author">{copy.testimonial.author}</p>
      </div>

      <div className="mockup-footer">
        <div>
          <p className="mockup-footer__brand">
            <Icon aria-hidden="true" />
            {copy.business}
          </p>
          <p className="mockup-footer__tagline">{copy.footerTagline}</p>
        </div>
        <div className="mockup-footer__socials">
          <Facebook aria-hidden="true" />
          <Instagram aria-hidden="true" />
          <Twitter aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
