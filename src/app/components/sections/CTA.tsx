import { Button } from "../shared/Button";
import { Mail, ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function CTA() {
  const { copy } = useLanguage();
  const cta = copy.cta;

  return (
    <section id="contact" className="py-24 px-6 bg-slate-950/55 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="mb-6">{cta.title}</h2>
        <p className="text-slate-200 text-lg mb-10">
          {cta.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
