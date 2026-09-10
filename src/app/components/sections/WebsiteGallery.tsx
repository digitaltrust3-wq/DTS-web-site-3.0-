import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { websiteShowcase, type ShowcaseSite } from "../../data/websiteShowcase";
import { useLanguage } from "../../i18n/LanguageContext";
import { WebsiteMockupCard } from "../shared/WebsiteMockupCard";
import { WebsitePreviewPage } from "../shared/WebsitePreviewPage";

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
  const hoverSpeedRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const wheelFrameRef = useRef<number | null>(null);
  const mobileAutoplayRef = useRef(false);
  const mobileCanAutoplayRef = useRef(false);
  const mobileInteractionRef = useRef(false);
  const mobileResumeTimerRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);

  const [activeSite, setActiveSite] = useState<ShowcaseSite | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sites = websiteShowcase;
  const carouselSites = sites.length > 1 ? [...sites, ...sites, ...sites] : sites;

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

  const updateWheelTransforms = () => {
    const track = trackRef.current;
    if (!track) return;
    const bounds = track.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    let nearestIndex = activeIndexRef.current;
    let nearestDistance = Number.POSITIVE_INFINITY;

    track.querySelectorAll<HTMLElement>(".mockup-slide").forEach((card, index) => {
      const cardBounds = card.getBoundingClientRect();
      const cardCenter = cardBounds.left + cardBounds.width / 2;
      const centerDistance = Math.abs(cardCenter - center);
      const distance = Math.max(-1, Math.min(1, (cardCenter - center) / (bounds.width * 0.52)));
      const depth = Math.abs(distance);
      if (centerDistance < nearestDistance && sites.length > 0) {
        nearestDistance = centerDistance;
        nearestIndex = index % sites.length;
      }
      card.style.setProperty("--wheel-rotate", `${distance * -14}deg`);
      card.style.setProperty("--wheel-y", `${depth * 24}px`);
      card.style.setProperty("--wheel-scale", `${1.04 - depth * 0.16}`);
      card.style.setProperty("--wheel-opacity", `${1 - depth * 0.22}`);
      card.style.zIndex = String(Math.round((1 - depth) * 10));
    });

    const isMobile = window.matchMedia("(max-width: 900px), (any-hover: none)").matches;
    if (isMobile && nearestIndex !== activeIndexRef.current) {
      activeIndexRef.current = nearestIndex;
      setActiveIndex(nearestIndex);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopDirectionalScroll = () => {
    hoverSpeedRef.current = 0;
    trackRef.current?.classList.remove("is-auto-scrolling");
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const getCycleLength = () => {
    const track = trackRef.current;
    if (!track || sites.length < 2) return 0;
    const cards = track.querySelectorAll<HTMLElement>(".mockup-slide");
    return cards[0] && cards[sites.length]
      ? cards[sites.length].offsetLeft - cards[0].offsetLeft
      : track.scrollWidth / 3;
  };

  const normalizeLoopPosition = () => {
    const track = trackRef.current;
    const cycleLength = getCycleLength();
    if (!track || cycleLength <= 0) return;
    if (track.scrollLeft < cycleLength * 0.35) track.scrollLeft += cycleLength;
    else if (track.scrollLeft > cycleLength * 1.65) track.scrollLeft -= cycleLength;
  };

  const runDirectionalScroll = () => {
    const track = trackRef.current;
    if (!track || hoverSpeedRef.current === 0) {
      animationFrameRef.current = null;
      return;
    }

    const cycleLength = getCycleLength();
    if (cycleLength > 0 && hoverSpeedRef.current < 0 && track.scrollLeft <= cycleLength * 0.35) {
      track.scrollLeft += cycleLength;
    }
    track.scrollLeft += hoverSpeedRef.current;
    if (cycleLength > 0 && hoverSpeedRef.current > 0 && track.scrollLeft >= cycleLength * 1.65) {
      track.scrollLeft -= cycleLength;
    }
    updateWheelTransforms();
    animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
  };

  const beginScroll = (speed: number, allowReducedMotion = false) => {
    if (!allowReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    trackRef.current?.classList.add("is-auto-scrolling");
    hoverSpeedRef.current = speed;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
    }
  };

  const startDirectionalScroll = (speed = 1.6) => {
    const hasHover = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
    if (!hasHover) return;
    beginScroll(speed);
  };

  const stopPointerScroll = () => {
    if (mobileAutoplayRef.current) return;
    stopDirectionalScroll();
  };

  const pauseMobileAutoplay = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    if (mobileResumeTimerRef.current !== null) {
      window.clearTimeout(mobileResumeTimerRef.current);
      mobileResumeTimerRef.current = null;
    }
    mobileInteractionRef.current = true;
    mobileAutoplayRef.current = false;
    trackRef.current?.classList.add("is-touching");
    stopDirectionalScroll();
  };

  const scheduleMobileAutoplay = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    mobileInteractionRef.current = false;
    trackRef.current?.classList.remove("is-touching");
    normalizeLoopPosition();
    if (mobileResumeTimerRef.current !== null) window.clearTimeout(mobileResumeTimerRef.current);
    mobileResumeTimerRef.current = window.setTimeout(() => {
      mobileResumeTimerRef.current = null;
      if (!mobileCanAutoplayRef.current || mobileInteractionRef.current || document.hidden) return;
      mobileAutoplayRef.current = true;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      beginScroll(reducedMotion ? 0.4 : 1.1, true);
    }, 2400);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const coarsePointerQuery = window.matchMedia("(any-pointer: coarse), (any-hover: none)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = false;

    const isMobileDevice = () => (
      window.innerWidth <= 1024
      || navigator.maxTouchPoints > 0
      || coarsePointerQuery.matches
    );

    const syncAutoplay = () => {
      const shouldPlay = isVisible && isMobileDevice() && !document.hidden;
      mobileCanAutoplayRef.current = shouldPlay;
      mobileAutoplayRef.current = shouldPlay && !mobileInteractionRef.current;
      if (mobileAutoplayRef.current) {
        beginScroll(reducedMotionQuery.matches ? 0.4 : 1.1, true);
      } else if (!shouldPlay) {
        stopDirectionalScroll();
      }
    };

    const checkCurrentVisibility = () => {
      const bounds = track.getBoundingClientRect();
      isVisible = bounds.top < window.innerHeight + 120 && bounds.bottom > -120;
      syncAutoplay();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncAutoplay();
      },
      { threshold: 0.01, rootMargin: "120px 0px" },
    );

    const handleVisibility = () => syncAutoplay();
    const handleDeviceChange = () => checkCurrentVisibility();
    observer.observe(track);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleDeviceChange);
    coarsePointerQuery.addEventListener("change", handleDeviceChange);
    reducedMotionQuery.addEventListener("change", handleDeviceChange);
    const initialCheckFrame = requestAnimationFrame(() => {
      const cycleLength = getCycleLength();
      if (cycleLength > 0 && track.scrollLeft < cycleLength * 0.35) {
        track.scrollLeft = cycleLength;
      }
      checkCurrentVisibility();
    });

    return () => {
      mobileAutoplayRef.current = false;
      mobileCanAutoplayRef.current = false;
      if (mobileResumeTimerRef.current !== null) window.clearTimeout(mobileResumeTimerRef.current);
      cancelAnimationFrame(initialCheckFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleDeviceChange);
      coarsePointerQuery.removeEventListener("change", handleDeviceChange);
      reducedMotionQuery.removeEventListener("change", handleDeviceChange);
      stopDirectionalScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    hoverSpeedRef.current = direction * (1.6 + proximity * proximity * 2.6);
    track.classList.add("is-auto-scrolling");
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(runDirectionalScroll);
    }
  };

  const handleMotionZoneMove = (event: React.MouseEvent<HTMLDivElement>, direction: -1 | 1) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const rawPosition = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const proximity = direction < 0 ? 1 - rawPosition : rawPosition;
    const speed = direction * (3.6 + proximity * 2.8);
    startDirectionalScroll(speed);
    hoverSpeedRef.current = speed;
  };

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".mockup-slide");
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24;
    const distance = (card?.offsetWidth || track.clientWidth * 0.85) + gap;
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

    if (direction < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    else if (direction > 0 && atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
    else track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const memoizedActiveSite = useMemo(() => activeSite, [activeSite]);

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
            <button type="button" onClick={() => moveCarousel(-1)} aria-label={copy.previous}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label={copy.next}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mockup-stage">
          <div
            className="mockup-motion-zone mockup-motion-zone--left"
            onMouseEnter={() => startDirectionalScroll(-3.5)}
            onMouseMove={(event) => handleMotionZoneMove(event, -1)}
            onMouseLeave={stopPointerScroll}
            aria-hidden="true"
          />
          <div
            ref={trackRef}
            className="mockup-track"
            tabIndex={0}
            aria-label={copy.title}
            onScroll={scheduleWheelUpdate}
            onMouseEnter={() => startDirectionalScroll()}
            onMouseMove={handleMouseMove}
            onMouseLeave={stopPointerScroll}
            onPointerDown={pauseMobileAutoplay}
            onPointerUp={scheduleMobileAutoplay}
            onPointerCancel={scheduleMobileAutoplay}
          >
            {carouselSites.map((site, index) => {
              const isDuplicate = sites.length > 1 && (index < sites.length || index >= sites.length * 2);
              return (
                <div
                  className="mockup-slide"
                  key={`${site.id}-${Math.floor(index / Math.max(sites.length, 1))}`}
                  aria-hidden={isDuplicate || undefined}
                >
                  <button
                    type="button"
                    className="mockup-slide__trigger"
                    tabIndex={isDuplicate ? -1 : undefined}
                    onClick={() => {
                      stopDirectionalScroll();
                      setActiveSite(site);
                    }}
                    aria-label={`${copy.expand}: ${site.copy[language].business}`}
                  >
                    <WebsiteMockupCard site={site} language={language} />
                  </button>
                </div>
              );
            })}
          </div>
          <div
            className="mockup-motion-zone mockup-motion-zone--right"
            onMouseEnter={() => startDirectionalScroll(3.5)}
            onMouseMove={(event) => handleMotionZoneMove(event, 1)}
            onMouseLeave={stopPointerScroll}
            aria-hidden="true"
          />
        </div>

        <div className="mockup-mobile-pagination" aria-label={`${activeIndex + 1} / ${sites.length}`}>
          {sites.map((site, index) => (
            <span key={site.id} className={index === activeIndex ? "is-active" : undefined} aria-hidden="true" />
          ))}
        </div>
      </div>

      {memoizedActiveSite && createPortal(
        <div className="mockup-preview" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setActiveSite(null)}>
          <div className="mockup-preview__panel mockup-preview__panel--page">
            <button type="button" className="mockup-preview__close mockup-preview__close--page" onClick={() => setActiveSite(null)} aria-label={copy.close} autoFocus>
              <X aria-hidden="true" />
            </button>
            <div className="preview-page-frame">
              <WebsitePreviewPage site={memoizedActiveSite} language={language} />
            </div>
            <p className="mockup-preview__notice">{copy.demoNotice}</p>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
