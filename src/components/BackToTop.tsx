"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUp } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";

const RING_RADIUS = 17;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Fixed to the viewport rather than living in the footer — a read-progress
// ring only means something if it's visible for the whole scroll journey,
// not just once you've already reached the bottom of the page.
export default function BackToTop() {
  const ringRef = useRef<SVGCircleElement>(null);
  const [visible, setVisible] = useState(false);
  const { content } = useLanguage();

  useGSAP(() => {
    gsap.set(ringRef.current, {
      strokeDasharray: RING_CIRCUMFERENCE,
      strokeDashoffset: RING_CIRCUMFERENCE,
    });

    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        if (ringRef.current) {
          ringRef.current.style.strokeDashoffset = String(
            RING_CIRCUMFERENCE * (1 - self.progress),
          );
        }
        setVisible(self.progress > 0.04);
      },
    });
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <div
      className={`fixed right-5 bottom-5 z-50 transition-all duration-300 ease-out sm:right-8 sm:bottom-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={content.footer.backToTop}
        className="glass relative flex h-11 w-11 items-center justify-center rounded-full text-muted shadow-lg transition-colors hover:text-accent"
      >
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="1.5"
            className="stroke-(--glass-border)"
          />
          <circle
            ref={ringRef}
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-accent"
          />
        </svg>
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background ring-1 ring-(--glass-border)">
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
