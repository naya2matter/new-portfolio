/**
 * Lazy singleton wrapper around the `uisfx` player instance.
 *
 * Constructed with `preferences` set, so the library persists pack/volume/
 * enabled to localStorage itself — this file has nothing else to own besides
 * handing back the same instance every time.
 */

import { createUISFX, type UISFXPlayer } from "uisfx";

let instance: UISFXPlayer | null = null;

export function getUisfxClient(): UISFXPlayer | null {
  if (typeof window === "undefined") return null;
  if (!instance) {
    instance = createUISFX({
      pack: "organic",
      volume: 0.5,
      preferences: { key: "portfolio-sound-fx" },
    });
  }
  return instance;
}
