import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { SoundFxInit } from "@/components/SoundFxInit";
import enContent from "@/content/en.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Arabic-script counterparts to the Latin sans/display pair above — swapped
// in via the `[dir="rtl"]` rule in globals.css, not `subsets`, since Geist
// and Fraunces have no Arabic glyphs to extend.
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: enContent.meta.title,
  description: enContent.meta.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9e2" },
    { media: "(prefers-color-scheme: dark)", color: "#181b14" },
  ],
};

const noFlashThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

// Sets lang/dir before paint so a returning Arabic-preferring visitor never
// sees a flash of the LTR layout — mirrors the theme script above. The
// React-rendered CONTENT itself still starts as English and swaps client-side
// (see LanguageProvider); only the direction/font shell is fixed this early.
const noFlashLangScript = `
(function () {
  try {
    var stored = localStorage.getItem("lang");
    var lang = stored === "ar" ? "ar" : "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${cairo.variable} ${amiri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
        <script dangerouslySetInnerHTML={{ __html: noFlashLangScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <SoundFxInit />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
