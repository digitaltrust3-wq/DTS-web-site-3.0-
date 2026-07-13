import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const projects = [
  {
    image: "https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2MDcyMjE5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["React Native", "AI/ML", "Cloud"],
  },
  {
    image: "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc2MDY4NjMwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["React", "D3.js", "Node.js"],
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjA2NDI0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Next.js", "PostgreSQL", "AWS"],
  },
];

export function Portfolio() {
  const { copy } = useLanguage();
  const portfolio = copy.portfolio;

  return (
    <section id="portfolio" className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-full mb-4">
            {portfolio.eyebrow}
          </div>
          <h2 className="mb-4">{portfolio.title}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {portfolio.description}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const projectCopy = portfolio.projects[index];
            return (
            <div
              key={projectCopy.title}
              className="hover-card group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="hover-card__image relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={project.image}
                  alt={projectCopy.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm">
                  {projectCopy.category}
                </div>
                
                {/* View project button */}
                <button
                  type="button"
                  aria-label={`${portfolio.viewProject}: ${projectCopy.title}`}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                >
                  <ExternalLink className="w-5 h-5 text-slate-900" aria-hidden="true" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="mb-2 flex items-center justify-between">
                  {projectCopy.title}
                  <ArrowUpRight className="w-5 h-5 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-slate-600 mb-4">{projectCopy.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>
    </section>
  );
}
