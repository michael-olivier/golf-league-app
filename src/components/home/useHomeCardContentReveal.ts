import { useEffect, useState } from "react";
import {
  HOME_CARD_BASE_DELAY_MS,
  HOME_CARD_RISE_MS,
  HOME_CARD_STAGGER_MS,
} from "./homeMotion";

export function homeCardContentRevealDelayMs(riseIndex: number): number {
  return (
    HOME_CARD_BASE_DELAY_MS + riseIndex * HOME_CARD_STAGGER_MS + HOME_CARD_RISE_MS
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fire when a home pass card finishes its rise-in entrance. */
export function useHomeCardContentReveal(
  playEntrance: boolean,
  riseIndex: number,
): boolean {
  const [revealed, setRevealed] = useState(
    () => !playEntrance || prefersReducedMotion(),
  );

  useEffect(() => {
    if (!playEntrance || prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const delay = homeCardContentRevealDelayMs(riseIndex);
    const id = window.setTimeout(() => setRevealed(true), delay);
    return () => window.clearTimeout(id);
  }, [playEntrance, riseIndex]);

  return revealed;
}
