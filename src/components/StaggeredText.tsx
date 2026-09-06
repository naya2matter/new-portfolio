"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

type StaggeredTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  splitBy?: "words" | "lines" | "chars";
  // ScrollTrigger "start" for this element specifically — each instance
  // measures from its own position, so stacking several one after another
  // in a page sequences them for free with no extra delay to tune.
  start?: string;
  stagger?: number;
  duration?: number;
  blur?: number;
  // Passed straight through to the rendered tag — e.g. `data-theme-impact`
  // so ThemeToggle's jolt animation still picks this element up.
  [dataAttr: `data-${string}`]: unknown;
};

// A flexible staggered-reveal text component: each word (or line/character)
// lifts into place with a blur-to-sharp resolve as it scrolls into view.
// Built on GSAP's SplitText — bundled free with gsap since v3.13, already
// used elsewhere in this project — rather than a separate paid dependency.
export default function StaggeredText({
  text,
  as = "p",
  className,
  splitBy = "words",
  start = "top 80%",
  stagger = 0.06,
  duration = 1,
  blur = 10,
  ...rest
}: StaggeredTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion || !ref.current) return;

      const split = SplitText.create(ref.current, {
        type: splitBy,
        mask: splitBy,
        autoSplit: true,
        onSplit: (self) => {
          const targets =
            splitBy === "words" ? self.words : splitBy === "chars" ? self.chars : self.lines;
          return gsap.from(targets, {
            yPercent: 110,
            opacity: 0,
            filter: `blur(${blur}px)`,
            duration,
            stagger,
            ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start },
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [text, splitBy, start, stagger, duration, blur] },
  );

  const Tag = as;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polymorphic tag needs a loosened ref type
    <Tag ref={ref as any} className={className} {...rest}>
      {text}
    </Tag>
  );
}
