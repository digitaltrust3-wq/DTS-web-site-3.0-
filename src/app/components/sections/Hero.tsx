import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type PointerEvent,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  Code2,
  Headphones,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { ContactModal } from "../shared/ContactModal";
import { Button } from "../shared/Button";
import { useLanguage } from "../../i18n/LanguageContext";

type HeroMetricCardProps = {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

function useMetricCounter(target: number) {
  const elementRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(target);
  const [isVisible, setIsVisible] = useState(false);

  const setElement = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  const startCounter = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(target);
      return;
    }

    setDisplayValue(0);
    const startedAt = performance.now();
    const duration = 1250;
    const updateCounter = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateCounter);
  }, [target]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setIsVisible(true);
      },
      { threshold: 0.45 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { displayValue, isVisible, setElement, startCounter };
}

function HeroMetricCard({
  value,
  suffix,
  label,
  icon: Icon,
  href,
  target,
  rel,
  onClick,
}: HeroMetricCardProps) {
  const { displayValue, isVisible, setElement, startCounter } = useMetricCounter(value);
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerFrameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
  }, []);

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    startCounter();
    boundsRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !boundsRef.current) return;
    const element = event.currentTarget;
    const bounds = boundsRef.current;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));

    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--metric-glow-x", `${x * 100}%`);
      element.style.setProperty("--metric-glow-y", `${y * 100}%`);
      element.style.setProperty("--metric-rotate-x", `${(0.5 - y) * 4}deg`);
      element.style.setProperty("--metric-rotate-y", `${(x - 0.5) * 5}deg`);
    });
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    const element = event.currentTarget;
    boundsRef.current = null;
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--metric-glow-x", "50%");
      element.style.setProperty("--metric-glow-y", "50%");
      element.style.setProperty("--metric-rotate-x", "0deg");
      element.style.setProperty("--metric-rotate-y", "0deg");
    });
  };

  const className = `hero-metric-card${isVisible ? " is-visible" : ""}`;
  const content = (
    <>
      <span className="hero-metric-card__ambient" aria-hidden="true" />
      <span className="hero-metric-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="hero-metric-card__content" aria-hidden="true">
        <strong>
          {displayValue}
          <span>{suffix}</span>
        </strong>
        <span>{label}</span>
      </span>
      <span className="hero-metric-card__signal" aria-hidden="true" />
      <span className="hero-metric-card__particles" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </>
  );
  const interactionProps = {
    className,
    "aria-label": `${value}${suffix} ${label}`,
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onFocus: startCounter,
  };

  if (href) {
    return (
      <a
        {...interactionProps}
        ref={setElement}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button {...interactionProps} ref={setElement} type="button" onClick={onClick}>
      {content}
    </button>
  );
}

export function Hero() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { copy } = useLanguage();
  const hero = copy.hero;
  const whatsappNumber = String(
    import.meta.env.VITE_WHATSAPP_NUMBER ?? "573184289661",
  ).replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(hero.whatsappMessage)}`
    : null;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-section">
      <div className="hero-shell">
        <div className="hero-layout">
          <div className="hero-copy">
          <h1 className="mb-8 text-white">
            <span className="mb-4 block bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text pb-2 text-5xl leading-[1.08] text-transparent drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] md:text-7xl">
              {hero.title}
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-slate-100 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
            {hero.description}
          </p>

          <div className="mb-12 flex flex-wrap gap-4">
            <Button
              type="button"
              size="lg"
              onClick={() => setIsContactOpen(true)}
              className="group border border-slate-500/30 bg-gradient-to-r from-slate-700 to-slate-600 px-8 text-white shadow-lg shadow-slate-950/50 hover:from-slate-600 hover:to-slate-500"
            >
              {hero.startProject}
              <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("testimonials")}
              className="border-slate-500 bg-black/10 px-8 text-white backdrop-blur-xl transition-all duration-300 hover:border-white hover:bg-gradient-to-r hover:from-slate-300 hover:via-white hover:to-slate-400 hover:text-slate-950 hover:shadow-[0_10px_30px_rgba(203,213,225,0.22)]"
            >
              {hero.viewCases}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          </div>

          <aside className="hero-metrics" aria-label={hero.projects}>
            <HeroMetricCard
              value={250}
              suffix="+"
              label={hero.projects}
              icon={Code2}
              onClick={() => scrollToSection("portfolio")}
            />
            <HeroMetricCard
              value={98}
              suffix="%"
              label={hero.satisfaction}
              icon={BadgeCheck}
              onClick={() => scrollToSection("testimonials")}
            />
            <HeroMetricCard
              value={24}
              suffix="/7"
              label={hero.support}
              icon={Headphones}
              href={whatsappUrl ?? "#contact"}
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noreferrer" : undefined}
              onClick={whatsappUrl ? undefined : (event) => {
                event.preventDefault();
                setIsContactOpen(true);
              }}
            />
          </aside>
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </section>
  );
}
