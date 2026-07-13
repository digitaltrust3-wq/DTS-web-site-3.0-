import { useState, useEffect } from "react";
import { Globe2, Menu, X } from "lucide-react";
import { Button } from "../shared/Button";
import { BrandLogo } from "../shared/BrandLogo";
import { useLanguage } from "../../i18n/LanguageContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, copy, toggleLanguage } = useLanguage();
  const navCopy = copy.common;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/95 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#" aria-label={navCopy.home} className="block shrink-0">
            <BrandLogo className="h-16 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-slate-300 hover:text-white transition-colors">
              {navCopy.services}
            </a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">
              {navCopy.about}
            </a>
            <a href="#portfolio" className="text-slate-300 hover:text-white transition-colors">
              {navCopy.portfolio}
            </a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">
              {navCopy.testimonials}
            </a>
            <Button asChild className="bg-slate-700 hover:bg-slate-600 border border-slate-600">
              <a href="#contact">{navCopy.contact}</a>
            </Button>
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={navCopy.switchLanguage}
              title={navCopy.switchLanguage}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-950/55 px-2.5 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur-md transition-colors hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? navCopy.closeMenu : navCopy.openMenu}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 space-y-4 rounded-xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
            <a href="#services" className="block text-slate-300 hover:text-white transition-colors">
              {navCopy.services}
            </a>
            <a href="#about" className="block text-slate-300 hover:text-white transition-colors">
              {navCopy.about}
            </a>
            <a href="#portfolio" className="block text-slate-300 hover:text-white transition-colors">
              {navCopy.portfolio}
            </a>
            <a href="#testimonials" className="block text-slate-300 hover:text-white transition-colors">
              {navCopy.testimonials}
            </a>
            <div className="flex items-center gap-3">
              <Button asChild className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600">
                <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>{navCopy.contact}</a>
              </Button>
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={navCopy.switchLanguage}
                title={navCopy.switchLanguage}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-950/70 px-3 text-xs font-semibold tracking-wide text-slate-200"
              >
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
