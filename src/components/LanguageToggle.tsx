"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/language";

// Reads as a switch, not a mystery glyph: both languages are always visible,
// the active one lit and the other dimmed, so it's clear at a glance which
// one you're on AND which one the click will take you to. `dir="ltr"` pins
// the EN|ع order so the pair doesn't mirror itself under the Arabic layout.
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, content, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={content.nav.toggleLanguage}
      dir="ltr"
      className={`group flex h-9 items-center gap-1.5 rounded-full px-2.5 text-foreground transition-colors hover:bg-foreground/5 ${className}`}
    >
      <Languages
        aria-hidden
        className="h-4 w-4 text-muted transition-colors duration-300 group-hover:text-accent"
        strokeWidth={1.75}
      />
      <span className="flex items-center gap-1 font-mono text-[11px] tracking-[0.08em]">
        <span
          className={`transition-colors duration-300 ${
            locale === "en" ? "text-accent" : "text-muted"
          }`}
        >
          EN
        </span>
        <span aria-hidden className="text-muted/50">
          /
        </span>
        <span
          className={`transition-colors duration-300 ${
            locale === "ar" ? "text-accent" : "text-muted"
          }`}
        >
          ع
        </span>
      </span>
    </button>
  );
}
