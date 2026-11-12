import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  ChevronDown,
  Copy,
  MessageCircle,
  RectangleHorizontal,
  StickyNote,
} from "lucide-react";
import { IPHONE_OVERLAY_ROOT_ID } from "../IphoneFrame";

/** System-like colors for a non-vibrancy iOS share sheet mock. */
const ios = {
  secondaryLabel: "#8E8E93",
  tertiaryFill: "#E9E9EB",
  separator: "rgb(60 60 67 / 0.18)",
  sheet: "#FFFFFF",
} as const;

interface IosShareSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
}

function ShareScrollRow({ children }: { children: ReactNode }) {
  return (
    <div className="ios-share-scroll-row flex gap-[18px] overflow-x-auto px-4 py-3.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function ShareRowLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="line-clamp-2 text-center text-[11px] font-normal leading-[13px] tracking-[-0.01em] text-black"
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {children}
    </span>
  );
}

function ShareSquircleApp({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <h3 className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <span
        className={`flex h-[60px] w-[60px] items-center justify-center rounded-[22%] shadow-[0_1px_3px_rgb(0_0_0_/0.12)] ${className}`}
      >
        {children}
      </span>
      <ShareRowLabel>{label}</ShareRowLabel>
    </h3>
  );
}

function AirDropGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className="h-8 w-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="21" stroke="white" strokeWidth="2.5" opacity="0.45" />
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2.5" opacity="0.7" />
      <circle cx="24" cy="24" r="7" fill="white" />
    </svg>
  );
}

function MessagesGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-[30px] w-[30px]" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="white"
        d="M8 10.5c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v17c0 2.2-1.8 4-4 4H17.2L8 36.5V10.5z"
      />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-[28px] w-[28px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="13" width="32" height="22" rx="3" stroke="white" strokeWidth="2.5" />
      <path d="M8 16l16 11 16-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NotesGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-[30px] w-[30px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="11" y="8" width="26" height="32" rx="3" fill="white" />
      <path stroke="#C7A84A" strokeWidth="2.2" strokeLinecap="round" d="M17 18h18M17 24h18M17 30h12" />
    </svg>
  );
}

function ShareContact({
  name,
  tint,
}: {
  name: string;
  tint: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <h3 className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <span className="relative">
        <span
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-[22px] font-semibold text-white"
          style={{ background: tint }}
        >
          {initial}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-[#34C759] shadow-sm">
          <MessageCircle aria-hidden className="h-3 w-3 text-white" strokeWidth={1} fill="white" />
        </span>
      </span>
      <ShareRowLabel>{name}</ShareRowLabel>
    </h3>
  );
}

function ShareSystemAction({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <h3 className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <span
        className="flex h-[60px] w-[60px] items-center justify-center rounded-full"
        style={{ backgroundColor: ios.tertiaryFill }}
      >
        {children}
      </span>
      <ShareRowLabel>{label}</ShareRowLabel>
    </h3>
  );
}

function Hairline() {
  return (
    <div
      className="mx-4 h-px shrink-0"
      style={{ backgroundColor: ios.separator }}
      role="separator"
    />
  );
}

export function IosShareSheet({
  open,
  onClose,
  title,
  subtitle = "sandbagger.app",
}: IosShareSheetProps) {
  if (!open) return null;

  const phoneRoot = document.getElementById(IPHONE_OVERLAY_ROOT_ID);
  const portalTarget = phoneRoot ?? document.body;
  const containedInPhone = portalTarget !== document.body;

  return createPortal(
    <div
      className={`${containedInPhone ? "absolute" : "fixed"} inset-0 z-[60] flex flex-col justify-end p-5`}
    >
      <button
        type="button"
        aria-label="Dismiss share sheet"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="ios-share-sheet-enter ios-share-sheet relative z-10 w-full overflow-hidden rounded-[20px] shadow-[0_0_0_0.5px_rgb(0_0_0_/0.06),0_20px_60px_rgb(0_0_0_/0.28),0_8px_24px_rgb(0_0_0_/0.14)]"
        style={{
          backgroundColor: ios.sheet,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <h2 className="flex gap-3 px-4 pb-3.5 pt-3.5">
          <span
            className="flex h-[57px] w-[57px] shrink-0 items-center justify-center rounded-[22%] bg-sand-hunter text-xl font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255_/0.2)]"
            aria-hidden
          >
            S
          </span>
          <span className="min-w-0 flex-1 pt-1">
            <span className="line-clamp-2 text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-black">
              {title}
            </span>
            <span
              className="mt-0.5 block truncate text-[13px] font-normal leading-[18px]"
              style={{ color: ios.secondaryLabel }}
            >
              {subtitle}
            </span>
          </span>
        </h2>

        <Hairline />

        <ShareScrollRow>
          <ShareContact
            name="Michael's MacBook Air"
            tint="linear-gradient(145deg, #6B8CAE 0%, #3D5A80 100%)"
          />
          <ShareContact
            name="Rochelle Larson"
            tint="linear-gradient(145deg, #C97B84 0%, #9E4F5B 100%)"
          />
          <ShareContact
            name="Lyle Gibson"
            tint="linear-gradient(145deg, #8BA888 0%, #5C7A59 100%)"
          />
        </ShareScrollRow>

        <Hairline />

        <ShareScrollRow>
          <ShareSquircleApp
            label="AirDrop"
            className="bg-gradient-to-b from-[#48B9F8] to-[#007AFF]"
          >
            <AirDropGlyph />
          </ShareSquircleApp>
          <ShareSquircleApp label="Messages" className="bg-[#34C759]">
            <MessagesGlyph />
          </ShareSquircleApp>
          <ShareSquircleApp label="Mail" className="bg-[#007AFF]">
            <MailGlyph />
          </ShareSquircleApp>
          <ShareSquircleApp label="Notes" className="bg-[#FFCC00]">
            <NotesGlyph />
          </ShareSquircleApp>
          <ShareSquircleApp
            label="Reminders"
            className="border border-black/[0.06] bg-white"
          >
            <Bookmark
              aria-hidden
              className="h-7 w-7 text-[#FF9500]"
              strokeWidth={1}
            />
          </ShareSquircleApp>
        </ShareScrollRow>

        <Hairline />

        <ShareScrollRow>
          <ShareSystemAction label="Copy">
            <Copy aria-hidden className="h-[22px] w-[22px] text-black" strokeWidth={1} />
          </ShareSystemAction>
          <ShareSystemAction label="Add to New Quick Note">
            <StickyNote aria-hidden className="h-[22px] w-[22px] text-black" strokeWidth={1} />
          </ShareSystemAction>
          <ShareSystemAction label="Bookmark">
            <Bookmark aria-hidden className="h-[22px] w-[22px] text-black" strokeWidth={1} />
          </ShareSystemAction>
          <ShareSystemAction label="Save to Files">
            <RectangleHorizontal aria-hidden className="h-[22px] w-[22px] text-black" strokeWidth={1} />
          </ShareSystemAction>
          <ShareSystemAction label="More">
            <ChevronDown aria-hidden className="h-[22px] w-[22px] text-black" strokeWidth={1} />
          </ShareSystemAction>
        </ShareScrollRow>

        <div className="h-2" aria-hidden />
      </div>
    </div>,
    portalTarget,
  );
}
