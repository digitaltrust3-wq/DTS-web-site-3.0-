import { useState } from "react";
import { ArrowRight, Rocket } from "lucide-react";
import { ContactModal } from "../shared/ContactModal";
import { Button } from "../shared/Button";
import { useLanguage } from "../../i18n/LanguageContext";

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
    <section className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(4,10,18,0.88)_38%,rgba(9,18,30,0.32)_72%,rgba(10,18,28,0.12)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-32 pt-40">
        <div className="max-w-3xl -translate-y-4 sm:-translate-y-6 lg:-translate-y-16">
          <h1 className="mb-8 text-white">
            <span className="mb-4 block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text pb-2 text-5xl leading-[1.08] text-transparent md:text-7xl">
              {hero.title}
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-slate-300">
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

          <div className="grid max-w-2xl grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => scrollToSection("portfolio")}
              className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-left backdrop-blur-xl transition-colors hover:border-slate-400 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <div className="mb-1 text-slate-300">250+</div>
              <div className="text-sm text-slate-400">{hero.projects}</div>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("testimonials")}
              className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-left backdrop-blur-xl transition-colors hover:border-slate-400 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <div className="mb-1 text-slate-300">98%</div>
              <div className="text-sm text-slate-400">{hero.satisfaction}</div>
            </button>
            <a
              href={whatsappUrl ?? "#contact"}
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noreferrer" : undefined}
              onClick={(event) => {
                if (whatsappUrl) return;
                event.preventDefault();
                setIsContactOpen(true);
              }}
              className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-left backdrop-blur-xl transition-colors hover:border-slate-400 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <div className="mb-1 text-slate-300">24/7</div>
              <div className="text-sm text-slate-400">{hero.support}</div>
            </a>
          </div>
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </section>
  );
}
