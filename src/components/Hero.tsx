"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import { CV_FILENAME, SITE_LINKS } from "@/content/media";

function socialIcons(labels: { github: string; email: string }) {
  return [
    {
      label: labels.github,
      href: SITE_LINKS.github,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
          <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.79 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.17.69-3.84-1.35-3.84-1.35-.52-1.3-1.26-1.65-1.26-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.53-.29-5.19-1.27-5.19-5.63 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.34-5.21 5.62.41.36.77 1.05.77 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.2.66.79.55 4.52-1.51 7.78-5.76 7.78-10.78C23.02 5.24 18.27.5 12 .5Z" />
        </svg>
      ),
    },
    {
      label: labels.email,
      href: `mailto:${SITE_LINKS.email}`,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4.5 w-4.5"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLanguage();
  const ROLE_TEXT = content.hero.roleText;
  const SOCIALS = socialIcons({
    github: content.hero.socialGithub,
    email: content.hero.socialEmail,
  });
  const textColRef = useRef<HTMLDivElement>(null);
  const textInnerRef = useRef<HTMLDivElement>(null);
  const photoColRef = useRef<HTMLDivElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        if (typedRef.current) typedRef.current.textContent = ROLE_TEXT;
        return;
      }

      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(items, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
      }).from(
        photoWrapRef.current,
        {
          scale: 0.92,
          opacity: 0,
          filter: "blur(12px)",
          duration: 0.9,
        },
        0.15,
      );

      // Typewriter for the role line: tween a character count and slice.
      const counter = { chars: 0 };
      tl.to(
        counter,
        {
          chars: ROLE_TEXT.length,
          duration: ROLE_TEXT.length * 0.045,
          ease: "none",
          onUpdate: () => {
            if (typedRef.current) {
              typedRef.current.textContent = ROLE_TEXT.slice(
                0,
                Math.round(counter.chars),
              );
            }
          },
        },
        0.5,
      );

      gsap.to(caretRef.current, {
        opacity: 0,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      // Scroll-driven split exit: as the hero scrolls away the text slides out
      // left and the photo out right, so the next section rises into the space
      // they vacate. Deliberately NOT pinned — pinning holds an emptied hero on
      // screen for a full viewport of scrolling, which reads as a dead gap.
      // Targets the grid COLUMNS so mouse parallax (which drives x/y on the
      // inner wrappers) never competes for the same properties.
      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // Completes while the hero still owns roughly the lower half of
          // the screen. Ending at "bottom top" would leave the photo
          // mid-flight, still visible over the next section as it scrolls up.
          end: "bottom 55%",
          // A longer smoothing lag than a plain 1:1 scrub — the slide eases
          // toward the current scroll position instead of tracking it
          // exactly, so it reads as smooth and unhurried in both scroll
          // directions rather than snapping with the wheel.
          scrub: 2.2,
          invalidateOnRefresh: true,
        },
      });

      // Function-based so the two columns always exit toward the side they
      // already sit on: text left / photo right in English, and the mirror of
      // that in Arabic, where the grid itself has swapped them. Re-evaluated
      // on ScrollTrigger.refresh(), which the language effect below fires.
      const exitAway = (sign: number) => () =>
        sign * 110 * (document.documentElement.dir === "rtl" ? -1 : 1);

      exit
        .to(textColRef.current, { xPercent: exitAway(-1), ease: "power2.in" }, 0)
        .to(photoColRef.current, { xPercent: exitAway(1), ease: "power2.in" }, 0)
        .to(
          [textColRef.current, photoColRef.current],
          { opacity: 0, ease: "power1.in" },
          0.25,
        );

      // Mouse parallax on the inner wrappers.
      if (window.matchMedia("(pointer: fine)").matches) {
        const xText = gsap.quickTo(textInnerRef.current, "x", {
          duration: 0.7,
          ease: "power3.out",
        });
        const yText = gsap.quickTo(textInnerRef.current, "y", {
          duration: 0.7,
          ease: "power3.out",
        });
        const xPhoto = gsap.quickTo(photoWrapRef.current, "x", {
          duration: 0.7,
          ease: "power3.out",
        });
        const yPhoto = gsap.quickTo(photoWrapRef.current, "y", {
          duration: 0.7,
          ease: "power3.out",
        });

        const onMove = (event: PointerEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          xText(nx * -26);
          yText(ny * -14);
          xPhoto(nx * 34);
          yPhoto(ny * 20);
        };

        const onLeave = () => {
          xText(0);
          yText(0);
          xPhoto(0);
          yPhoto(0);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerout", onLeave);

        // useGSAP reverts the animations (and their ScrollTriggers) it created
        // in this scope, so only the manual listeners need tearing down here.
        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerout", onLeave);
        };
      }
    },
    { scope: sectionRef },
  );

  // The typewriter above only ever runs once, on mount. If the visitor
  // switches language afterward, the typed span is left showing stale text
  // from the previous locale — this just re-sets it directly, with no replay
  // of the GSAP entrance timeline.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (typedRef.current) typedRef.current.textContent = ROLE_TEXT;

    // The whole section re-flows when the language flips — the columns swap
    // sides, Arabic sets taller, and the hero's own height changes with it.
    // Refreshing re-measures every trigger against the new layout and
    // re-evaluates the direction-aware exit above.
    ScrollTrigger.refresh();
  }, [ROLE_TEXT]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden px-4 pt-4 pb-14 sm:px-6 sm:pt-6"
    >
      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div
          ref={textColRef}
          className="order-2 px-2 text-center lg:order-1 lg:px-0 lg:text-start"
        >
          <div ref={textInnerRef}>
            <p
              data-reveal
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted"
            >
              {content.hero.eyebrow}
            </p>

            <h1
              data-reveal
              data-theme-impact
              className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              {content.hero.greeting}{" "}
              <span className="text-accent">{content.hero.name}</span>
            </h1>

            <p className="mt-2 min-h-[1.75rem] text-lg text-foreground/80">
              <span ref={typedRef} />
              <span
                ref={caretRef}
                aria-hidden
                className="ms-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] bg-accent"
              />
            </p>

            <p
              data-reveal
              className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted lg:mx-0"
            >
              {content.hero.bio}
            </p>

            <div
              data-reveal
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <a
                href={SITE_LINKS.cv}
                download={CV_FILENAME}
                data-theme-impact
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-forest-ink transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                {content.hero.downloadCv}
              </a>
              <a
                href="#projects"
                data-theme-impact
                className="rounded-full border border-(--glass-border) px-6 py-3 text-sm font-medium text-foreground transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-foreground/5 active:translate-y-0 active:scale-95"
              >
                {content.hero.viewWork}
              </a>
            </div>

            <div
              data-reveal
              className="mt-8 flex items-center justify-center gap-3 lg:justify-start"
            >
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  data-theme-impact
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noreferrer noopener"
                      : undefined
                  }
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:text-accent active:scale-90"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={photoColRef}
          className="order-1 mx-auto aspect-square w-64 sm:w-80 lg:order-2 lg:w-full"
        >
          <div ref={photoWrapRef} className="relative h-full w-full">
            <div
              className="blob -inset-6 scale-110 bg-gradient-to-br from-clay/70 via-peach-veil/70 to-eucalyptus-sage/60 opacity-90 dark:from-clay/35 dark:via-peach-veil/20 dark:to-eucalyptus-sage/25"
              aria-hidden
            />
            <div
              className="blob inset-10 bg-clay/50 blur-2xl dark:bg-clay/30"
              aria-hidden
            />
            <div
              data-theme-impact
              className="glass absolute inset-6 overflow-hidden rounded-full p-2 sm:inset-8"
              style={{
                boxShadow:
                  "0 25px 60px -12px rgba(220,162,120,0.5), 0 20px 40px -15px rgba(0,0,0,0.3)",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-white/40 dark:ring-white/10">
                <Image
                  src="/images/hero-photo-placeholder.svg"
                  alt={content.hero.photoAlt}
                  fill
                  sizes="(min-width: 1024px) 24rem, 20rem"
                  className="object-cover brightness-105 dark:brightness-90"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
