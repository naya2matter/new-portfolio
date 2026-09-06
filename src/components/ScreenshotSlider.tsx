"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage, interpolate } from "@/lib/language";
import type { CarouselItem } from "./DepthCarousel";

interface ScreenshotSliderProps {
  items: CarouselItem[];
  title: string;
}

type Pending = { index: number; dir: 1 | -1; slot: "A" | "B" };

// A plain, flat slider — one screenshot filling the whole pane at a time,
// not DepthCarousel's 3D fanned stack. That component stays available for
// showcase use elsewhere; this one is for actually reading fifty screens of
// a real app, where the arrows should be easy to miss, not the main event.
//
// Only ever mounts two <Image> elements (two alternating slots), not one per
// screenshot — with fifty full-quality shots absolutely positioned in the
// same box, every one of them sits inside the dialog's layout bounds
// regardless of its opacity, so next/image's viewport-based lazy loading
// can't tell the hidden 49 apart from the visible one and fetches all fifty
// at once. Swapping which slot holds "current" avoids that entirely.
export default function ScreenshotSlider({ items, title }: ScreenshotSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const slotARef = useRef<HTMLDivElement>(null);
  const slotBRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  // Which way the image just slid — the caption below borrows this same
  // direction for its own entrance, so the two read as one connected motion
  // instead of the image and its text moving independently.
  const lastDirRef = useRef<1 | -1>(1);
  const count = items.length;
  const { content } = useLanguage();

  const [current, setCurrent] = useState(0);
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");
  const [pending, setPending] = useState<Pending | null>(null);

  const slotAIndex = pending?.slot === "A" ? pending.index : current;
  const slotBIndex = pending?.slot === "B" ? pending.index : current;
  // Reads off the settled index, not the in-flight `pending` one — the text
  // only ever describes whatever screenshot is actually fully in view.
  const activeItem = items[current];
  // Reserving the caption strip is an all-or-nothing call for the whole
  // gallery — otherwise the image area would resize as you slide between a
  // captioned screen and an uncaptioned one.
  const hasCaptions = items.some((item) => item.caption);

  function requestTransition(target: number, dir: 1 | -1) {
    if (pending || target === current || count < 2) return;
    setPending({ index: target, dir, slot: activeSlot === "A" ? "B" : "A" });
  }

  // `requestTransition` no-ops while one is already `pending`, so a second
  // step() call arriving before React commits (a keyboard repeat, a click
  // right after a swipe) is safely dropped rather than racing the first —
  // no functional-update gymnastics needed for what's otherwise a plain
  // "advance by one" read of the current index.
  function step(delta: number) {
    const target = ((current + delta) % count + count) % count;
    requestTransition(target, delta > 0 ? 1 : -1);
  }

  function goTo(target: number) {
    if (target === current) return;
    const forward = ((target - current + count) % count) <= count / 2;
    requestTransition(target, forward ? 1 : -1);
  }

  useGSAP(
    () => {
      if (!pending) return;
      lastDirRef.current = pending.dir;
      const incomingRef = pending.slot === "A" ? slotARef : slotBRef;
      const outgoingRef = pending.slot === "A" ? slotBRef : slotARef;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        setCurrent(pending.index);
        setActiveSlot(pending.slot);
        setPending(null);
        return;
      }

      gsap.set(incomingRef.current, { xPercent: pending.dir * 28, opacity: 0, scale: 1.02 });
      gsap
        .timeline({
          defaults: { duration: 0.5, ease: "power2.inOut" },
          onComplete: () => {
            setCurrent(pending.index);
            setActiveSlot(pending.slot);
            setPending(null);
          },
        })
        .to(outgoingRef.current, { xPercent: -pending.dir * 28, opacity: 0, scale: 0.98 }, 0)
        .to(incomingRef.current, { xPercent: 0, opacity: 1, scale: 1 }, 0);
    },
    { dependencies: [pending], scope: rootRef },
  );

  // Fires once `current` actually lands (same moment the image crossfade
  // above completes), rather than mid-transition — the caption reveals
  // itself right as the new screenshot settles in, instead of racing it.
  // Borrows the image's own travel direction so the two feel like one
  // connected move instead of two independently-timed animations.
  useGSAP(
    () => {
      if (!captionRef.current) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        gsap.set(captionRef.current, { opacity: 1, x: 0 });
        return;
      }
      gsap.fromTo(
        captionRef.current,
        { opacity: 0, x: lastDirRef.current * 14 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      );
    },
    { dependencies: [current], scope: rootRef },
  );

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = { startX: event.clientX, startY: event.clientY, moved: false };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) dragRef.current.moved = true;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    // Only treat it as a swipe if the motion was mostly horizontal — a
    // vertical drag is someone trying to scroll the page, not the slider.
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  }

  return (
    <div
      ref={rootRef}
      className="group/slider flex h-full w-full flex-col touch-pan-y select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label={interpolate(content.projectModal.sliderRegionLabel, { title })}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}
    >
      {/* Image area — its own positioning context, so the arrows/dots below
          center on just this box rather than the caption strip's height too. */}
      <div className="relative min-h-0 flex-1">
        <div
          className="relative h-full w-full cursor-grab overflow-hidden bg-black/20 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div
            ref={slotARef}
            className={`absolute inset-0 ${activeSlot === "A" && !pending ? "opacity-100" : pending?.slot === "A" ? "" : "pointer-events-none opacity-0"}`}
          >
            <Image
              src={items[slotAIndex].image}
              alt={items[slotAIndex].alt || `${title} screenshot ${slotAIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              quality={100}
              className="object-contain"
              priority
              draggable={false}
            />
          </div>
          <div
            ref={slotBRef}
            className={`absolute inset-0 ${activeSlot === "B" && !pending ? "opacity-100" : pending?.slot === "B" ? "" : "pointer-events-none opacity-0"}`}
          >
            <Image
              src={items[slotBIndex].image}
              alt={items[slotBIndex].alt || `${title} screenshot ${slotBIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              quality={100}
              className="object-contain"
              draggable={false}
            />
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={content.projectModal.previousScreenshot}
              className="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/55 text-foreground/70 opacity-60 ring-1 ring-(--glass-border) backdrop-blur-sm transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={content.projectModal.nextScreenshot}
              className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/55 text-foreground/70 opacity-60 ring-1 ring-(--glass-border) backdrop-blur-sm transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex justify-center px-8">
              <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-background/45 px-3 py-2 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={interpolate(content.projectModal.goToScreenshot, { n: i + 1 })}
                    aria-current={i === (pending?.index ?? current)}
                    className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                      i === (pending?.index ?? current)
                        ? "w-5 bg-accent"
                        : "w-1.5 bg-foreground/25 hover:bg-foreground/45"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* A separate, fully opaque strip below the image — never blended with
          whatever colors the screenshot itself happens to have, so the text
          stays legible no matter how dark or busy that screenshot is. */}
      {hasCaptions && (
        <div className="relative shrink-0 border-t border-(--glass-border) bg-background">
          {/* Thin fill tracking position through the set — the same idea as
              the dots above, read at a glance rather than counted one by one. */}
          <div className="h-px w-full bg-(--glass-border)">
            <div
              className="h-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${((current + 1) / count) * 100}%` }}
            />
          </div>

          <div className="mx-auto flex max-w-2xl items-start gap-3.5 px-5 py-4 sm:px-7">
            <span className="mt-0.5 shrink-0 rounded-full bg-accent/12 px-2 py-1 font-mono text-[10px] leading-none font-medium tracking-wide text-accent tabular-nums">
              {String(current + 1).padStart(2, "0")}
              <span className="text-accent/45">/{String(count).padStart(2, "0")}</span>
            </span>
            <div key={current} ref={captionRef} className="min-w-0">
              {activeItem?.label && (
                <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                  {activeItem.label}
                </p>
              )}
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">{activeItem?.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
