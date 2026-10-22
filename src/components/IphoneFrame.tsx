import type { ReactNode } from "react";
import { useShowDeviceFrame } from "../hooks/useShowDeviceFrame";

/** Portal target for overlays (bottom sheets) scoped to the phone screen. */
export const IPHONE_OVERLAY_ROOT_ID = "iphone-overlay-root";

interface IphoneFrameProps {
  children: ReactNode;
}

function AppViewport({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
      <div
        id={IPHONE_OVERLAY_ROOT_ID}
        className="pointer-events-none absolute inset-0 z-50 overflow-hidden [&>*]:pointer-events-auto"
      />
    </div>
  );
}

export function IphoneFrame({ children }: IphoneFrameProps) {
  const showFrame = useShowDeviceFrame();

  if (!showFrame) {
    return (
      <div className="device-native flex min-h-dvh flex-col bg-fairway-950">
        <AppViewport>{children}</AppViewport>
      </div>
    );
  }

  return (
    <div className="device-showcase">
      <div className="iphone-frame" aria-hidden={false}>
        <div className="iphone-side-button iphone-side-button--silent" />
        <div className="iphone-side-button iphone-side-button--volume-up" />
        <div className="iphone-side-button iphone-side-button--volume-down" />
        <div className="iphone-side-button iphone-side-button--power" />
        <div className="iphone-screen">
          <div className="iphone-island" aria-hidden />
          <AppViewport>{children}</AppViewport>
        </div>
        <div className="iphone-home-indicator" aria-hidden />
      </div>
    </div>
  );
}
