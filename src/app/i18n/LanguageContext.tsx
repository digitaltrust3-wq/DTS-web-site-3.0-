import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultManagedContent, fetchManagedContent, type ManagedContent } from "../content/managedContent";
import type { PortfolioSite } from "../data/portfolioSites";
import type { Language, SiteCopy } from "./translations";

type LanguageContextValue = {
  language: Language;
  copy: SiteCopy;
  managedContent: ManagedContent;
  portfolioSites: PortfolioSite[];
  refreshContent: () => Promise<void>;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "dts-language";
const CONTENT_CHANNEL = "dts-content-updates";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "es") return saved;
  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [managedContent, setManagedContent] = useState<ManagedContent>(defaultManagedContent);
  const copy = managedContent.translations[language] as SiteCopy;

  const refreshContent = async () => {
    try {
      setManagedContent(await fetchManagedContent());
    } catch {
      // The compiled defaults keep the public site available if the API is offline.
    }
  };

  useEffect(() => {
    void refreshContent();

    const events = new EventSource("/api/content/events");
    events.addEventListener("content-updated", () => void refreshContent());

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CONTENT_CHANNEL) : null;
    if (channel) channel.onmessage = () => void refreshContent();

    const refreshWhenVisible = () => {
      if (!document.hidden) void refreshContent();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      events.close();
      channel?.close();
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

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
      managedContent,
      portfolioSites: managedContent.portfolioSites,
      refreshContent,
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "es" : "en")),
    }),
    [copy, language, managedContent],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
