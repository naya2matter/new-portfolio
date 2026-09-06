"use client";

import { useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { Volume2, VolumeX } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language";
import {
  getSoundEnabledServerSnapshot,
  getSoundEnabledSnapshot,
  subscribeSoundEnabled,
  toggleSoundEnabled,
} from "@/lib/uisfx/store";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const { content } = useLanguage();
  const enabled = useSyncExternalStore(
    subscribeSoundEnabled,
    getSoundEnabledSnapshot,
    getSoundEnabledServerSnapshot,
  );
  const onIconRef = useRef<SVGSVGElement>(null);
  const offIconRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  // Only a real click should animate the swap — the very first render, and
  // the hydration correction right after it (server default → real stored
  // value), both need to land silently in their final state.
  const userInitiatedRef = useRef(false);

  useGSAP(
    () => {
      const showIcon = enabled ? onIconRef.current : offIconRef.current;
      const hideIcon = enabled ? offIconRef.current : onIconRef.current;
      const animate = userInitiatedRef.current;
      userInitiatedRef.current = false;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!animate || reduceMotion) {
        gsap.set(showIcon, { opacity: 1, scale: 1, rotate: 0 });
        gsap.set(hideIcon, { opacity: 0, scale: 0.4, rotate: 0 });
        gsap.set(ringRef.current, { scale: 1, opacity: 0 });
        return;
      }

      gsap.to(hideIcon, {
        opacity: 0,
        scale: 0.4,
        rotate: -40,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.fromTo(
        showIcon,
        { opacity: 0, scale: 0.4, rotate: 40 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.6)", delay: 0.07 },
      );

      // A quiet ring blips outward from the icon and fades — the one bit of
      // flourish this gets, reserved for an actual toggle rather than every
      // render, so it reads as a deliberate confirmation, not decoration.
      gsap.fromTo(
        ringRef.current,
        { scale: 0.6, opacity: 0.35 },
        { scale: 1.6, opacity: 0, duration: 0.5, ease: "power2.out" },
      );
    },
    { dependencies: [enabled] },
  );

  const label = enabled ? content.nav.muteSound : content.nav.unmuteSound;

  function handleClick() {
    userInitiatedRef.current = true;
    toggleSoundEnabled();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-foreground/5 active:scale-90 ${
        enabled ? "text-foreground" : "text-muted"
      } ${className}`}
    >
      <span
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute h-6 w-6 rounded-full bg-accent/30 opacity-0"
      />
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Volume2
          ref={onIconRef}
          aria-hidden
          className="absolute h-4 w-4"
          strokeWidth={2}
        />
        <VolumeX
          ref={offIconRef}
          aria-hidden
          className="absolute h-4 w-4"
          strokeWidth={2}
        />
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
