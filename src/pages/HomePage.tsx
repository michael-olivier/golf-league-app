import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useHomeStackDockLift } from "../hooks/useHomeStackDockLift";
import { CalendarDays, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  HomeRiseIn,
  homeCardRiseIndices,
} from "../components/home/HomeRiseIn";
import {
  HomeStackItem,
  HomeStackSection,
} from "../components/home/HomeStackSection";
import { LeagueMatchDetailModal } from "../components/league/LeagueMatchDetailModal";
import { useLeague } from "../store/LeagueContext";
import {
  leagueMatchPointsResult,
  matchPointsForViewer,
  opponentTeamIdForMatch,
} from "../utils/leagueMatch";
import { weekCardSubtitle } from "../utils/weekDisplay";
import { assetUrl } from "../utils/assetUrl";
import {
  HomeHandicapSummary,
  HomeHeroBackdrop,
  HomeHeroLogo,
} from "../components/home/HomeHeroHeader";
import { RecentRoundDetailModal } from "../components/recentRound/RecentRoundDetailModal";
import {
  markHomeEntrancePlayed,
  shouldPlayHomeEntrance,
} from "../components/home/homeMotion";
import { whsScoreDifferential } from "../utils/handicap";
import { recentCourseHeroUrl } from "../utils/recentCourseHero";
import { homeLeagueCardGradient } from "../utils/homeLeagueCardSurface";
import {
  homeLeagueStackMatches,
  recentRoundsForPlayer,
} from "../utils/homeStacks";
import type { PlayerRecentRound, WeeklyMatch } from "../types";

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type HomeStackKey = "recent" | "league";

function scoreDiffForRound(
  round: PlayerRecentRound,
  defaultTeeId: string | undefined,
  getCourse: ReturnType<typeof useLeague>["getCourse"],
): number | null {
  if (round.scoreDifferential != null) return round.scoreDifferential;
  const course = getCourse(round.courseId);
  if (!course) return null;
  const tee =
    course.tees.find((t) => t.id === defaultTeeId) ?? course.tees[0];
  if (!tee) return null;
  const holes = round.holeCount === 18 ? 18 : 9;
  return whsScoreDifferential(round.strokes, holes, tee);
}

