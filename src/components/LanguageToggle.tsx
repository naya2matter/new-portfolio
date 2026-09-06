"use client";

import { useLanguage } from "@/lib/language";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, content, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={content.nav.toggleLanguage}
      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-mono text-xs tracking-[0.08em] text-foreground transition-colors hover:text-accent ${className}`}
    >
      {locale === "en" ? "عربي" : "EN"}
    </button>
  );
}
