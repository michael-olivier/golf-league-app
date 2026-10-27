import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import type { Player } from "../../types";
import { PlayerAvatar } from "../PlayerAvatar";
import { StrokePopMarker } from "./StrokePopMarker";
import { playerTabLabels } from "../../utils/player";

const INDICATOR_SHRINK_FACTOR = 0.55;
const INDICATOR_TRANSITION_MS = 180;
const INDICATOR_GAP_PX = 12;
/** Matches foursome tab row (avatar xs + label + padding). */
const PLAYER_TAB_BAND_MIN_H = "min-h-[3.875rem]";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function scheduleAfterPaint(onRun: () => void) {
  if (prefersReducedMotion()) {
    onRun();
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(onRun);
  });
}

interface FoursomePlayerTabsProps {
  players: Player[];
  activePlayerId: string;
  /** Label styling (hunter vs white). */
  highlightedPlayerId: string | null;
  drainingPlayerId: string | null;
  drainActive: boolean;
  fillingPlayerId: string | null;
  fillActive: boolean;
  onSelect: (playerId: string) => void;
  onTabRef?: (playerId: string, element: HTMLButtonElement | null) => void;
  onPlayerFillTransitionEnd?: (playerId: string, property: string) => void;
  highlightTransitionMs?: number;
  /** Inactive tab label color on the header band. */
  tabVariant?: "onSage" | "onScoreMist";
  /** Match (Net): show stroke pop dot beside name on this hole. */
  strokePopForPlayer?: (playerId: string) => boolean;
}

