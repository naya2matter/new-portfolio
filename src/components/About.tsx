"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import StaggeredText from "./StaggeredText";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLanguage();
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
                  counter.textContent = String(Math.round(ticker.value));
                },
              },
              0,
            );
          }
        });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative px-4 pt-10 pb-20 sm:px-6 lg:pt-14 lg:pb-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-6 lg:text-left">
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
              {META.map((item) => (
                <div key={item.label}>
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
            {METRICS.map((metric) => (
              <div
                key={metric.label}
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
                      0
                    </span>
                    {metric.suffix && (
                      <span
                        className={
                          metric.suffix === "+"
                            ? "font-display text-2xl leading-none text-accent"
                            : "ml-0.5 self-center font-mono text-[10px] text-muted"
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
