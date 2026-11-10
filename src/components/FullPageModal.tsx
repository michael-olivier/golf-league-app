import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IPHONE_OVERLAY_ROOT_ID } from "./IphoneFrame";

const PANEL_EXIT_MS = 280;

interface FullPageModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode | ((requestClose: () => void) => ReactNode);
}

export function FullPageModal({
  open,
  onClose,
  children,
  footer,
}: FullPageModalProps) {
  const [phase, setPhase] = useState<"open" | "closing" | "closed">(() =>
    open ? "open" : "closed",
  );

  const requestClose = useCallback(() => {
    setPhase((current) => (current === "open" ? "closing" : current));
  }, []);

  useEffect(() => {
    if (open && phase === "closed") setPhase("open");
  }, [open, phase]);

  useEffect(() => {
    if (open || phase !== "open") return;
    requestClose();
  }, [open, phase, requestClose]);

  useEffect(() => {
    if (phase !== "closing") return;
    const t = window.setTimeout(() => {
      setPhase("closed");
      onClose();
    }, PANEL_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [phase, onClose]);

  useEffect(() => {
    if (phase === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "closed") return null;

  const phoneRoot = document.getElementById(IPHONE_OVERLAY_ROOT_ID);
  const portalTarget = phoneRoot ?? document.body;
  const containedInPhone = portalTarget !== document.body;

  const isClosing = phase === "closing";
  const footerContent =
    typeof footer === "function" ? footer(requestClose) : footer;

  return createPortal(
    <div
      className={`${containedInPhone ? "absolute" : "fixed"} inset-0 z-50 flex flex-col`}
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/60 ${
          isClosing ? "bottom-sheet-scrim-exit" : ""
        }`}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex h-full min-h-0 flex-col rounded-t-[12px] border border-b-0 border-sand-hunter bg-sand-bg shadow-[0_-8px_32px_rgb(0_0_0_/0.12)] ${
          isClosing ? "bottom-sheet-panel-exit" : "bottom-sheet-panel-enter"
        }`}
      >
        <div className="shrink-0 border-b border-fairway-800/15 px-4 pt-3 pb-2">
          <div
            className="mx-auto h-1 w-10 rounded-full bg-fairway-800/25"
            aria-hidden
          />
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 ${
            footerContent
              ? "pb-[calc(5.25rem+max(12px,env(safe-area-inset-bottom)))]"
              : "pb-2"
          }`}
        >
          {children}
        </div>
        {footerContent ? (
          <div className="full-page-modal-footer" aria-hidden={false}>
            <div className="full-page-modal-footer-pill border border-sand-hunter/25">
              {footerContent}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    portalTarget,
  );
}
