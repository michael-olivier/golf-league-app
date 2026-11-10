import type { CSSProperties, ReactNode } from "react";
import {
  HOME_CARD_BASE_DELAY_MS,
  HOME_CARD_STAGGER_MS,
} from "./homeMotion";

interface HomeRiseInProps {
  index: number;
  animate: boolean;
  children: ReactNode;
  className?: string;
}

export function HomeRiseIn({
  index,
  animate,
  children,
  className = "",
}: HomeRiseInProps) {
  if (!animate) {
    return <div className={className.trim()}>{children}</div>;
  }

  const style: CSSProperties = {
    animationDelay: `${HOME_CARD_BASE_DELAY_MS + index * HOME_CARD_STAGGER_MS}ms`,
  };

  return (
    <div className={`home-rise-in ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

/** Stagger indices for home stacks (recent → league). */
export function homeCardRiseIndices(options: {
  hasRecent: boolean;
  hasLeague: boolean;
}): { recent: number; league: number } {
  let i = 0;
  const recent = options.hasRecent ? i++ : -1;
  const league = options.hasLeague ? i++ : -1;
  return { recent, league };
}
