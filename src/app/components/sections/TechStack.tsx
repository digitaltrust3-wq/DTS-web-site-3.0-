import { ImageWithFallback } from "../shared/ImageWithFallback";
import { useLanguage } from "../../i18n/LanguageContext";

const technologies = [
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "TypeScript",
  "GraphQL",
];

export function TechStack() {
  const { copy } = useLanguage();
  const techCopy = copy.tech;

  return (
    <section className="content-section content-section--tech">
      <div className="wide-shell">
        <div className="content-split content-split--tech">
          <div className="content-media order-2 lg:order-1">
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjA2NDkxODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={techCopy.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-slate-700/20 rounded-2xl -z-10"></div>
            </div>
          </div>
          
          <div className="content-copy order-1 lg:order-2">
            <h2 className="text-slate-300 mb-6">{techCopy.title}</h2>
            <p className="text-slate-300 text-lg mb-8">
              {techCopy.description}
            </p>
            
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-700 transition-colors"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
