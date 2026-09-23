"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Painted backdrops, top of the page to the bottom. Each one fades in over
// the one before it as the visitor scrolls, so the page drifts from the
// leaves (hero) through the blossoms (middle) to the gold ink (contact).
const LAYERS = [
  { src: "/images/bg-leaves.jpg", position: "center" },
  { src: "/images/bg-blossom.jpg", position: "center" },
  { src: "/images/bg-gold.jpg", position: "left center" },
] as const;

// Scroll progress (0–1) at which each later layer starts / finishes fading in.
const FADES: ReadonlyArray<readonly [number, number]> = [
  [0.18, 0.38],
  [0.6, 0.8],
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function AmbientBackdrop() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;

      FADES.forEach(([start, end], i) => {
        const el = layerRefs.current[i + 1];
        if (el) el.style.opacity = String(clamp01((p - start) / (end - start)));
      });

      // Slow drift so the fixed image feels alive without distracting.
      if (!reduce.matches) {
        layerRefs.current.forEach((el) => {
          if (el) el.style.transform = `scale(${1.08 - p * 0.06})`;
        });
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0 will-change-[opacity,transform]"
          style={{ opacity: i === 0 ? 1 : 0, transform: "scale(1.08)" }}
        >
          <Image
            src={layer.src}
            alt=""
            fill
            sizes="100vw"
            preload={i === 0}
            className="object-cover"
            style={{ objectPosition: layer.position }}
          />
        </div>
      ))}

      {/* Readability veil: light in the day theme so the paintings stay
          visible, heavy in dark mode so the gold just glows through. */}
      <div className="backdrop-veil absolute inset-0" />
    </div>
  );
}
