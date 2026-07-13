import { Star, Quote } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function Testimonials() {
  const { copy } = useLanguage();
  const testimonials = copy.testimonials;

  return (
    <section id="testimonials" className="py-24 px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-slate-500/20 border border-slate-400/30 text-slate-200 rounded-full mb-4">
            {testimonials.eyebrow}
          </div>
          <h2 className="mb-4">{testimonials.title}</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {testimonials.description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.items.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-slate-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <Quote className="w-10 h-10 text-slate-400/30 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-slate-300 mb-6 italic">"{testimonial.content}"</p>
              
              <div className="pt-4 border-t border-slate-700">
                <div className="text-white">{testimonial.name}</div>
                <div className="text-slate-400 text-sm">{testimonial.role}</div>
              </div>
              
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-bl-full blur-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
