import { useState, type ComponentType } from "react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { BrandLogo } from "../shared/BrandLogo";
import { ContactModal } from "../shared/ContactModal";
import { useLanguage } from "../../i18n/LanguageContext";

type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  configurationKey: string;
};

export function Footer() {
  const { copy } = useLanguage();
  const footer = copy.footer;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "digital.trust3@gmail.com";
  const socialLinks: SocialLink[] = [
    {
      label: "GitHub",
      href: import.meta.env.VITE_GITHUB_URL || "https://github.com/digitaltrust3-wq",
      icon: Github,
      configurationKey: "VITE_GITHUB_URL",
    },
    {
      label: "LinkedIn",
      href: import.meta.env.VITE_LINKEDIN_URL || "",
      icon: Linkedin,
      configurationKey: "VITE_LINKEDIN_URL",
    },
    {
      label: "X / Twitter",
      href: import.meta.env.VITE_X_URL || "",
      icon: Twitter,
      configurationKey: "VITE_X_URL",
    },
    {
      label: "Email",
      href: contactEmail ? `mailto:${contactEmail}` : "",
      icon: Mail,
      configurationKey: "VITE_CONTACT_EMAIL",
    },
  ];
  const serviceLinkClass = "block rounded-sm py-0.5 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  return (
    <>
      <footer className="footer-section">
        <div className="wide-shell">
          <div className="footer-grid">
            <div>
              <BrandLogo className="mb-5 h-24 w-auto max-w-full" />
              <p className="text-sm">
                {footer.description}
              </p>
            </div>

            <div>
              <a href="#services" className="mb-4 block text-white transition-colors hover:text-slate-300">{footer.services}</a>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className={serviceLinkClass}>{footer.web}</a></li>
                <li><a href="#services" className={serviceLinkClass}>{footer.mobile}</a></li>
                <li><a href="#services" className={serviceLinkClass}>{footer.cloud}</a></li>
                <li><a href="#services" className={serviceLinkClass}>{footer.consulting}</a></li>
              </ul>
            </div>

            <div>
              <div className="mb-4 text-white">{footer.company}</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className={serviceLinkClass}>{footer.about}</a></li>
                <li>
                  <button type="button" onClick={() => setIsContactOpen(true)} className={`${serviceLinkClass} w-full text-left`}>
                    {footer.contact}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4 text-white">{footer.connect}</div>
              <div className="flex gap-4">
                {socialLinks.map(({ label, href, icon: Icon, configurationKey }) => (
                  href ? (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                      className="rounded-sm transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ) : (
                    <span
                      key={label}
                      aria-label={`${label} pendiente de configurar`}
                      title={`Configura ${configurationKey}`}
                      className="cursor-not-allowed opacity-45"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>{footer.rights}</p>
            <a href={`${import.meta.env.BASE_URL}privacy.html`} className="mt-3 inline-block transition-colors hover:text-slate-300">{footer.privacy}</a>
          </div>
        </div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
