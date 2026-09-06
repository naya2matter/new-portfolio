"use client";

import { useSyncExternalStore } from "react";
import { PullCord } from "pullcord";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";

// The `dark` class on <html> is the single source of truth — it's set by the
// no-flash script in layout.tsx before React ever runs. Subscribing to it
// instead of mirroring it into state keeps the two from drifting apart.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export default function ThemeToggle({ hidden = false }: { hidden?: boolean }) {
  const { content } = useLanguage();
  const dark = useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  function syncThemeColor(next: boolean) {
    const color = next ? "#181b14" : "#fff9e2";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }

  // The pull lands as a visible jolt: every themed surface briefly softens and
  // settles, so the light switch reads as something the page physically felt.
  function playImpact() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("theme-shifting");
    window.setTimeout(() => root.classList.remove("theme-shifting"), 600);

    const targets = gsap.utils.toArray<HTMLElement>("[data-theme-impact]");
    if (!targets.length) return;

    gsap.fromTo(
      targets,
      { scale: 0.972, filter: "blur(3px)" },
      {
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
        stagger: { each: 0.045, from: "start" },
        overwrite: "auto",
        clearProps: "filter,scale",
      },
    );
  }

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    syncThemeColor(next);
    playImpact();
  }

  return (
    <PullCord
      onPull={toggle}
      pulled={dark}
      ariaLabel={content.nav.toggleTheme}
      config={{ gravity: 1250, damping: 0.94, iterations: 20, stretchMax: 26 }}
      className={hidden ? "opacity-0 pointer-events-none" : "opacity-100"}
    />
  );
}
