export const HOME_STACK_HEADER_PX = 40;
export const HOME_STACK_COLLAPSED_PEEK_PX = 118;
export const HOME_STACK_BACKGROUND_PEEK_PX = 52;

/** Per-card budget for height animation (flex gap supplies real 8px spacing). */
export const HOME_STACK_SLOT_DEFAULT_PX = 100;
export const HOME_STACK_GAP_DEFAULT_PX = 8;
export const HOME_STACK_SLOT_COMPACT_PX = 96;
export const HOME_STACK_GAP_COMPACT_PX = 8;

export function homeStackCollapsedHeight(background = false): number {
  const peek = background
    ? HOME_STACK_BACKGROUND_PEEK_PX
    : HOME_STACK_COLLAPSED_PEEK_PX;
  return HOME_STACK_HEADER_PX + peek;
}

export function homeStackExpandedHeight(
  itemCount: number,
  compact: boolean,
): number {
  const slot = compact ? HOME_STACK_SLOT_COMPACT_PX : HOME_STACK_SLOT_DEFAULT_PX;
  const gap = compact ? HOME_STACK_GAP_COMPACT_PX : HOME_STACK_GAP_DEFAULT_PX;
  return (
    HOME_STACK_HEADER_PX +
    itemCount * slot +
    Math.max(0, itemCount - 1) * gap
  );
}

export function homeStackExpandedMetrics(compact: boolean): {
  slotPx: number;
  gapPx: number;
} {
  return {
    slotPx: compact ? HOME_STACK_SLOT_COMPACT_PX : HOME_STACK_SLOT_DEFAULT_PX,
    gapPx: compact ? HOME_STACK_GAP_COMPACT_PX : HOME_STACK_GAP_DEFAULT_PX,
  };
}

const DOCK_TOP_RATIO = 0.46;
const DOCK_TOP_OFFSET_PX = 28;
/** Keep in sync with `.home-stack-dock--league-open` gap (1.25rem). */
const DOCK_SECTION_GAP_PX = 20;
/** Gap from last league card to bottom nav — matches dock padding when league is open. */
export const LEAGUE_EXPANDED_BOTTOM_INSET_PX = 24;
/** Keep in sync with `--home-stack-bg-*` in `index.css`. */
const HOME_STACK_BG_SCALE = 0.68;
const HOME_STACK_BG_LIFT_PX = 52;

function leagueOpenRecentLeadPx(): number {
  const collapsedH = homeStackCollapsedHeight(true);
  const scaleMarginBottom = (HOME_STACK_BG_SCALE - 1) * collapsedH;
  return (
    -HOME_STACK_BG_LIFT_PX +
    collapsedH +
    scaleMarginBottom +
    DOCK_SECTION_GAP_PX
  );
}

/**
 * Signed dock shift: `translateY(-value)` places the last league card
 * `LEAGUE_EXPANDED_BOTTOM_INSET_PX` above the host bottom (top of tab bar).
 * Positive = move up; negative = move down.
 */
export function estimateLeagueDockLiftPx(
  hostHeightPx: number,
  leagueItemCount: number,
): number {
  const dockTop = hostHeightPx * DOCK_TOP_RATIO - DOCK_TOP_OFFSET_PX;
  const leagueH = homeStackExpandedHeight(leagueItemCount, false);
  const lastCardBottom = dockTop + leagueOpenRecentLeadPx() + leagueH;
  return (
    lastCardBottom +
    LEAGUE_EXPANDED_BOTTOM_INSET_PX -
    hostHeightPx
  );
}
