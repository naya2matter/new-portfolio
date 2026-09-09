"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUp, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { gsap } from "@/lib/gsap";
import { useLanguage, interpolate } from "@/lib/language";
import { formatNumber } from "@/lib/utils";
import { SITE_LINKS } from "@/content/media";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();
  const { content, locale } = useLanguage();

  const SOCIALS = [
    { label: content.hero.socialGithub, href: SITE_LINKS.github, icon: "github" as const },
    { label: content.hero.socialEmail, href: `mailto:${SITE_LINKS.email}`, icon: "mail" as const },
  ];

  useGSAP(
    () => {
      gsap.from("[data-footer-reveal]", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      });

      // The tick draws in from its centre instead of just fading, and the
      // links/icons cascade in one after another a beat after the card
      // itself has settled — a second, finer wave instead of one flat block.
      gsap.from("[data-footer-tick]", {
        scaleX: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      });

      gsap.from("[data-footer-item]", {
        y: 12,
        opacity: 0,
        duration: 0.5,
        delay: 0.25,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      });

      // Mouse-tilt on the glass card — the same technique used on the hero
      // and the experience timeline, so the footer isn't the one static
      // section left on the page.
      if (window.matchMedia("(pointer: fine)").matches && cardRef.current) {
        const card = cardRef.current;
        const setRotateX = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3.out" });
        const setRotateY = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3.out" });

        const onMove = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          setRotateY(px * 4);
          setRotateX(py * -4);
        };
        const onLeave = () => {
          setRotateX(0);
          setRotateY(0);
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        return () => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        };
      }
    },
    { scope: footerRef },
  );

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <footer ref={footerRef} className="relative mt-16 pb-10">
      {/* A short centred flourish instead of a full-width rule — a tick, not
          a border, so nothing curved or edge-to-edge reappears here. */}
      <div className="mb-6 flex justify-center">
        <span
          data-footer-reveal
          data-footer-tick
          aria-hidden
          className="h-1 w-12 rounded-full bg-accent"
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6" style={{ perspective: 900 }}>
        <div
          ref={cardRef}
          data-footer-reveal
          className="glass flex flex-col items-center gap-6 rounded-3xl p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:p-7 sm:text-start"
        >
          <div data-footer-item>
            <a
              href="#home"
              className="font-display text-lg font-medium tracking-tight text-foreground"
            >
              {content.nav.brand}
            </a>
            <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-muted">
              {interpolate(content.footer.rights, { year: formatNumber(year, locale) })}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {content.nav.links.map((link) => (
                <li key={link.id} data-footer-item>
                  <a
                    href={`#${link.id}`}
                    className="text-[13px] text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* `data-footer-item` sits on the wrappers, never on the <a>/<button>
              themselves: GSAP animates opacity/transform on the reveal target,
              and these controls carry a hover transition on those same
              properties. Pointed at one element the two fight every frame and
              can strand it at opacity 0 — which is exactly how these icons
              went missing. Separate elements, separate properties, no race. */}
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <span key={social.label} data-footer-item className="inline-flex">
                <a
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted ring-1 ring-(--glass-border) transition-[color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:text-accent"
                >
                  {social.icon === "github" ? (
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                      <path d={siGithub.path} />
                    </svg>
                  ) : (
                    <Mail className="h-4 w-4" strokeWidth={2} />
                  )}
                </a>
              </span>
            ))}

            <span data-footer-item className="inline-flex">
              <button
                type="button"
                onClick={scrollToTop}
                aria-label={content.footer.backToTop}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted ring-1 ring-(--glass-border) transition-[color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:text-accent"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
