import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="py-12 px-6 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <BrandLogo className="mb-5 h-24 w-auto max-w-full" />
            <p className="text-sm">
              Transforming ideas into digital reality with innovative software solutions.
            </p>
          </div>
          
          <div>
            <div className="text-white mb-4">Services</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-slate-300 transition-colors">Web Development</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Mobile Apps</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Cloud Solutions</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Consulting</a></li>
            </ul>
          </div>
          
          <div>
            <div className="text-white mb-4">Company</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-slate-300 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <div className="text-white mb-4">Connect</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; 2026 Digital Trust Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
