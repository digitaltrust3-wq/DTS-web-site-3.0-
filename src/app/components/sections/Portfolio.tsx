import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Eye, X } from "lucide-react";
import { portfolioSites, type PortfolioSite } from "../../data/portfolioSites";
import { useLanguage } from "../../i18n/LanguageContext";
import { ImageWithFallback } from "../shared/ImageWithFallback";

export function Portfolio() {
  const { copy, language } = useLanguage();
  const portfolio = copy.portfolio;
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverSpeedRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const [previewSite, setPreviewSite] = useState<PortfolioSite | null>(null);
  const sites = useMemo(() => portfolioSites.filter((site) => site.enabled).slice(0, 20), []);
  const labels = language === "es"
    ? { preview: "Vista previa", open: "Abrir sitio", previous: "Proyectos anteriores", next: "Proyectos siguientes", close: "Cerrar vista previa", fallback: "Si la página no permite mostrarse aquí, puedes abrirla en una nueva pestaña." }
    : { preview: "Preview", open: "Open website", previous: "Previous projects", next: "Next projects", close: "Close preview", fallback: "If the page cannot be displayed here, you can open it in a new tab." };

  useEffect(() => {
    if (!previewSite) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setPreviewSite(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewSite]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const stopDirectionalScroll = () => {
    hoverSpeedRef.current = 0;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const runDirectionalScroll = () => {
    const track = trackRef.current;
    if (!track || hoverSpeedRef.current <= 0) {
      animationFrameRef.current = null;
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    track.scrollLeft = Math.min(maxScroll, track.scrollLeft + hoverSpeedRef.current);
    if (track.scrollLeft >= maxScroll - 1) {
      stopDirectionalScroll();
      return;
    }
    animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = trackRef.current;
    if (!track) return;

    const bounds = track.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    const activationPoint = 0.62;
    if (position <= activationPoint) {
      stopDirectionalScroll();
      return;
    }

    const proximity = Math.min(1, (position - activationPoint) / (1 - activationPoint));
    hoverSpeedRef.current = 0.7 + proximity * proximity * 5.3;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
    }
  };

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".portfolio-card");
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24;
    const distance = (card?.offsetWidth || track.clientWidth * 0.85) + gap;
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

    if (direction < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    else if (direction > 0 && atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
    else track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="portfolio-shell">
        <div className="portfolio-heading">
          <div>
            <span className="portfolio-eyebrow">{portfolio.eyebrow}</span>
            <h2>{portfolio.title}</h2>
            <p>{portfolio.description}</p>
          </div>
          <div className="portfolio-controls" aria-label={portfolio.title}>
            <button type="button" onClick={() => moveCarousel(-1)} aria-label={labels.previous}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label={labels.next}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="portfolio-track"
          tabIndex={0}
          aria-label={portfolio.title}
          onPointerMove={handlePointerMove}
          onPointerLeave={stopDirectionalScroll}
          onPointerCancel={stopDirectionalScroll}
        >
          {sites.map((site, index) => {
            const siteCopy = site.copy[language];
            return (
              <article className="portfolio-card" key={site.id}>
                <button className="portfolio-card__media" type="button" onClick={() => setPreviewSite(site)} aria-label={`${labels.preview}: ${siteCopy.title}`}>
                  <ImageWithFallback src={site.image} alt={siteCopy.title} className="portfolio-card__image" />
                  <span className="portfolio-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="portfolio-card__preview"><Eye aria-hidden="true" /> {labels.preview}</span>
                </button>
                <div className="portfolio-card__body">
                  <span className="portfolio-card__category">{siteCopy.category}</span>
                  <h3>{siteCopy.title}</h3>
                  <p>{siteCopy.description}</p>
                  <div className="portfolio-card__footer">
                    <div className="portfolio-card__tags">
                      {site.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <a href={site.url} target="_blank" rel="noreferrer" aria-label={`${labels.open}: ${siteCopy.title}`}>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {previewSite && (
        <div className="portfolio-preview" role="dialog" aria-modal="true" aria-labelledby="portfolio-preview-title" onMouseDown={(event) => event.target === event.currentTarget && setPreviewSite(null)}>
          <div className="portfolio-preview__panel">
            <header>
              <div>
                <span>{previewSite.copy[language].category}</span>
                <h3 id="portfolio-preview-title">{previewSite.copy[language].title}</h3>
              </div>
              <div className="portfolio-preview__actions">
                <a href={previewSite.url} target="_blank" rel="noreferrer">
                  {labels.open}<ExternalLink aria-hidden="true" />
                </a>
                <button type="button" onClick={() => setPreviewSite(null)} aria-label={labels.close} autoFocus>
                  <X aria-hidden="true" />
                </button>
              </div>
            </header>
            <iframe src={previewSite.url} title={`${labels.preview}: ${previewSite.copy[language].title}`} loading="lazy" />
            <p className="portfolio-preview__fallback">{labels.fallback}</p>
          </div>
        </div>
      )}
    </section>
  );
}
