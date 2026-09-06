"use client";

/**
 * Call-site helper for semantic cues (press, toggle-on, success, etc).
 * Centralizes the enabled + unlocked gate so individual call sites don't
 * have to duplicate it.
 */

import type { CueName, PlayOptions } from "uisfx";
import { getUisfxClient } from "./client";
import { getSoundEnabledSnapshot, isSoundUnlocked } from "./store";

export function playSfx(cue: CueName, options?: PlayOptions) {
  if (typeof window === "undefined") return;
  if (!isSoundUnlocked() || !getSoundEnabledSnapshot()) return;

  try {
    getUisfxClient()?.play(cue, options);
  } catch {}
}
