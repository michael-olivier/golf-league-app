import { useEffect, useState } from "react";

const SWIPE_ACTIONS_QUERY = "(hover: none) and (pointer: coarse)";

function readSupportsSwipeActions(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(SWIPE_ACTIONS_QUERY).matches;
}

/** True when the primary input is touch (iOS/Android-style swipe actions). */
export function useSupportsSwipeActions(): boolean {
  const [supports, setSupports] = useState(readSupportsSwipeActions);

  useEffect(() => {
    const media = window.matchMedia(SWIPE_ACTIONS_QUERY);
    const onChange = () => setSupports(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return supports;
}
