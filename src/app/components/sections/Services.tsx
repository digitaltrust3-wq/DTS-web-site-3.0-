import {
  useEffect,
  useRef,
  type FocusEvent,
  type PointerEvent,
} from "react";
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
import services from "../../data/services.json";
import { useLanguage } from "../../i18n/LanguageContext";

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
  const gridRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const boundsRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".service-card"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      cards.forEach((card) => card.classList.add("is-revealed", "is-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          card.classList.toggle("is-in-view", entry.isIntersecting);
          if (entry.isIntersecting) card.classList.add("is-revealed");
        });
      },
      { rootMargin: "5% 0px -8%", threshold: 0.16 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (pointerFrameRef.current !== null) {
        cancelAnimationFrame(pointerFrameRef.current);
      }
    },
    [],
  );

  const activateCard = (card: HTMLElement) => {
    if (activeCardRef.current && activeCardRef.current !== card) {
      activeCardRef.current.classList.remove("is-active");
    }

    activeCardRef.current = card;
    card.classList.add("is-active");
    gridRef.current?.classList.add("has-active-card");
  };

  const deactivateCard = (card: HTMLElement) => {
    card.classList.remove("is-active");
    if (activeCardRef.current === card) activeCardRef.current = null;
    if (!activeCardRef.current) gridRef.current?.classList.remove("has-active-card");
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const card = event.currentTarget;
    boundsRef.current = card.getBoundingClientRect();
    activateCard(card);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !boundsRef.current) return;

    const card = event.currentTarget;
    const bounds = boundsRef.current;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const tiltRange = window.matchMedia("(max-width: 900px)").matches ? 4 : 8;

    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--pointer-x", `${x * 100}%`);
      card.style.setProperty("--pointer-y", `${y * 100}%`);
      card.style.setProperty("--service-tilt-x", `${(0.5 - y) * tiltRange}deg`);
      card.style.setProperty("--service-tilt-y", `${(x - 0.5) * tiltRange}deg`);
      card.style.setProperty("--service-image-x", `${(0.5 - x) * 8}px`);
      card.style.setProperty("--service-image-y", `${(0.5 - y) * 8}px`);
      pointerFrameRef.current = null;
    });
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    boundsRef.current = null;
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "50%");
      card.style.setProperty("--service-tilt-x", "0deg");
      card.style.setProperty("--service-tilt-y", "0deg");
      card.style.setProperty("--service-image-x", "0px");
      card.style.setProperty("--service-image-y", "0px");
      pointerFrameRef.current = null;
    });

    if (!card.contains(document.activeElement)) deactivateCard(card);
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    activateCard(event.currentTarget);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    deactivateCard(event.currentTarget);
  };

  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="services-shell">
        <header className="services-heading">
          <p className="services-eyebrow">{serviceCopy.eyebrow}</p>
          <h2 id="services-title">{serviceCopy.title}</h2>
          <p>{serviceCopy.description}</p>
        </header>

        <div className="services-grid" ref={gridRef}>
          {services.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Code2;
            const item = serviceCopy.items[service.id as keyof typeof serviceCopy.items];

            return (
              <article
                className="service-card"
                key={service.id}
                tabIndex={0}
                onPointerEnter={handlePointerEnter}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <div className="service-card__surface">
                  <img
                    className="service-card__image"
                    src={`${import.meta.env.BASE_URL}${service.image.replace(/^\//, "")}`}
                    alt={serviceCopy.imageAlt}
                    loading="lazy"
                    decoding="async"
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
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
