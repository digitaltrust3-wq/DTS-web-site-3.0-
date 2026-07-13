import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { BrandLogo } from "../shared/BrandLogo";
import { useLanguage } from "../../i18n/LanguageContext";

export function Footer() {
  const { copy } = useLanguage();
  const footer = copy.footer;

  return (
    <footer className="py-12 px-6 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <BrandLogo className="mb-5 h-24 w-auto max-w-full" />
            <p className="text-sm">
              {footer.description}
            </p>
          </div>
          
          <div>
            <div className="text-white mb-4">{footer.services}</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.web}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.mobile}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.cloud}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.consulting}</a></li>
            </ul>
          </div>
          
          <div>
            <div className="text-white mb-4">{footer.company}</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.about}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.careers}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.blog}</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">{footer.contact}</a></li>
            </ul>
          </div>
          
          <div>
            <div className="text-white mb-4">{footer.connect}</div>
            <div className="flex gap-4">
              <a href="#" aria-label="GitHub" className="hover:text-slate-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-slate-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="X / Twitter" className="hover:text-slate-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Email" className="hover:text-slate-300 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
