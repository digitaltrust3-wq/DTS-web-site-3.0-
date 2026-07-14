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
  const wheelFrameRef = useRef<number | null>(null);
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

  const updateWheelTransforms = () => {
    const track = trackRef.current;
    if (!track) return;
    const bounds = track.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;

    track.querySelectorAll<HTMLElement>(".portfolio-card").forEach((card) => {
      const cardBounds = card.getBoundingClientRect();
      const cardCenter = cardBounds.left + cardBounds.width / 2;
      const distance = Math.max(-1, Math.min(1, (cardCenter - center) / (bounds.width * 0.52)));
      const depth = Math.abs(distance);
      card.style.setProperty("--wheel-rotate", `${distance * -20}deg`);
      card.style.setProperty("--wheel-y", `${depth * 32}px`);
      card.style.setProperty("--wheel-scale", `${1.06 - depth * 0.22}`);
      card.style.setProperty("--wheel-opacity", `${1 - depth * 0.26}`);
      card.style.zIndex = String(Math.round((1 - depth) * 10));
    });
  };

  const scheduleWheelUpdate = () => {
    if (wheelFrameRef.current !== null) return;
    wheelFrameRef.current = requestAnimationFrame(() => {
      wheelFrameRef.current = null;
      updateWheelTransforms();
    });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resizeObserver = new ResizeObserver(scheduleWheelUpdate);
    resizeObserver.observe(track);
    scheduleWheelUpdate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (wheelFrameRef.current !== null) cancelAnimationFrame(wheelFrameRef.current);
    };
  }, []);

  const stopDirectionalScroll = () => {
    hoverSpeedRef.current = 0;
    trackRef.current?.classList.remove("is-auto-scrolling");
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const runDirectionalScroll = () => {
    const track = trackRef.current;
    if (!track || hoverSpeedRef.current === 0) {
      animationFrameRef.current = null;
      return;
    }

    const cards = track.querySelectorAll<HTMLElement>(".portfolio-card");
    const firstCard = cards[0];
    const firstDuplicate = cards[sites.length];
    const cycleLength = firstCard && firstDuplicate
      ? firstDuplicate.offsetLeft - firstCard.offsetLeft
      : track.scrollWidth / 2;

    if (cycleLength > 0 && hoverSpeedRef.current < 0 && track.scrollLeft <= 0) {
      track.scrollLeft = cycleLength;
    }
    track.scrollLeft += hoverSpeedRef.current;
    if (cycleLength > 0 && hoverSpeedRef.current > 0 && track.scrollLeft >= cycleLength) {
      track.scrollLeft -= cycleLength;
    }
    updateWheelTransforms();
    animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
  };

  const startDirectionalScroll = (speed = 2.4) => {
    const hasHover = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
    if (!hasHover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    trackRef.current?.classList.add("is-auto-scrolling");
    hoverSpeedRef.current = speed;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) return;
    const track = trackRef.current;
    if (!track) return;

    const bounds = track.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    const direction = position < 0.5 ? -1 : 1;
    const proximity = Math.min(1, Math.abs(position - 0.5) * 2);
    if (proximity < 0.14) {
      stopDirectionalScroll();
      return;
    }
    hoverSpeedRef.current = direction * (2.2 + proximity * proximity * 3.3);
    track.classList.add("is-auto-scrolling");
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
    }
  };

  const handleMotionZoneMove = (event: React.MouseEvent<HTMLDivElement>, direction: -1 | 1) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const rawPosition = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const proximity = direction < 0 ? 1 - rawPosition : rawPosition;
    const speed = direction * (4.5 + proximity * 3.5);
    startDirectionalScroll(speed);
    hoverSpeedRef.current = speed;
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

  const carouselSites = sites.length > 1 ? [...sites, ...sites] : sites;

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

        <div className="portfolio-stage">
          <div
            className="portfolio-motion-zone portfolio-motion-zone--left"
            onMouseEnter={() => startDirectionalScroll(-5.5)}
            onMouseMove={(event) => handleMotionZoneMove(event, -1)}
            onMouseLeave={stopDirectionalScroll}
            aria-hidden="true"
          />
          <div
            ref={trackRef}
            className="portfolio-track"
            tabIndex={0}
            aria-label={portfolio.title}
            onScroll={scheduleWheelUpdate}
            onMouseEnter={() => startDirectionalScroll()}
            onMouseMove={handleMouseMove}
            onMouseLeave={stopDirectionalScroll}
          >
            {carouselSites.map((site, index) => {
            const siteCopy = site.copy[language];
            const isDuplicate = index >= sites.length;
            const visibleIndex = index % sites.length;
            return (
              <article
                className="portfolio-card"
                key={`${site.id}-${isDuplicate ? "duplicate" : "original"}`}
                aria-hidden={isDuplicate || undefined}
              >
                <button
                  className="portfolio-card__media"
                  type="button"
                  tabIndex={isDuplicate ? -1 : undefined}
                  onClick={() => {
                    stopDirectionalScroll();
                    setPreviewSite(site);
                  }}
                  aria-label={`${labels.preview}: ${siteCopy.title}`}
                >
                  <ImageWithFallback src={site.image} alt={siteCopy.title} className="portfolio-card__image" />
                  <span className="portfolio-card__number">{String(visibleIndex + 1).padStart(2, "0")}</span>
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
                    <a href={site.url} target="_blank" rel="noreferrer" tabIndex={isDuplicate ? -1 : undefined} aria-label={`${labels.open}: ${siteCopy.title}`}>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
          <div
            className="portfolio-motion-zone portfolio-motion-zone--right"
            onMouseEnter={() => startDirectionalScroll(5.5)}
            onMouseMove={(event) => handleMotionZoneMove(event, 1)}
            onMouseLeave={stopDirectionalScroll}
            aria-hidden="true"
          />
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
