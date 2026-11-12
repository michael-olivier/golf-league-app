import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  homeStackCollapsedHeight,
  homeStackExpandedHeight,
  homeStackExpandedMetrics,
} from "./homeStackMetrics";

interface HomeStackSectionProps {
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  itemCount: number;
  children: ReactNode;
  className?: string;
  /** Collapsed stack recedes while the other section is expanded. */
  isBackground?: boolean;
  /** Recede toward top (upper stack) or bottom (lower stack — behind tab bar). */
  backgroundAnchor?: "top" | "bottom";
  /** Tighter vertical spacing between cards when expanded. */
  compactWhenExpanded?: boolean;
  /** Cap expanded height to this many cards; additional items scroll in the list. */
  expandedVisibleMax?: number;
}

export function HomeStackSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  itemCount,
  children,
  className = "",
  isBackground = false,
  backgroundAnchor = "top",
  compactWhenExpanded = false,
  expandedVisibleMax,
}: HomeStackSectionProps) {
  const compact = compactWhenExpanded && expanded;
  const { slotPx, gapPx } = homeStackExpandedMetrics(compact);
  const collapsedHeight = homeStackCollapsedHeight(isBackground);
  const expandedSlotCount =
    expanded && expandedVisibleMax != null
      ? Math.min(itemCount, expandedVisibleMax)
      : itemCount;
  const scrollableExpanded =
    expanded &&
    expandedVisibleMax != null &&
    itemCount > expandedVisibleMax;
  const expandedHeight = homeStackExpandedHeight(expandedSlotCount, compact);

  const sectionStyle: CSSProperties = {
    height: expanded ? expandedHeight : collapsedHeight,
    ["--home-stack-collapsed-h" as string]: `${collapsedHeight}px`,
    ["--stack-expanded-slot" as string]: `${slotPx}px`,
    ["--stack-expanded-gap" as string]: `${gapPx}px`,
  };

  return (
    <section
      className={`home-stack-section ${expanded ? "is-expanded" : ""} ${
        compact ? "is-compact-expanded" : ""
      } ${scrollableExpanded ? "is-scrollable-expanded" : ""} ${
        isBackground
          ? `is-background is-background--${backgroundAnchor}`
          : ""
      } ${className}`.trim()}
      style={sectionStyle}
    >
      <button
        type="button"
        className="home-stack-toggle"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="home-stack-title flex min-w-0 items-center gap-2">
          <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1} />
          {title}
        </span>
        <ChevronDown
          aria-hidden
          className="home-stack-chevron h-4 w-4 shrink-0"
          strokeWidth={1}
        />
      </button>
      <div className="home-stack-items">{children}</div>
    </section>
  );
}

interface HomeStackItemProps {
  index: number;
  expanded: boolean;
  interactive: boolean;
  onPress: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function HomeStackItem({
  index,
  interactive,
  onPress,
  children,
  className = "",
  style,
}: HomeStackItemProps) {
  return (
    <div className="home-stack-item" data-stack-index={index}>
      <button
        type="button"
        onClick={onPress}
        disabled={!interactive && index > 0}
        tabIndex={interactive || index === 0 ? 0 : -1}
        style={style}
        className={`home-summary-card w-full rounded-[8px] border border-sand-hunter px-3.5 py-4 text-left disabled:cursor-default ${className}`.trim()}
      >
        {children}
      </button>
    </div>
  );
}
