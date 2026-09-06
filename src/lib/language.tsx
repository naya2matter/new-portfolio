"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import enContent from "@/content/en.json";
import arContent from "@/content/ar.json";

export type Locale = "en" | "ar";
export type Content = typeof enContent;

const CONTENT: Record<Locale, Content> = { en: enContent, ar: arContent };
const STORAGE_KEY = "lang";

type LanguageContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  content: Content;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// The `dir` attribute on <html> is the single source of truth — it's set by
// the no-flash script in layout.tsx before React ever runs, same technique
// as ThemeToggle's `dark` class. Subscribing to it via useSyncExternalStore
// (rather than mirroring it into useState from an effect) is what lets the
// very first client render match the server's "en" render exactly, with
// React correcting to the real value right after hydration — no manual
// effect, no flash-inducing setState-in-effect.
function subscribeToLocale(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir"],
  });
  return () => observer.disconnect();
}

function getLocaleSnapshot(): Locale {
  return document.documentElement.dir === "rtl" ? "ar" : "en";
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    applyDocumentLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "ar" : "en");
  }, [locale, setLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      content: CONTENT[locale],
      toggleLocale,
      setLocale,
    }),
    [locale, toggleLocale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

// Fills `{token}` placeholders in a translated string, e.g.
// t("{count} screenshots", { count: 12 }) -> "12 screenshots".
export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}
