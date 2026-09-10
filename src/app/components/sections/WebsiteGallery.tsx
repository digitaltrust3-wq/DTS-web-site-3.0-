import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { websiteShowcase } from "../../data/websiteShowcase";
import { useLanguage } from "../../i18n/LanguageContext";
import { WebsiteMockupCard } from "../shared/WebsiteMockupCard";

const labels = {
  es: {
    eyebrow: "Lo que podemos construir",
    title: "Diez estilos de sitios web, un mismo nivel de calidad",
    description: "Ejemplos visuales de tipos de negocio que desarrollamos. Ninguno corresponde a un cliente real: son referencias de estilo y estructura.",
    previous: "Ejemplos anteriores",
    next: "Ejemplos siguientes",
    expand: "Ver en grande",
    close: "Cerrar vista previa",
    demoNotice: "Vista previa de demostración — no es un sitio en producción.",
  },
  en: {
    eyebrow: "What we can build",
    title: "Ten website styles, one consistent quality bar",
    description: "Visual examples of the kinds of businesses we build for. None of these belong to a real client — they are style and structure references.",
    previous: "Previous examples",
    next: "Next examples",
    expand: "View larger",
    close: "Close preview",
    demoNotice: "Demo preview only — not a live production site.",
  },
};

export function WebsiteGallery() {
  const { language } = useLanguage();
  const copy = labels[language];
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSite, setActiveSite] = useState<(typeof websiteShowcase)[number] | null>(null);

  useEffect(() => {
    if (!activeSite) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setActiveSite(null);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeSite]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".mockup-slide");
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24;
    const distance = (card?.offsetWidth || track.clientWidth * 0.8) + gap;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <section id="portfolio" className="showcase-section">
      <div className="showcase-shell">
        <div className="showcase-heading">
          <div>
            <span className="showcase-eyebrow">{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <div className="showcase-controls">
            <button type="button" onClick={() => scrollByCard(-1)} aria-label={copy.previous}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollByCard(1)} aria-label={copy.next}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mockup-track" ref={trackRef}>
          {websiteShowcase.map((site) => (
            <div className="mockup-slide" key={site.id}>
              <button
                type="button"
                className="mockup-slide__trigger"
                onClick={() => setActiveSite(site)}
                aria-label={`${copy.expand}: ${site.copy[language].business}`}
              >
                <WebsiteMockupCard site={site} language={language} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeSite && createPortal(
        <div className="mockup-preview" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setActiveSite(null)}>
          <div className="mockup-preview__panel">
            <button type="button" className="mockup-preview__close" onClick={() => setActiveSite(null)} aria-label={copy.close} autoFocus>
              <X aria-hidden="true" />
            </button>
            <WebsiteMockupCard site={activeSite} language={language} />
            <p className="mockup-preview__notice">{copy.demoNotice}</p>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
