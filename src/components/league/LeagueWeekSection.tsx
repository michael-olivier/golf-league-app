import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WeekMatchCard } from "../home/WeekMatchCard";
import { useWeekSwipe } from "../../hooks/useWeekSwipe";
import { useLeague } from "../../store/LeagueContext";
import { areMatchScoresLocked } from "../../utils/matchScores";
import type { WeeklyMatch } from "../../types";

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

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

  const viewedMatch = sortedMatches[weekIndex];

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

  const canEnterScores =
    !!scoringMatch && viewedMatch?.id === scoringMatch.id;

  const scoresLocked =
    !!viewedMatch &&
    areMatchScoresLocked(
      viewedMatch,
      state,
      state.league.holesPerRound,
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

  const showSwipeHint = sortedMatches.length > 1;
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
          className={`${panelClass} rounded-[8px] border border-sand-hunter bg-white p-5`}
        >
          <p className="text-fairway-500">No match for this week.</p>
        </div>
      );
    }

    return (
      <div key={key} className={panelClass}>
        <WeekMatchCard
          league={state.league}
          match={ctx.match}
          course={ctx.course}
          foursome={ctx.foursome}
          home={ctx.home}
          away={ctx.away}
          players={state.players}
          showSwipeHint={showSwipeHint && solo}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <section
        ref={weekSwipeRef}
        className="week-slide-viewport rounded-[8px]"
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

      {canEnterScores ? (
        <Link
          to="/scores/league"
          className="flex items-center justify-between rounded-[8px] bg-sand-hunter px-5 py-4 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          <span>Score league match</span>
          <span className="text-xl" aria-hidden>
            →
          </span>
        </Link>
      ) : scoresLocked ? (
        <div
          className="flex cursor-not-allowed items-center justify-center gap-2 rounded-[8px] border border-fairway-800 bg-fairway-950/40 px-5 py-4 text-sm font-semibold text-fairway-500"
          aria-disabled
        >
          <LockIcon />
          <span>Scores locked</span>
        </div>
      ) : (
        <div
          className="flex cursor-not-allowed items-center justify-center rounded-[8px] border border-fairway-800 bg-fairway-950/40 px-5 py-4 text-sm font-semibold text-fairway-500"
          aria-disabled
        >
          Score league match
        </div>
      )}
    </div>
  );
}
