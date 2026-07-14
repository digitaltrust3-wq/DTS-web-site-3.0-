import { ImageWithFallback } from "../shared/ImageWithFallback";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function About() {
  const { copy } = useLanguage();
  const about = copy.about;

  return (
    <section className="py-24 px-6 bg-transparent text-white" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-white mb-6">{about.title}</h2>
            <p className="text-slate-200 text-lg mb-6">
              {about.first}
            </p>
            <p className="text-slate-300 mb-8">
              {about.second}
            </p>
            
            <div className="space-y-3">
              {about.highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span className="text-slate-200">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwdGVhbXxlbnwxfHx8fDE3NjA2MTIzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt={about.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-slate-300/20 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
