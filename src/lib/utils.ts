import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Arabic-Indic numerals for the Arabic layout. The section eyebrows are
// already written as ٠١ / ٠٢ in ar.json, so leaving every other figure on the
// page in Latin digits reads as two numbering systems fighting each other.
// Locale-driven rather than dir-driven: what a numeral looks like belongs to
// the language, not the writing direction.
export function formatNumber(value: number, locale: string) {
  return locale === "ar" ? value.toLocaleString("ar-EG", { useGrouping: false }) : String(value);
}
