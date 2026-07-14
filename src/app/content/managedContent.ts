import { portfolioSites, type PortfolioSite } from "../data/portfolioSites";
import { translations, type Language } from "../i18n/translations";

export type EditableTranslations = Record<Language, Record<string, unknown>>;

export type ManagedContent = {
  translations: EditableTranslations;
  portfolioSites: PortfolioSite[];
};

export const defaultManagedContent: ManagedContent = JSON.parse(JSON.stringify({
  translations,
  portfolioSites,
}));

function mergeObjects(base: unknown, override: unknown): unknown {
  if (Array.isArray(override)) return override;
  if (!override || typeof override !== "object") return override === undefined ? base : override;
  const baseObject = base && typeof base === "object" && !Array.isArray(base)
    ? base as Record<string, unknown>
    : {};
  const result: Record<string, unknown> = { ...baseObject };
  Object.entries(override as Record<string, unknown>).forEach(([key, value]) => {
    result[key] = mergeObjects(baseObject[key], value);
  });
  return result;
}

export function mergeManagedContent(override: unknown): ManagedContent {
  return mergeObjects(defaultManagedContent, override) as ManagedContent;
}

export async function fetchManagedContent(): Promise<ManagedContent> {
  const response = await fetch(`/api/content?updated=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/json", "Cache-Control": "no-cache" },
  });
  if (!response.ok) throw new Error("Content could not be loaded.");
  return mergeManagedContent(await response.json());
}
