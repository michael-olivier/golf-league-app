import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeagueUpcomingMatchCard } from "./LeagueUpcomingMatchCard";
import { useWeekSwipe } from "../../hooks/useWeekSwipe";
import { useLeague } from "../../store/LeagueContext";
import { areMatchScoresLocked } from "../../utils/matchScores";
import type { WeeklyMatch } from "../../types";

function findInitialWeekIndex(
  matches: { id: string; weekNumber: number; status: string }[],
): number {
  const sorted = [...matches].sort((a, b) => a.weekNumber - b.weekNumber);
  if (!sorted.length) return 0;
  const scoring = matches.find((m) => m.status === "in_progress");
  if (scoring) {
    const idx = sorted.findIndex((m) => m.id === scoring.id);
    if (idx >= 0) return idx;
  }
  return sorted.length - 1;
}

type SlidePhase = {
  fromIndex: number;
  toIndex: number;
  direction: "next" | "prev";
};

export function LeagueWeekSection() {
  const {
    getCourse,
    getTeam,
    getFoursomeForUser,
    state,
  } = useLeague();

  const sortedMatches = useMemo(
    () => [...state.matches].sort((a, b) => a.weekNumber - b.weekNumber),
    [state.matches],
  );

  const scoringMatch = useMemo(
    () => state.matches.find((m) => m.status === "in_progress"),
    [state.matches],
  );

  const [weekIndex, setWeekIndex] = useState(() =>
    findInitialWeekIndex(state.matches),
  );
  const [slide, setSlide] = useState<SlidePhase | null>(null);
  const [trackOffset, setTrackOffset] = useState(0);

  const matchContext = useCallback(
    (match: WeeklyMatch | undefined) => {
      if (!match) return null;
      const c = getCourse(match.courseId);
      if (!c) return null;
      return {
        match,
        course: c,
        foursome: getFoursomeForUser(match.id),
        home: getTeam(match.teamPairing.homeTeamId),
        away: getTeam(match.teamPairing.awayTeamId),
      };
    },
    [getCourse, getFoursomeForUser, getTeam],
  );

  const beginSlide = useCallback(
    (direction: "next" | "prev") => {
      if (slide) return;
      const toIndex =
        direction === "next" ? weekIndex + 1 : weekIndex - 1;
      if (toIndex < 0 || toIndex >= sortedMatches.length) return;
      setSlide({ fromIndex: weekIndex, toIndex, direction });
    },
    [slide, weekIndex, sortedMatches.length],
  );

  const goPreviousWeek = useCallback(() => beginSlide("prev"), [beginSlide]);
  const goNextWeek = useCallback(() => beginSlide("next"), [beginSlide]);

  useEffect(() => {
    if (!slide) return;

    const startOffset = slide.direction === "next" ? 0 : -50;
    const endOffset = slide.direction === "next" ? -50 : 0;
    setTrackOffset(startOffset);

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTrackOffset(endOffset));
    });

    return () => cancelAnimationFrame(id);
  }, [slide]);

  const onSlideTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform" || !slide) return;
      setWeekIndex(slide.toIndex);
      setSlide(null);
      setTrackOffset(0);
    },
    [slide],
  );

  const weekSwipeRef = useRef<HTMLElement>(null);
  const weekSwipe = useWeekSwipe(goPreviousWeek, goNextWeek, weekSwipeRef);

  const isAnimating = !!slide;

  const panelIndices = isAnimating
    ? slide.direction === "next"
      ? [slide.fromIndex, slide.toIndex]
      : [slide.toIndex, slide.fromIndex]
    : [weekIndex];

  const renderWeekPanel = (index: number, solo: boolean, key: string) => {
    const ctx = matchContext(sortedMatches[index]);
    const panelClass = solo ? "week-slide-panel--solo" : "week-slide-panel";

    if (!ctx) {
      return (
        <div
          key={key}
          className={`app-glass-card ${panelClass} rounded-[12px] border border-white/60 p-5`}
        >
          <p className="text-fairway-500">No match for this week.</p>
        </div>
      );
    }

    const panelScoresLocked = areMatchScoresLocked(
      ctx.match,
      state,
      state.league.holesPerRound,
    );
    const panelScoreActive =
      !!scoringMatch && ctx.match.id === scoringMatch.id;

    return (
      <div key={key} className={panelClass}>
        <LeagueUpcomingMatchCard
          league={state.league}
          match={ctx.match}
          course={ctx.course}
          home={ctx.home}
          away={ctx.away}
          players={state.players}
          scoresLocked={panelScoresLocked}
          scoreMatchActive={panelScoreActive}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <section
        ref={weekSwipeRef}
        className="week-slide-viewport"
        {...weekSwipe}
        aria-label="Weekly match. Swipe left or right for other weeks."
      >
        <div
          className={`week-slide-track ${isAnimating ? "week-slide-track--animating" : "week-slide-track--idle"}`}
          style={{ transform: `translateX(${trackOffset}%)` }}
          onTransitionEnd={onSlideTransitionEnd}
        >
          {panelIndices.map((index) =>
            renderWeekPanel(
              index,
              !isAnimating,
              `${index}-${isAnimating ? slide?.direction : "idle"}`,
            ),
          )}
        </div>
      </section>
    </div>
  );
}
