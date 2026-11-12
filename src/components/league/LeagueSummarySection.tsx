import type { ReactNode } from "react";

interface LeagueSummarySectionProps {
  title: string;
  children: ReactNode;
}

export function LeagueSummarySection({
  title,
  children,
}: LeagueSummarySectionProps) {
  return (
    <section className="league-summary-card border border-sand-hunter bg-white p-3">
      <p className="league-summary-card__title">{title}</p>
      {children}
    </section>
  );
}
