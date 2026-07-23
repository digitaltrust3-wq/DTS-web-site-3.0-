import { Button } from "../shared/Button";
import { Mail, ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function CTA() {
  const { copy } = useLanguage();
  const cta = copy.cta;

  return (
    <section id="contact" className="cta-section">
      <div className="wide-shell cta-layout">
        <div className="cta-copy">
          <h2 className="mb-6">{cta.title}</h2>
          <p className="text-slate-200 text-lg">
            {cta.description}
          </p>
        </div>

        <div className="cta-actions">
          <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 px-8 group shadow-lg">
            <Mail className="mr-2 w-5 h-5" />
            {cta.contact}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
            {cta.schedule}
          </Button>
        </div>
      </div>
    </section>
  );
}
