"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Briefcase, GraduationCap } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import { formatNumber } from "@/lib/utils";
import { EXPERIENCE_MEDIA } from "@/content/media";

type Entry = {
  id: string;
  kind: "work" | "education";
  role: string;
  org: string;
  location: string;
  date: string;
  year: string;
  current?: boolean;
  points: string[];
};

// Builds a gently wavy path that still passes exactly through every given
// point — control points alternate to either side of the shared x, so the
// curve bulges outward without ever losing the dots it's meant to connect.
function buildWavePath(points: { x: number; y: number }[], amplitude: number) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dir = i % 2 === 0 ? 1 : -1;
    const c1y = p0.y + (p1.y - p0.y) / 3;
    const c2y = p0.y + (2 * (p1.y - p0.y)) / 3;
    d += ` C ${p0.x + amplitude * dir} ${c1y}, ${p1.x - amplitude * dir} ${c2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const drawPathRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const { content, locale } = useLanguage();

  // Reverse-chronological, like the CV — order comes from EXPERIENCE_MEDIA,
  // words come from content.experience.entries (see en.json / ar.json).
  const ENTRIES: Entry[] = EXPERIENCE_MEDIA.map((media) => ({
    ...media,
    ...content.experience.entries[media.id as keyof typeof content.experience.entries],
  }));

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // The section arrives as one whole envelope, rising into place just
      // before its own contents (including the dots the spine is measured
      // from) start revealing themselves below — a plain transform on a
      // shared ancestor, so it can't desync the spine/dot geometry.
      if (!reduceMotion) {
        gsap.from(sectionRef.current, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 95%" },
        });
      }

      gsap.from("[data-exp-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      // Per-entry triggers — each card and dot animates in as IT crosses the
      // threshold, not all at once when the timeline's container top does.
      gsap.utils.toArray<HTMLElement>("[data-exp-card]").forEach((card) => {
        gsap.from(card, {
          y: 36,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-exp-dot]").forEach((dot) => {
        gsap.from(dot, {
          scale: 0,
          duration: 0.75,
          ease: "back.out(2)",
          scrollTrigger: { trigger: dot, start: "top 90%" },
        });
      });

      // Each non-current dot lights up — ring, icon, and fill all switch to
      // the accent colour — the moment scroll reaches it, and reverts if you
      // scroll back up past it. The "current" dot stays permanently lit.
      dotRefs.current.forEach((dot) => {
        if (!dot || dot.dataset.current === "true") return;
        const icon = dot.querySelector<HTMLElement>("[data-dot-icon]");
        ScrollTrigger.create({
          trigger: dot,
          start: "center 65%",
          onEnter: () => {
            dot.classList.add("bg-accent", "ring-accent");
            dot.classList.remove("bg-background", "ring-(--glass-border)");
            icon?.classList.add("text-forest-ink");
            icon?.classList.remove("text-muted");
          },
          onLeaveBack: () => {
            dot.classList.remove("bg-accent", "ring-accent");
            dot.classList.add("bg-background", "ring-(--glass-border)");
            icon?.classList.remove("text-forest-ink");
            icon?.classList.add("text-muted");
          },
        });
      });

      gsap.to("[data-current-dot]", {
        scale: 1.7,
        opacity: 0.3,
        duration: 1.6,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });

      // The curved spine — measured from the real, laid-out dot positions so
      // it passes exactly through each one regardless of card height or
      // breakpoint, then drawn in as a function of scroll (a real stroke
      // animation, not a scaled straight line).
      let drawTween: gsap.core.Tween | null = null;

      const layoutSpine = () => {
        const container = timelineRef.current;
        const svg = svgRef.current;
        const base = basePathRef.current;
        const draw = drawPathRef.current;
        if (!container || !svg || !base || !draw) return;

        const containerBox = container.getBoundingClientRect();
        const points = dotRefs.current
          .filter((el): el is HTMLSpanElement => !!el)
          .map((el) => {
            const box = el.getBoundingClientRect();
            return {
              x: box.left + box.width / 2 - containerBox.left,
              y: box.top + box.height / 2 - containerBox.top,
            };
          });
        if (points.length < 2) return;

        const amplitude = Math.min(30, containerBox.width * 0.12);
        const d = buildWavePath(points, amplitude);

        svg.setAttribute("viewBox", `0 0 ${containerBox.width} ${containerBox.height}`);
        svg.setAttribute("width", String(containerBox.width));
        svg.setAttribute("height", String(containerBox.height));
        base.setAttribute("d", d);
        draw.setAttribute("d", d);

        const length = draw.getTotalLength();
        drawTween?.scrollTrigger?.kill();
        drawTween?.kill();

        if (reduceMotion) {
          gsap.set(draw, { strokeDasharray: length, strokeDashoffset: 0 });
          return;
        }

        gsap.set(draw, { strokeDasharray: length, strokeDashoffset: length });
        drawTween = gsap.to(draw, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 75%",
            end: "bottom 65%",
            // A longer scrub lag draws the line at a noticeably slower,
            // softer pace than a 1:1 tie to the scroll position.
            scrub: 1.4,
          },
        });
      };

      // A plain macrotask, not rAF: rAF is throttled to near-zero in a
      // backgrounded/inactive tab, so a page opened without focus could sit
      // with an un-drawn spine indefinitely. ResizeObserver then keeps it
      // correct afterward as fonts/content settle the layout.
      const initialLayoutTimer = setTimeout(layoutSpine, 0);
      const resizeObserver = new ResizeObserver(layoutSpine);
      if (timelineRef.current) resizeObserver.observe(timelineRef.current);

      const cleanupFns: (() => void)[] = [
        () => clearTimeout(initialLayoutTimer),
        () => resizeObserver.disconnect(),
      ];

      // Mouse parallax, same technique as the hero: the watermark years
      // drift furthest, the cards drift slightly the other way, so the
      // section reads as layered depth rather than a flat list.
      if (window.matchMedia("(pointer: fine)").matches) {
        const yearMovers = gsap.utils
          .toArray<HTMLElement>("[data-year]")
          .map((el) => ({
            x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
          }));
        const cardMovers = gsap.utils
          .toArray<HTMLElement>("[data-exp-card]")
          .map((el) => ({
            x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
          }));

        const onMove = (event: PointerEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          yearMovers.forEach((m) => {
            m.x(nx * 22);
            m.y(ny * 14);
          });
          cardMovers.forEach((m) => {
            m.x(nx * -14);
            m.y(ny * -9);
          });
        };

        const onLeave = () => {
          [...yearMovers, ...cardMovers].forEach((m) => {
            m.x(0);
            m.y(0);
          });
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerout", onLeave);
        cleanupFns.push(() => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerout", onLeave);
        });
      }

      return () => cleanupFns.forEach((fn) => fn());
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative py-20 lg:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-start">
          <p
            data-exp-reveal
            className="shrink-0 font-mono text-xs tracking-[0.2em] text-muted uppercase"
          >
            {content.experience.eyebrow}
          </p>
          <h2
            data-exp-reveal
            data-theme-impact
            className="font-display text-2xl leading-[1.2] tracking-tight text-foreground sm:text-3xl"
          >
            {content.experience.headline}
          </h2>
        </div>

        {/* Top marker — the spine's starting point. Centred on the same x as
            the line itself at every breakpoint. */}
        <div className="relative mt-10 h-9">
          <span className="absolute start-4 -translate-x-1/2 rtl:translate-x-1/2 lg:start-1/2">
            <span
              data-exp-reveal
              className="glass flex h-9 w-9 items-center justify-center rounded-full text-accent"
            >
              <Briefcase className="h-4 w-4" strokeWidth={2} />
            </span>
          </span>
        </div>

        <div ref={timelineRef} data-timeline className="relative mt-2">
          {/* Curved spine, drawn from the dots' real positions — a static
              hairline plus the scroll-scrubbed accent stroke on top of it. */}
          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            <path
              ref={basePathRef}
              fill="none"
              stroke="var(--glass-border)"
              strokeWidth={1.5}
            />
            <path
              ref={drawPathRef}
              fill="none"
              stroke="var(--clay)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>

          <div className="grid grid-cols-[2rem_1fr] gap-x-6 gap-y-2 lg:grid-cols-[1fr_2.5rem_1fr] lg:gap-x-10 lg:gap-y-3">
            {ENTRIES.map((entry, index) => {
              const onRight = index % 2 === 1;
              return (
                <div key={entry.id} className="contents">
                  {/* Duration label — desktop only, in the column on the
                      opposite side of the spine from the card. Matches the
                      dot's own "pt-7 then a 24px band" positioning exactly,
                      rather than centering on the row (which is as tall as
                      the card and would sit the label well below the dot). */}
                  <div
                    style={{ gridRow: index + 1 }}
                    className={`hidden pt-7 lg:flex ${
                      onRight ? "lg:col-start-1 lg:justify-end" : "lg:col-start-3 lg:justify-start"
                    }`}
                  >
                    <p className="flex h-6 items-center font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                      {entry.date}
                    </p>
                  </div>

                  <div
                    style={{ gridRow: index + 1 }}
                    className="col-start-1 flex justify-center pt-7 lg:col-start-2"
                  >
                    <span
                      ref={(el) => {
                        dotRefs.current[index] = el;
                      }}
                      data-exp-dot
                      data-current={entry.current ? "true" : "false"}
                      className={`relative flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 transition-colors duration-500 ${
                        entry.current ? "ring-accent" : "ring-(--glass-border)"
                      }`}
                    >
                      {entry.current && (
                        <span
                          data-current-dot
                          className="absolute h-2.5 w-2.5 rounded-full bg-accent"
                          aria-hidden
                        />
                      )}
                      {entry.kind === "work" ? (
                        <Briefcase
                          data-dot-icon
                          className={`h-3 w-3 transition-colors duration-500 ${
                            entry.current ? "text-accent" : "text-muted"
                          }`}
                          strokeWidth={2}
                        />
                      ) : (
                        <GraduationCap
                          data-dot-icon
                          className="h-3.5 w-3.5 text-muted transition-colors duration-500"
                          strokeWidth={2}
                        />
                      )}
                    </span>
                  </div>

                  <div
                    style={{ gridRow: index + 1 }}
                    className={`col-start-2 ${onRight ? "lg:col-start-3" : "lg:col-start-1"}`}
                  >
                    <div
                      data-exp-card
                      className="glass relative overflow-hidden rounded-2xl p-5"
                    >
                      <span
                        data-year
                        aria-hidden
                        className={`pointer-events-none absolute -top-3 font-display text-7xl text-foreground/[0.06] select-none sm:text-8xl ${
                          onRight ? "-end-2 lg:end-auto lg:-start-3" : "-end-2"
                        }`}
                      >
                        {formatNumber(Number(entry.year), locale)}
                      </span>

                      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase lg:hidden">
                          {entry.date}
                        </p>
                        {entry.current && (
                          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
                            {content.experience.currentBadge}
                          </span>
                        )}
                      </div>

                      <h3 className="relative mt-2.5 font-display text-lg leading-snug text-foreground sm:text-xl">
                        {entry.role}
                      </h3>
                      <p className="relative mt-1 text-sm text-muted">
                        {entry.org} · {entry.location}
                      </p>

                      <ul className="relative mt-3 space-y-1.5">
                        {entry.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-2.5 text-[13px] leading-relaxed text-muted"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
