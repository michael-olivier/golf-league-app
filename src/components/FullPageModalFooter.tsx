import type { ReactNode } from "react";

/** Row layout for buttons inside `FullPageModal`’s floating footer pill. */
export function FullPageModalFooterRow({ children }: { children: ReactNode }) {
  return <div className="flex w-full gap-1.5">{children}</div>;
}

export const modalFooterBtnSecondary =
  "modal-footer-btn modal-footer-btn--secondary border border-sand-hunter/30";

export const modalFooterBtnPrimary = "modal-footer-btn modal-footer-btn--primary";
