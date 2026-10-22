import type { ReactNode } from "react";

interface PageTitleSectionProps {
  title: string;
  children?: ReactNode;
  /** Default: uppercase page label. Pass false for sentence-case titles (e.g. league name). */
  uppercase?: boolean;
}

export function PageTitleSection({
  title,
  children,
  uppercase = true,
}: PageTitleSectionProps) {
  return (
    <header className="page-title-gutter">
      <h1
        className={`text-lg font-semibold text-fairway-300 ${
          uppercase ? "uppercase tracking-wide" : ""
        }`}
      >
        {title}
      </h1>
      {children ? <div className="mt-2 space-y-2">{children}</div> : null}
    </header>
  );
}
