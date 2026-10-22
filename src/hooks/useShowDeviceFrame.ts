import { useEffect, useState } from "react";

/** Viewports below this width use full-screen app chrome (no iPhone bezel). */
const DEVICE_FRAME_MIN_WIDTH_PX = 768;

const frameQuery = `(min-width: ${DEVICE_FRAME_MIN_WIDTH_PX}px)`;

function readShowDeviceFrame(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(frameQuery).matches;
}

export function useShowDeviceFrame(): boolean {
  const [showFrame, setShowFrame] = useState(readShowDeviceFrame);

  useEffect(() => {
    const media = window.matchMedia(frameQuery);
    const onChange = () => setShowFrame(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return showFrame;
}
