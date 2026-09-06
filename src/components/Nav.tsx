"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import { SITE_LINKS } from "@/content/media";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";

// Arabic letters join to their neighbours, so slicing a word into per-character
// spans visually shatters it. Latin text rolls character by character; Arabic
// rolls as one whole label instead.
function splitUnits(label: string, perChar: boolean) {
  return perChar ? Array.from(label) : [label];
}

type NavLinkProps = {
  id: string;
  label: string;
  active: boolean;
  perChar: boolean;
  onHover: (el: HTMLAnchorElement) => void;
  register: (id: string, el: HTMLAnchorElement | null) => void;
};

// Each link holds two stacked copies of its label. On hover the resting copy
// rolls up and out while an accent-coloured copy rolls up into its place,
// staggered across the characters — so the label reads as physically flipping
// rather than just changing colour.
function NavLink({ id, label, active, perChar, onHover, register }: NavLinkProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const topRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const units = splitUnits(label, perChar);

  useGSAP(
    () => {
      const top = topRef.current?.querySelectorAll("[data-unit]");
      const bottom = bottomRef.current?.querySelectorAll("[data-unit]");
      if (!top?.length || !bottom?.length) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(bottom, { yPercent: 100 });
        return;
      }

      gsap.set(bottom, { yPercent: 100 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.5 } });
      tl.to(top, { yPercent: -105, stagger: 0.022 }, 0).to(
        bottom,
        { yPercent: 0, stagger: 0.022 },
        0,
      );
      tlRef.current = tl;

      return () => {
        tl.kill();
        tlRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [label, perChar] },
  );

  return (
    <a
      ref={(el) => {
        rootRef.current = el;
        register(id, el);
      }}
      href={`#${id}`}
      onMouseEnter={() => {
        tlRef.current?.play();
        if (rootRef.current) onHover(rootRef.current);
      }}
      onMouseLeave={() => tlRef.current?.reverse()}
      onFocus={() => {
        tlRef.current?.play();
        if (rootRef.current) onHover(rootRef.current);
      }}
      onBlur={() => tlRef.current?.reverse()}
      className="block px-3 py-1.5 text-sm"
    >
      {/* Fixed-height clipping window: the two copies slide through it, and
          nothing spills into the neighbouring links while they travel. */}
      <span className="relative block overflow-hidden leading-[1.35]">
        <span
          ref={topRef}
          className={`flex transition-colors duration-300 ${
            active ? "text-foreground" : "text-muted"
          }`}
        >
          {units.map((unit, i) => (
            <span key={`t-${i}`} data-unit className="inline-block whitespace-pre">
              {unit}
            </span>
          ))}
        </span>
        <span
          ref={bottomRef}
          aria-hidden
          className="absolute inset-0 flex text-accent"
        >
          {units.map((unit, i) => (
            <span key={`b-${i}`} data-unit className="inline-block whitespace-pre">
              {unit}
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  // Keeps the panel mounted through its closing animation instead of
  // vanishing on the same tick `open` flips — `open` drives the animation
  // direction, `mounted` drives whether it's in the DOM at all.
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const linksWrapRef = useRef<HTMLUListElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const linkElsRef = useRef<Partial<Record<string, HTMLAnchorElement | null>>>({});
  const hoveringRef = useRef(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuBackdropRef = useRef<HTMLDivElement>(null);
  const menuTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { content, locale } = useLanguage();
  const links = content.nav.links;

  // `mounted` transitions live here, in the event handlers that change
  // `open`, rather than in an effect derived from it — reduceMotion needs
  // the panel gone from the DOM in the same tick, with no animation to wait
  // on; the animated path still defers unmounting to the GSAP timeline's
  // onComplete below.
  function closeMenu() {
    setOpen(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(false);
    }
  }

  function toggleMenu() {
    const next = !open;
    setOpen(next);
    if (next) {
      setMounted(true);
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(false);
    }
  }

  // Body scroll lock while the sheet is open, without the page jumping when
  // the scrollbar disappears (compensates with matching right padding).
  useEffect(() => {
    if (!open) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // Escape to close, and auto-close if the viewport grows into the desktop
  // breakpoint while the sheet happens to be open (e.g. rotating a tablet).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    const mql = window.matchMedia("(min-width: 768px)");
    function onBreakpoint(e: MediaQueryListEvent) {
      if (e.matches) closeMenu();
    }
    window.addEventListener("keydown", onKeyDown);
    mql.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      mql.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  // Drives the actual open/close animation. `mounted` itself is flipped by
  // closeMenu/toggleMenu above; this effect only runs once the panel is
  // actually in the DOM to animate.
  useEffect(() => {
    if (!mounted) return;
    const panel = menuPanelRef.current;
    const backdrop = menuBackdropRef.current;
    if (!panel || !backdrop) return;

    menuTweenRef.current?.kill();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = panel.querySelectorAll("[data-menu-item]");

    if (open) {
      closeBtnRef.current?.focus({ preventScroll: true });
      if (reduceMotion) {
        gsap.set([backdrop, panel], { opacity: 1 });
        gsap.set(panel, { y: 0, scale: 1 });
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      const tl = gsap.timeline();
      tl.set(panel, { transformOrigin: "top center" })
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0)
        .fromTo(
          panel,
          { opacity: 0, y: -16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
          0,
        )
        .fromTo(
          items,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", stagger: 0.045 },
          0.08,
        );
      menuTweenRef.current = tl;
    } else {
      // reduceMotion already unmounted synchronously in closeMenu/toggleMenu
      // — nothing left to animate.
      if (reduceMotion) return;
      const tl = gsap.timeline({
        onComplete: () => setMounted(false),
      });
      tl.to(panel, { opacity: 0, y: -12, scale: 0.97, duration: 0.22, ease: "power2.in" }, 0).to(
        backdrop,
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        0,
      );
      menuTweenRef.current = tl;
    }

    return () => {
      menuTweenRef.current?.kill();
    };
  }, [open, mounted]);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -32,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.1,
    });
  }, []);

  // A single hairline that travels between links — resting under whichever
  // section is in view, and darting ahead to preview whatever is hovered.
  // Measured from real button positions, so it survives any label width.
  function moveUnderlineTo(target: HTMLElement) {
    const wrap = linksWrapRef.current;
    const line = underlineRef.current;
    if (!wrap || !line) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrapBox = wrap.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();

    gsap.to(line, {
      x: targetBox.left - wrapBox.left + 12,
      width: Math.max(0, targetBox.width - 24),
      opacity: 1,
      duration: reduceMotion ? 0 : 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  // Tracks which section owns the middle band of the viewport, so the
  // underline always has a home even when nobody is hovering.
  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    if (hoveringRef.current || !activeId) return;
    const el = linkElsRef.current[activeId];
    if (el) moveUnderlineTo(el);
  }, [activeId]);

  function onLinkHover(el: HTMLAnchorElement) {
    hoveringRef.current = true;
    moveUnderlineTo(el);
  }

  function onLinksLeave() {
    hoveringRef.current = false;
    const el = activeId ? linkElsRef.current[activeId] : null;
    if (el) {
      moveUnderlineTo(el);
    } else {
      gsap.to(underlineRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }

  return (
    <>
      {/* Sits above everything at rest, but the open mobile sheet (z-40)
          would otherwise have this dangling straight through it — fades out
          for the sheet's lifetime and back in once it's gone. */}
      <ThemeToggle hidden={open} />

      <header className="sticky top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="nav-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-24" aria-hidden />
        <nav
          ref={navRef}
          data-theme-impact
          className="glass flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-3 sm:px-6"
        >
          <a
            href="#home"
            className="font-display text-lg font-medium tracking-tight text-foreground"
          >
            {content.nav.brand}
          </a>

          <ul
            ref={linksWrapRef}
            onMouseLeave={onLinksLeave}
            className="relative hidden items-center gap-1 md:flex"
          >
            {links.map((link) => (
              <li key={link.id}>
                <NavLink
                  id={link.id}
                  label={link.label}
                  active={activeId === link.id}
                  perChar={locale !== "ar"}
                  onHover={onLinkHover}
                  register={(id, el) => {
                    linkElsRef.current[id] = el;
                  }}
                />
              </li>
            ))}

            <span
              ref={underlineRef}
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 h-px w-0 rounded-full bg-accent opacity-0"
            />
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <SoundToggle />
            <a
              href={SITE_LINKS.cv}
              download
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-forest-ink transition active:translate-y-px"
            >
              {content.nav.downloadCv}
            </a>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <SoundToggle />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={toggleMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={content.nav.toggleMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ease-out ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current transition-opacity duration-200 ease-out ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ease-out ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {mounted && (
        <>
          {/* Dismiss tap target behind the sheet — covers the viewport so a
              tap anywhere outside the panel closes the menu. */}
          <div
            ref={menuBackdropRef}
            aria-hidden
            onClick={closeMenu}
            className="fixed inset-0 z-30 bg-background/60 opacity-0 backdrop-blur-sm md:hidden"
          />
          <div
            id="mobile-menu"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={content.nav.toggleMenu}
            className="fixed inset-x-4 top-[4.75rem] z-40 opacity-0 sm:inset-x-6 md:hidden"
          >
            <div className="glass flex flex-col gap-1 rounded-3xl p-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  data-menu-item
                  href={`#${link.id}`}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/20"
                >
                  {link.label}
                </a>
              ))}
              <a
                data-menu-item
                href={SITE_LINKS.cv}
                download
                onClick={closeMenu}
                className="mt-2 rounded-full bg-accent px-4 py-2.5 text-center text-sm font-medium text-forest-ink"
              >
                {content.nav.downloadCv}
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
