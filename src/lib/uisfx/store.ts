"use client";

/**
 * Thin reactive glue around the uisfx client's own `enabled` state, plus a
 * session-only "unlocked" flag — mirrors the read-the-live-source pattern
 * used by ThemeToggle/useLanguage (see lib/language.tsx) rather than
 * duplicating uisfx's own persistence into a second store.
 */

import { getUisfxClient } from "./client";

const listeners = new Set<() => void>();

// Whether the AudioContext has been resumed by a trusted gesture yet this
// page load. Never persisted — it doesn't survive a reload and must be
// re-armed by a fresh click/keydown every time.
let unlocked = false;

export function isSoundUnlocked() {
  return unlocked;
}

export function setSoundUnlocked(next: boolean) {
  unlocked = next;
}

export function getSoundEnabledSnapshot(): boolean {
  return getUisfxClient()?.isEnabled() ?? true;
}

// Matches the server's pre-hydration render — the real value (possibly
// `false`, from a returning visitor's localStorage) is only ever read
// client-side, right after mount, via useSyncExternalStore's own
// mismatch-correcting re-render.
export function getSoundEnabledServerSnapshot(): boolean {
  return true;
}

export function subscribeSoundEnabled(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSoundEnabled(next: boolean) {
  getUisfxClient()?.setEnabled(next);
  listeners.forEach((listener) => listener());
}

export function toggleSoundEnabled() {
  setSoundEnabled(!getSoundEnabledSnapshot());
}
