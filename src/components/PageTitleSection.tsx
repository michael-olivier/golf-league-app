import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { pageBackgroundTone } from "../utils/pageBackground";

interface PageTitleSectionProps {
  title: string;
  children?: ReactNode;
  /** Default: uppercase page label. Pass false for sentence-case titles (e.g. league name). */
  uppercase?: boolean;
  onBack?: () => void;
  backAriaLabel?: string;
}

export function PageTitleSection({
  title,
  children,
  uppercase = true,
  onBack,
  backAriaLabel = "Go back",
}: PageTitleSectionProps) {
  const { pathname } = useLocation();
  const tone = pageBackgroundTone(pathname);
  const blackHeaderInk = tone === "league" || tone === "casual-score";
  const titleColor = blackHeaderInk ? "text-[#000]" : "text-fairway-300";

  return (
    <header>
      <div className="page-title-gutter flex items-center gap-0.5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel}
            className={`-ml-1 flex shrink-0 items-center justify-center p-1 transition active:opacity-70 ${titleColor}`}
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={0.5} aria-hidden />
          </button>
        ) : null}
        <h1
          className={`text-lg font-semibold ${titleColor} ${
            uppercase ? "uppercase tracking-wide" : ""
          }`}
        >
          {title}
        </h1>
      </div>
      {children ? (
        <div
          className={`page-title-gutter mt-2 space-y-2 ${blackHeaderInk ? "[&_*]:text-[#000]" : ""}`}
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}