export function FoursomePlayerTabs({
  players,
  activePlayerId,
  highlightedPlayerId,
  drainingPlayerId,
  drainActive,
  fillingPlayerId,
  fillActive,
  onSelect,
  onTabRef,
  onPlayerFillTransitionEnd,
  highlightTransitionMs = INDICATOR_TRANSITION_MS,
  tabVariant = "onSage",
  strokePopForPlayer,
}: FoursomePlayerTabsProps) {
  const labels = useMemo(() => playerTabLabels(players), [players]);
  const tabTransition = `${highlightTransitionMs}ms ease-in-out`;
  const inactiveLabelClass =
    tabVariant === "onScoreMist" ? "text-sand-hunter" : "text-white";

  const columnClass =
    players.length === 1
      ? "grid-cols-1"
      : players.length === 2
        ? "grid-cols-2"
        : players.length === 3
          ? "grid-cols-3"
          : "grid-cols-4";

  return (
    <div
      className={`grid w-full min-w-0 ${columnClass} gap-1`}
      role="tablist"
      aria-label="Foursome players"
    >
      {players.map((player) => {
        const selected = player.id === activePlayerId;
        const highlighted = player.id === highlightedPlayerId;
        const isDraining = player.id === drainingPlayerId;
        const isFilling = player.id === fillingPlayerId;
        const label = labels.get(player.id) ?? player.name;

        const showActiveShape = highlighted || isDraining;

        let fillHeight = "0%";
        if (isDraining) {
          fillHeight = drainActive ? "0%" : "100%";
        } else if (isFilling) {
          fillHeight = fillActive ? "100%" : "0%";
        } else if (highlighted) {
          fillHeight = "100%";
        }

        return (
          <button
            key={player.id}
            ref={(el) => onTabRef?.(player.id, el)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={player.name}
            onClick={() => onSelect(player.id)}
            className={`relative flex min-w-0 w-full flex-col items-center gap-1 overflow-hidden px-0.5 py-1.5 ${
              showActiveShape
                ? "rounded-t-[8px] rounded-b-[0px]"
                : "rounded-[8px]"
            }`}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 block bg-white motion-reduce:transition-none"
              style={{
                height: fillHeight,
                transition: `height ${tabTransition}`,
              }}
              onTransitionEnd={(event) =>
                onPlayerFillTransitionEnd?.(player.id, event.propertyName)
              }
            />
            <div
              className={`relative z-10 flex flex-col items-center gap-1 ${highlighted ? "" : "opacity-85"}`}
              style={{ transition: `opacity ${tabTransition}` }}
            >
              <PlayerAvatar player={player} size="xs" />
              <span
                className={`inline-flex max-w-full items-center justify-center gap-0.5 truncate text-center text-[11px] font-medium leading-tight ${
                  highlighted ? "text-sand-hunter" : inactiveLabelClass
                }`}
                style={{ transition: `color ${tabTransition}` }}
              >
                {strokePopForPlayer?.(player.id) ? (
                  <StrokePopMarker />
                ) : null}
                <span className="truncate">{label}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface IndicatorMetrics {
  left: number;
  width: number;
}

interface FoursomeScoringWithTabsProps {
  players: Player[];
  activePlayerId: string;
  onSelect: (playerId: string) => void;
  children?: ReactNode;
  /** Immersive score: colored header band + full-height white body. */
  layout?: "default" | "league";
  leagueHeader?: ReactNode;
  footer?: ReactNode;
  headerBandClassName?: string;
  tabVariant?: "onSage" | "onScoreMist";
  strokePopForPlayer?: (playerId: string) => boolean;
  /** Horizontal inset for immersive league layout (matches `/scores` setup when `px-4`). */
  contentPaddingX?: string;
}

type IndicatorPhase = "idle" | "drain" | "shrink" | "slide" | "grow";

export function FoursomeScoringWithTabs({
  players,
  activePlayerId,
  onSelect,
  children,
  layout = "default",
  leagueHeader,
  footer,
  headerBandClassName = "bg-sand-sage",
  tabVariant = "onSage",
  strokePopForPlayer,
  contentPaddingX = "px-8",
}: FoursomeScoringWithTabsProps) {
  const showConnector = layout === "default";
  const showPlayerTabs = players.length > 1;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<IndicatorPhase>("idle");
  const animatingToRef = useRef<string | null>(null);
  const prevActiveRef = useRef(activePlayerId);
  const hasIndicatorRef = useRef(false);
  const [indicator, setIndicator] = useState<IndicatorMetrics | null>(null);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(
    activePlayerId,
  );
  const [drainingPlayerId, setDrainingPlayerId] = useState<string | null>(null);
  const [drainActive, setDrainActive] = useState(false);
  const [fillingPlayerId, setFillingPlayerId] = useState<string | null>(null);
  const [fillActive, setFillActive] = useState(false);

  const onTabRef = useCallback((playerId: string, element: HTMLButtonElement | null) => {
    tabRefs.current[playerId] = element;
  }, []);

  const measureForPlayer = useCallback((playerId: string): IndicatorMetrics | null => {
    const btn = tabRefs.current[playerId];
    const card = cardRef.current;
    if (!btn || !card) return null;
    const btnRect = btn.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const width = btnRect.width;
    const centerX = btnRect.left + btnRect.width / 2 - cardRect.left;
    return { left: centerX - width / 2, width };
  }, []);

  const beginRectangleShrink = useCallback(
    (fromPlayerId: string) => {
      const from = measureForPlayer(fromPlayerId);
      if (!from) return;
      setDrainingPlayerId(null);
      setDrainActive(false);
      setHighlightedPlayerId(null);
      phaseRef.current = "shrink";
      setIndicator({
        left: from.left,
        width: from.width * INDICATOR_SHRINK_FACTOR,
      });
    },
    [measureForPlayer],
  );

  const completeTabSwitchAfterDrain = useCallback((targetId: string) => {
    phaseRef.current = "idle";
    animatingToRef.current = null;
    prevActiveRef.current = targetId;
    setDrainingPlayerId(null);
    setDrainActive(false);
    setFillingPlayerId(targetId);
    setFillActive(false);
    scheduleAfterPaint(() => {
      setHighlightedPlayerId(targetId);
      setFillActive(true);
    });
  }, []);

  const syncIndicatorIdle = useCallback(() => {
    if (!showConnector || phaseRef.current !== "idle") return;
    const measured = measureForPlayer(activePlayerId);
    if (measured) setIndicator(measured);
  }, [activePlayerId, measureForPlayer, showConnector]);

  useLayoutEffect(() => {
    if (!children) return;

    const measured = measureForPlayer(activePlayerId);

    if (prevActiveRef.current !== activePlayerId && phaseRef.current === "idle") {
      const fromId = prevActiveRef.current;
      const from = measureForPlayer(fromId);
      if (from) {
        phaseRef.current = "drain";
        animatingToRef.current = activePlayerId;
        setFillingPlayerId(null);
        setFillActive(false);
        setDrainingPlayerId(fromId);
        setHighlightedPlayerId(fromId);
        if (prefersReducedMotion()) {
          setDrainActive(true);
          if (showConnector) {
            beginRectangleShrink(fromId);
          } else {
            completeTabSwitchAfterDrain(activePlayerId);
          }
        } else {
          setDrainActive(false);
          scheduleAfterPaint(() => setDrainActive(true));
        }
        return;
      }
      if (showConnector && measured) {
        setIndicator(measured);
      }
      setHighlightedPlayerId(activePlayerId);
      prevActiveRef.current = activePlayerId;
      return;
    }

    if (!showConnector) {
      if (!hasIndicatorRef.current) {
        hasIndicatorRef.current = true;
        prevActiveRef.current = activePlayerId;
        setHighlightedPlayerId(activePlayerId);
      } else if (phaseRef.current === "idle") {
        prevActiveRef.current = activePlayerId;
      }
      return;
    }

    if (!measured) return;

    if (!hasIndicatorRef.current) {
      setIndicator(measured);
      hasIndicatorRef.current = true;
      prevActiveRef.current = activePlayerId;
      setHighlightedPlayerId(activePlayerId);
      return;
    }

    if (phaseRef.current === "idle") {
      setIndicator(measured);
      prevActiveRef.current = activePlayerId;
    }
  }, [
    activePlayerId,
    beginRectangleShrink,
    children,
    completeTabSwitchAfterDrain,
    measureForPlayer,
    players,
    showConnector,
  ]);

  useEffect(() => {
    if (!children) return;
    const onResize = () => syncIndicatorIdle();
    const ro = new ResizeObserver(onResize);
    for (const el of Object.values(tabRefs.current)) {
      if (el) ro.observe(el);
    }
    if (cardRef.current) ro.observe(cardRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [children, syncIndicatorIdle, players, activePlayerId]);

  const handlePlayerFillTransitionEnd = useCallback(
    (playerId: string, property: string) => {
      if (property !== "height") return;

      if (
        phaseRef.current === "drain" &&
        playerId === drainingPlayerId &&
        drainActive
      ) {
        if (showConnector) {
          beginRectangleShrink(playerId);
        } else {
          completeTabSwitchAfterDrain(
            animatingToRef.current ?? activePlayerId,
          );
        }
      }
    },
    [
      activePlayerId,
      beginRectangleShrink,
      completeTabSwitchAfterDrain,
      drainActive,
      drainingPlayerId,
      showConnector,
    ],
  );

  const handleIndicatorTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    const targetId = animatingToRef.current ?? activePlayerId;
    const target = measureForPlayer(targetId);
    if (!target) return;

    const shrunkWidth = target.width * INDICATOR_SHRINK_FACTOR;

    if (phaseRef.current === "shrink" && event.propertyName === "width") {
      phaseRef.current = "slide";
      const center = target.left + target.width / 2;
      setIndicator({ left: center - shrunkWidth / 2, width: shrunkWidth });
      return;
    }

    if (phaseRef.current === "slide" && event.propertyName === "left") {
      phaseRef.current = "grow";
      setIndicator(target);
      return;
    }

    if (phaseRef.current === "grow" && event.propertyName === "width") {
      completeTabSwitchAfterDrain(targetId);
    }
  };

  const playerTabs = (
    <FoursomePlayerTabs
      players={players}
      activePlayerId={activePlayerId}
      highlightedPlayerId={highlightedPlayerId}
      drainingPlayerId={drainingPlayerId}
      drainActive={drainActive}
      fillingPlayerId={fillingPlayerId}
      fillActive={fillActive}
      highlightTransitionMs={INDICATOR_TRANSITION_MS}
      onSelect={onSelect}
      onTabRef={onTabRef}
      onPlayerFillTransitionEnd={handlePlayerFillTransitionEnd}
      tabVariant={tabVariant}
      strokePopForPlayer={strokePopForPlayer}
    />
  );

  const indicatorBar =
    showConnector && indicator != null && children ? (
      <div
        className="pointer-events-none absolute z-10 bg-white motion-reduce:transition-none"
        style={{
          left: indicator.left,
          width: indicator.width,
          top: -INDICATOR_GAP_PX,
          height: INDICATOR_GAP_PX,
          transition: `left ${INDICATOR_TRANSITION_MS}ms ease-in-out, width ${INDICATOR_TRANSITION_MS}ms ease-in-out`,
        }}
        onTransitionEnd={handleIndicatorTransitionEnd}
        aria-hidden
      />
    ) : null;

  if (layout === "league") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={`shrink-0 pb-0 ${contentPaddingX} ${headerBandClassName}`}>
          {leagueHeader}
          {showPlayerTabs ? (
            playerTabs
          ) : (
            <div className={PLAYER_TAB_BAND_MIN_H} aria-hidden />
          )}
        </div>
        {children ? (
          <div
            ref={cardRef}
            className="relative flex min-h-0 flex-1 flex-col bg-white"
          >
            {indicatorBar}
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className={`min-h-0 flex-1 overflow-y-auto pt-6 ${contentPaddingX}`}
              >
                {children}
              </div>
              {footer ? (
                <div
                  className={`shrink-0 border-t border-fairway-800/15 pb-8 pt-3 ${contentPaddingX}`}
                >
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {playerTabs}
      {children ? (
        <div ref={cardRef} className="relative">
          {indicatorBar}
          {children}
        </div>
      ) : null}
    </div>
  );
}
