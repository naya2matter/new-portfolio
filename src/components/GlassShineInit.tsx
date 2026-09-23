"use client";

import { useEffect } from "react";

// Feeds the cursor position into every `.glass-shine` card as --mx / --my so
// the CSS light spot and gold rim (see globals.css) follow the mouse. One
// delegated listener covers every card, including ones mounted later
// (filtered projects, the modal). Mouse only — touch has no hover to track.
export function GlassShineInit() {
  useEffect(() => {
    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${x - rect.left}px`);
      el.style.setProperty("--my", `${y - rect.top}px`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(".glass-shine");
      if (!el) return;
      pending = { el, x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
