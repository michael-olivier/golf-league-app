import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IPHONE_OVERLAY_ROOT_ID } from "./IphoneFrame";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Panel background; default champagne matches scorecards. */
  tone?: "champagne" | "white";
  /** Taller sheet (e.g. filter forms with breathing room below fields). */
  expanded?: boolean;
  /** Shrink-wrap panel height so content behind stays visible. */
  compact?: boolean;
  contentClassName?: string;
  scrimClassName?: string;
  /** When false, page content behind the sheet can still scroll (e.g. live filter). */
  lockBackgroundScroll?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  tone = "champagne",
  expanded = false,
  compact = false,
  contentClassName = "",
  scrimClassName = "bg-black/40",
  lockBackgroundScroll = true,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open || !lockBackgroundScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockBackgroundScroll]);

  if (!open) return null;

  const phoneRoot = document.getElementById(IPHONE_OVERLAY_ROOT_ID);
  const portalTarget = phoneRoot ?? document.body;
  const containedInPhone = portalTarget !== document.body;
  const isWhite = tone === "white";
  const heightClass = compact
    ? "h-auto max-h-[85%]"
    : expanded
      ? containedInPhone
        ? "min-h-[52%] max-h-[85%]"
        : "min-h-[min(52dvh,420px)] max-h-[min(88dvh,640px)]"
      : containedInPhone
        ? "max-h-[85%]"
        : "max-h-[min(88dvh,640px)]";

  return createPortal(
    <div
      className={`${containedInPhone ? "absolute" : "fixed"} inset-0 z-50 flex flex-col justify-end`}
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 ${scrimClassName}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className={`relative z-10 flex flex-col rounded-t-[8px] border border-b-0 border-sand-hunter shadow-[0_-8px_32px_rgb(0_0_0_/0.12)] ${
          isWhite ? "bg-white" : "bg-sand-champagne"
        } ${heightClass} ${compact ? "shrink-0" : ""}`}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${
            isWhite ? "border-fairway-800/20" : "border-sand-hunter/30"
          }`}
        >
          <h2
            id="bottom-sheet-title"
            className={`text-sm font-semibold uppercase tracking-wide ${
              isWhite ? "text-fairway-300" : "text-sand-hunter"
            }`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-[8px] px-2 py-1 text-sm font-medium ${
              isWhite ? "text-sand-hunter" : "text-sand-hunter"
            }`}
          >
            Done
          </button>
        </div>
        <div
          className={`px-4 pt-3 ${
            contentClassName.includes("pb-") || contentClassName.includes("pb[")
              ? ""
              : "pb-[max(1rem,env(safe-area-inset-bottom))]"
          } ${compact ? "shrink-0" : "min-h-0 flex-1 overflow-y-auto overscroll-contain"} ${contentClassName}`.trim()}
        >
          {children}
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
