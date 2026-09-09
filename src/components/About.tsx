"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import { formatNumber } from "@/lib/utils";
import StaggeredText from "./StaggeredText";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  // The metric timelines, kept so the language effect below can replay them.
  const metricsRef = useRef<{ card: HTMLElement; tl: gsap.core.Timeline }[]>([]);
  const { content, locale } = useLanguage();
  const HEADLINE = content.about.headline;
  const METRICS = content.about.metrics;
  const META = content.about.meta;

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // The section arrives as one whole envelope, rising into place just
      // before its own contents start revealing themselves below — every
      // later threshold in this file is "top 90%" or later, so "top 95%"
      // always fires first.
      if (!reduceMotion) {
        gsap.from(sectionRef.current, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 95%" },
        });
      }

      const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
      const arcs = gsap.utils.toArray<SVGCircleElement>("[data-arc]");

      if (reduceMotion) {
        counters.forEach((el) => {
          el.textContent = el.dataset.count ?? "";
        });
        arcs.forEach((arc) => arc.setAttribute("stroke-dashoffset", "0"));
        return;
      }

      // Headline and body copy now animate themselves — see StaggeredText,
      // used in the JSX below.

      gsap.from("[data-about-reveal]", {
        y: 26,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
      });

      // Rings draw themselves while the figure ticks up to its real value.
      metricsRef.current = [];
      gsap.utils
        .toArray<HTMLElement>("[data-metric]")
        .forEach((card, index) => {
          const arc = card.querySelector<SVGCircleElement>("[data-arc]");
          const counter = card.querySelector<HTMLElement>("[data-count]");
          const target = Number(counter?.dataset.count ?? 0);

          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 92%" },
            delay: index * 0.08,
          });

          if (arc) {
            tl.to(arc, {
              strokeDashoffset: 0,
              duration: 1.1,
              ease: "power2.inOut",
            });
          }

          if (counter) {
            const ticker = { value: 0 };
            tl.to(
              ticker,
              {
                value: target,
                duration: 1.1,
                ease: "power2.out",
                onUpdate: () => {
                  // Reads the live document language rather than the `locale`
                  // captured when this timeline was built, so a replay after a
                  // language switch writes the right numeral system.
                  counter.textContent = formatNumber(
                    Math.round(ticker.value),
                    document.documentElement.lang === "ar" ? "ar" : "en",
                  );
                },
              },
              0,
            );
          }

          metricsRef.current.push({ card, tl });
        });
    },
    { scope: sectionRef },
  );

  // A language switch re-renders these cards, and the arc's dash offset is an
  // inline style in the JSX below — so React paints every ring back to empty
  // and every figure back to zero. The scroll trigger that filled them has
  // already fired and won't fire again, which left them sitting blank.
  const localeSettledRef = useRef(false);
  useEffect(() => {
    if (!localeSettledRef.current) {
      localeSettledRef.current = true;
      return;
    }

    metricsRef.current.forEach(({ card, tl }) => {
      const box = card.getBoundingClientRect();
      const onScreen = box.top < window.innerHeight * 0.92 && box.bottom > 0;

      if (onScreen) {
        // Watching it count up again is the nicer answer while you're looking
        // straight at it — and it re-counts in the new numeral system.
        tl.restart();
      } else if (tl.progress() === 1) {
        // Out of sight: just re-apply the finished state, no animation to see.
        tl.progress(0);
        tl.progress(1);
      }
    });
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative px-4 pt-10 pb-20 sm:px-6 lg:pt-14 lg:pb-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-start">
          <p
            data-about-reveal
            className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted"
          >
            {content.about.eyebrow}
          </p>
          <StaggeredText
            as="h2"
            text={HEADLINE}
            data-theme-impact
            className="max-w-2xl font-display text-2xl leading-[1.2] tracking-tight text-foreground sm:text-3xl"
            splitBy="words"
            start="top 78%"
            duration={1}
            stagger={0.09}
            blur={12}
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="max-w-xl space-y-4">
            <StaggeredText
              as="p"
              text={content.about.paragraphs[0]}
              className="text-[15px] leading-relaxed text-foreground/85"
              splitBy="words"
              start="top 72%"
              duration={0.9}
              stagger={0.035}
              blur={8}
            />
            <StaggeredText
              as="p"
              text={content.about.paragraphs[1]}
              className="text-[15px] leading-relaxed text-muted"
              splitBy="words"
              start="top 68%"
              duration={0.9}
              stagger={0.035}
              blur={8}
            />

            <dl
              data-about-reveal
              className="flex flex-wrap gap-x-8 gap-y-3 pt-2"
            >
              {META.map((item, index) => (
                <div key={index}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Compact 2x2 so the figures sit beside the bio instead of adding
              another full-width band below it. */}
          <div
            data-about-reveal
            data-theme-impact
            className="glass grid h-fit grid-cols-2 gap-x-4 gap-y-6 rounded-3xl p-6 sm:gap-x-8"
          >
            {METRICS.map((metric, index) => (
              <div
                // Keyed by position, NOT by the label: the labels are
                // translated, so a label key makes React discard every card on
                // a language switch and mount fresh ones — which leaves the
                // ring timelines below animating nodes that are no longer in
                // the document, and the visible cards blank.
                key={index}
                data-metric
                className="flex items-center gap-3"
              >
                <div className="relative h-[76px] w-[76px] shrink-0">
                  <svg
                    viewBox="0 0 80 80"
                    className="h-full w-full -rotate-90"
                    aria-hidden
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r={RADIUS}
                      fill="none"
                      strokeWidth="3"
                      className="stroke-foreground/10"
                    />
                    <circle
                      data-arc
                      cx="40"
                      cy="40"
                      r={RADIUS}
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="stroke-accent"
                      style={{
                        strokeDasharray: CIRCUMFERENCE,
                        strokeDashoffset: CIRCUMFERENCE,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      data-count={metric.value}
                      className="font-display text-2xl leading-none text-foreground"
                    >
                      {formatNumber(0, locale)}
                    </span>
                    {metric.suffix && (
                      <span
                        className={
                          metric.suffix === "+"
                            ? "font-display text-2xl leading-none text-accent"
                            : "ms-0.5 self-center font-mono text-[10px] text-muted"
                        }
                      >
                        {metric.suffix}
                      </span>
                    )}
                  </div>
                </div>
                <p className="min-w-0 text-xs leading-snug text-muted">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