export function HomePage() {
  const navigate = useNavigate();
  const {
    currentPlayer,
    getCourse,
    getTeam,
    state,
  } = useLeague();

  const [expandedStack, setExpandedStack] = useState<HomeStackKey | null>(null);
  const [leagueMatchDetailId, setLeagueMatchDetailId] = useState<string | null>(
    null,
  );
  const [recentRoundOpen, setRecentRoundOpen] = useState(false);
  const [selectedRecent, setSelectedRecent] =
    useState<PlayerRecentRound | null>(null);

  const recentRounds = useMemo(
    () => recentRoundsForPlayer(currentPlayer),
    [currentPlayer],
  );
  const leagueMatches = useMemo(
    () => homeLeagueStackMatches(currentPlayer, state.matches),
    [currentPlayer, state.matches],
  );

  const leagueMatchDetail = useMemo(
    () =>
      leagueMatchDetailId
        ? state.matches.find((m) => m.id === leagueMatchDetailId)
        : undefined,
    [leagueMatchDetailId, state.matches],
  );
  const leagueMatchDetailCourse = leagueMatchDetail
    ? getCourse(leagueMatchDetail.courseId)
    : undefined;

  const homeLogoUrl = state.league.homeLogoUrl
    ? assetUrl(state.league.homeLogoUrl)
    : null;
  const heroImageUrl = recentCourseHeroUrl(currentPlayer, getCourse);

  const hasRecent = recentRounds.length > 0;
  const hasLeague = leagueMatches.length > 0;
  const rise = useMemo(
    () =>
      homeCardRiseIndices({
        hasRecent,
        hasLeague,
      }),
    [hasRecent, hasLeague],
  );

  const playEntrance = useRef(shouldPlayHomeEntrance()).current;
  const stackDockRef = useRef<HTMLDivElement>(null);
  const leagueDockLift = useHomeStackDockLift(
    expandedStack,
    leagueMatches.length,
    stackDockRef,
  );

  const stackDockStyle = useMemo((): CSSProperties | undefined => {
    if (expandedStack !== "league" || Math.abs(leagueDockLift) < 0.5) {
      return undefined;
    }
    return { transform: `translateY(${-leagueDockLift}px)` };
  }, [expandedStack, leagueDockLift]);

  useEffect(() => {
    if (playEntrance) markHomeEntrancePlayed();
  }, [playEntrance]);

  const toggleStack = (key: HomeStackKey) => {
    setExpandedStack((prev) => (prev === key ? null : key));
  };

  const openRecent = (round: PlayerRecentRound) => {
    setSelectedRecent(round);
    setRecentRoundOpen(true);
  };

  const handleLeagueMatch = (match: WeeklyMatch) => {
    const isUpcoming =
      match.status === "scheduled" || match.status === "in_progress";
    if (isUpcoming) {
      navigate("/league");
      return;
    }
    setLeagueMatchDetailId(match.id);
  };

  const modalRecent = selectedRecent ?? recentRounds[0];
  const modalRecentCourse = modalRecent
    ? getCourse(modalRecent.courseId)
    : undefined;

  return (
    <div className="relative -mx-4 flex min-h-0 flex-1 flex-col overflow-hidden">
      <HomeHeroBackdrop imageUrl={heroImageUrl} />

      <div className="relative z-10 min-h-0 flex-1">
        <div className="flex justify-center px-4 pt-[var(--page-top-inset)]">
          <HomeHeroLogo logoUrl={homeLogoUrl} animateLogo={playEntrance} />
        </div>

        <div className="pointer-events-none absolute left-0 right-0 top-[28%] z-30 -translate-y-1/2 px-4">
          <HomeHandicapSummary player={currentPlayer} />
        </div>

        <div
          ref={stackDockRef}
          style={stackDockStyle}
          className={`home-stack-dock absolute inset-x-4 z-10 flex flex-col ${
            expandedStack === "league"
              ? "home-stack-dock--league-open gap-5 pb-[max(24px,env(safe-area-inset-bottom))]"
              : "gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          }`}
        >
          {hasRecent && rise.recent >= 0 ? (
            <HomeRiseIn index={rise.recent} animate={playEntrance}>
              <HomeStackSection
                title="Most recent rounds"
                icon={NotebookPen}
                expanded={expandedStack === "recent"}
                isBackground={expandedStack === "league"}
                onToggle={() => toggleStack("recent")}
                itemCount={recentRounds.length}
                compactWhenExpanded
              >
                {recentRounds.map((round, index) => {
                  const course = getCourse(round.courseId);
                  const diff = scoreDiffForRound(
                    round,
                    state.league.defaultTeeBoxId,
                    getCourse,
                  );
                  const expanded = expandedStack === "recent";
                  return (
                    <HomeStackItem
                      key={`${round.playedOn}-${round.courseId}`}
                      index={index}
                      expanded={expanded}
                      interactive={expanded || index === 0}
                      className={
                        index === 0
                          ? "border-t-[3px] border-t-sand-sage bg-white"
                          : "bg-white"
                      }
                      onPress={() => {
                        if (!expanded) {
                          setExpandedStack("recent");
                          return;
                        }
                        openRecent(round);
                      }}
                    >
                      <div className="mt-0 min-w-0 space-y-1.5">
                        <div className="flex items-end justify-between gap-3">
                          <p className="min-w-0 text-base font-medium leading-snug text-fairway-300">
                            {course?.name ?? "Round"}
                          </p>
                          <p className="home-summary-card-score shrink-0 text-fairway-300">
                            {round.strokes}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-fairway-500">
                          <span className="shrink-0">
                            {formatLongDate(round.playedOn)}
                          </span>
                          <span className="shrink-0 text-right tabular-nums">
                            {round.holeCount} holes
                            {diff != null ? (
                              <>
                                <span> • </span>
                                Diff {diff.toFixed(1)}
                              </>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </HomeStackItem>
                  );
                })}
              </HomeStackSection>
            </HomeRiseIn>
          ) : null}

          {hasLeague && rise.league >= 0 ? (
            <HomeRiseIn index={rise.league} animate={playEntrance}>
              <HomeStackSection
                title="League play"
                icon={CalendarDays}
                expanded={expandedStack === "league"}
                onToggle={() => toggleStack("league")}
                itemCount={leagueMatches.length}
              >
                {leagueMatches.map((match, index) => {
                  const course = getCourse(match.courseId);
                  const gameLabel =
                    match.gameType ??
                    (course
                      ? weekCardSubtitle(state.league, match, course)
                      : "League match");
                  const opponentId = opponentTeamIdForMatch(
                    match,
                    currentPlayer.teamId,
                  );
                  const opponent = opponentId ? getTeam(opponentId) : undefined;
                  const homeTeam = getTeam(match.teamPairing.homeTeamId);
                  const awayTeam = getTeam(match.teamPairing.awayTeamId);
                  const pointsComputed = leagueMatchPointsResult(
                    match,
                    state.players,
                    course,
                    state.league,
                    state.rounds,
                  );
                  const points = matchPointsForViewer(
                    match,
                    currentPlayer.teamId,
                    pointsComputed,
                  );
                  const isUpcoming =
                    match.status === "scheduled" ||
                    match.status === "in_progress";
                  const expanded = expandedStack === "league";

                  const headline = isUpcoming
                    ? homeTeam && awayTeam
                      ? `Next Up: ${homeTeam.name} vs. ${awayTeam.name}`
                      : "Next Up: League match"
                    : opponent
                      ? `vs ${opponent.name}`
                      : course?.name ?? "League match";

                  return (
                    <HomeStackItem
                      key={match.id}
                      index={index}
                      expanded={expanded}
                      interactive={expanded || index === 0}
                      style={{
                        background: homeLeagueCardGradient(match.id),
                      }}
                      className={
                        isUpcoming && index === 0
                          ? "border-t-[3px] border-t-sand-hunter"
                          : ""
                      }
                      onPress={() => {
                        if (!expanded) {
                          setExpandedStack("league");
                          return;
                        }
                        handleLeagueMatch(match);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="shrink-0 rounded-full border border-sand-hunter/40 bg-white/40 px-2 py-0.5 text-[10px] font-bold tabular-nums tracking-wide text-fairway-300">
                          Week {match.weekNumber}
                        </span>
                      </div>
                      <div className="mt-1 min-w-0 space-y-1.5">
                        <div className="flex items-end justify-between gap-3">
                          <p className="min-w-0 text-base font-medium leading-snug">
                            {headline}
                          </p>
                          {isUpcoming ? (
                            <span
                              className="home-summary-card-score shrink-0 opacity-0"
                              aria-hidden
                            >
                              —
                            </span>
                          ) : (
                            <p className="home-summary-card-score shrink-0">
                              {points ?? "—"}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs font-bold tracking-wide">
                          <span className="shrink-0">
                            {formatLongDate(match.date)}
                          </span>
                          <span className="shrink-0 text-right tabular-nums">
                            {gameLabel}
                          </span>
                        </div>
                      </div>
                    </HomeStackItem>
                  );
                })}
              </HomeStackSection>
            </HomeRiseIn>
          ) : null}

          {modalRecent && modalRecentCourse ? (
            <RecentRoundDetailModal
              open={recentRoundOpen}
              onClose={() => {
                setRecentRoundOpen(false);
                setSelectedRecent(null);
              }}
              player={currentPlayer}
              course={modalRecentCourse}
              recent={modalRecent}
              league={state.league}
            />
          ) : null}

          {leagueMatchDetail && leagueMatchDetailCourse ? (
            <LeagueMatchDetailModal
              open={!!leagueMatchDetailId}
              onClose={() => setLeagueMatchDetailId(null)}
              match={leagueMatchDetail}
              course={leagueMatchDetailCourse}
              league={state.league}
              viewer={currentPlayer}
              players={state.players}
              rounds={state.rounds}
              getTeam={getTeam}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
