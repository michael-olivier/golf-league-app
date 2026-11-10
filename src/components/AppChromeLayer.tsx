import type { ReactNode } from "react";

/**
 * Top chrome (notifications, menu) positioned inside the phone viewport.
 * Uses absolute positioning so controls stay on-screen in the device frame
 * (viewport `fixed` would anchor to the browser window instead).
 */
export function AppChromeLayer({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[45] overflow-visible [&>*]:pointer-events-auto"
      aria-hidden={false}
    >
      {children}
    </div>
  );
}
