import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "./translations";

type LanguageContextValue = {
  language: Language;
  copy: (typeof translations)[Language];
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "dts-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "es") return saved;
  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const copy = translations[language];

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.title = copy.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.meta.description);
  }, [copy.meta.description, copy.meta.title, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      copy,
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "es" : "en")),
    }),
    [copy, language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
