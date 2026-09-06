"use client";

import { useEffect } from "react";
import { getUisfxClient } from "@/lib/uisfx/client";
import { isSoundUnlocked, setSoundUnlocked } from "@/lib/uisfx/store";
import { playSfx } from "@/lib/uisfx/play";

/**
 * Any element whose click counts as a genuine "press" — not plain text/card
 * backgrounds.
 */
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "[role='button']",
  "[role='tab']",
  "[role='switch']",
  "input[type='button']",
  "input[type='submit']",
  "input[type='checkbox']",
  "input[type='radio']",
  "select",
].join(", ");

/**
 * Global sound-fx singleton. Mounted once in the root layout. Owns:
 * 1. The first-trusted-interaction unlock required by uisfx's Web Audio
 *    autoplay policy — merged into the same click handler as #2 below so the
 *    very first click both unlocks AND plays its own press sound, instead of
 *    silently arming the AudioContext and only producing sound from the
 *    *second* click onward.
 * 2. A single delegated click listener that plays the "press" cue for any
 *    genuine interactive-element click, site-wide — no per-component wiring.
 *
 * Always renders null.
 */
export function SoundFxInit() {
  // Keyboard-only first interaction (e.g. tabbing without ever clicking)
  // still arms the AudioContext even when no click event follows it.
  useEffect(() => {
    if (isSoundUnlocked()) return;

    const handleUnlock = () => {
      getUisfxClient()
        ?.unlock()
        .then((ok) => {
          if (ok) setSoundUnlocked(true);
        });
    };

    window.addEventListener("keydown", handleUnlock, { once: true });
    return () => window.removeEventListener("keydown", handleUnlock);
  }, []);

  // Global delegated press/click sound. Also unlocks on the very first click
  // (awaited before playing) so that first click can make sound itself,
  // instead of only silently arming the AudioContext for later clicks.
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const target = event.target as Element | null;
      const isInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));

      if (!isSoundUnlocked()) {
        const ok = await getUisfxClient()?.unlock();
        if (ok) setSoundUnlocked(true);
      }

      if (isInteractive) {
        playSfx("press");
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
