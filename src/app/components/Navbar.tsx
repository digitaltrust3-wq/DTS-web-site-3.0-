import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { BrandLogo } from "./BrandLogo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <a href="#" aria-label="Digital Trust Solutions home" className="block shrink-0">
            <BrandLogo className="h-12 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-slate-300 hover:text-white transition-colors">
              Services
            </a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#portfolio" className="text-slate-300 hover:text-white transition-colors">
              Portfolio
            </a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">
              Testimonials
            </a>
            <Button asChild className="bg-slate-700 hover:bg-slate-600 border border-slate-600">
              <a href="#contact">Contact Us</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#services" className="block text-slate-300 hover:text-white transition-colors">
              Services
            </a>
            <a href="#about" className="block text-slate-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#portfolio" className="block text-slate-300 hover:text-white transition-colors">
              Portfolio
            </a>
            <a href="#testimonials" className="block text-slate-300 hover:text-white transition-colors">
              Testimonials
            </a>
            <Button asChild className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600">
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
