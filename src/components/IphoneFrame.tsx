import type { ReactNode } from "react";

interface IphoneFrameProps {
  children: ReactNode;
}

export function IphoneFrame({ children }: IphoneFrameProps) {
  return (
    <div className="device-showcase">
      <div className="iphone-frame" aria-hidden={false}>
        <div className="iphone-side-button iphone-side-button--silent" />
        <div className="iphone-side-button iphone-side-button--volume-up" />
        <div className="iphone-side-button iphone-side-button--volume-down" />
        <div className="iphone-side-button iphone-side-button--power" />
        <div className="iphone-screen">
          <div className="iphone-island" aria-hidden />
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
        <div className="iphone-home-indicator" aria-hidden />
      </div>
    </div>
  );
}
