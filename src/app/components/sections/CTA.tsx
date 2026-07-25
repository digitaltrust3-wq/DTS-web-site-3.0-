import { Button } from "../shared/Button";
import { Mail, ArrowRight, CalendarDays } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useState } from "react";
import { ContactModal } from "../shared/ContactModal";
import { SchedulingModal } from "../shared/SchedulingModal";

export function CTA() {
  const { copy } = useLanguage();
  const cta = copy.cta;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);

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
          <Button type="button" size="lg" onClick={() => setIsContactOpen(true)} className="bg-white text-slate-800 hover:bg-slate-100 px-8 group shadow-lg">
            <Mail className="mr-2 w-5 h-5" />
            {cta.contact}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button type="button" size="lg" onClick={() => setIsSchedulingOpen(true)} className="bg-white text-slate-800 hover:bg-slate-100 px-8 group shadow-lg">
            <CalendarDays className="mr-2 w-5 h-5" />
            {cta.schedule}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <SchedulingModal isOpen={isSchedulingOpen} onClose={() => setIsSchedulingOpen(false)} />
    </section>
  );
}
