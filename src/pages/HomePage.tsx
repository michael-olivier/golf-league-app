import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import {
  HomeRiseIn,
  homeCardRiseIndices,
} from "../components/home/HomeRiseIn";
import { ScoreTrendSparkline } from "../components/home/ScoreTrendSparkline";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { LeagueScorecardTable } from "../components/ScoreEntry/LeagueScorecardTable";
import {
  MakeupUrgentBanner,
  useMakeupAttention,
} from "../components/league/MakeupUrgentBanner";
import { useLeague } from "../store/LeagueContext";
import { formatToPar } from "../utils/scorecard";
import {
  matchResultSummaryLine,
  previousCompletedTeamMatches,
  upcomingMatchForPlayer,
} from "../utils/leagueMatch";
import {
  leagueHolesForRound,
  scorecardPlayersForMatch,
  scorecardTitleForMatch,
} from "../utils/matchScorecard";
import { leagueNineLabel } from "../utils/player";
import { playableHoles } from "../utils/playableHoles";
import { weekCardSubtitle } from "../utils/weekDisplay";
import { assetUrl } from "../utils/assetUrl";
import {
  markHomeEntrancePlayed,
  shouldPlayHomeEntrance,
} from "../components/home/homeMotion";

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function weekFormatLabel(
  weekNumber: number,
  format: string,
): string {
  return `Week ${weekNumber} - ${format}`;
}

function nextUpHeading(
  weekNumber: number,
  gameType: string | undefined,
  courseName: string,
): string {
  const format = gameType ?? courseName;
  return `Next up: ${weekFormatLabel(weekNumber, format)}`;
}

export function HomePage() {
  const {
    currentPlayer,
    getCourse,
    getTeam,
    state,
    getRound,
  } = useLeague();

  const [resultsMatchId, setResultsMatchId] = useState<string | null>(null);

  const openResultsDrawer = (matchId: string) => {
    setResultsMatchId(matchId);
  };

  const { attentionCount: makeupAttention } = useMakeupAttention();

  const recent = currentPlayer.recentRound;
  const recentCourse = recent ? getCourse(recent.courseId) : undefined;
  const recentPar =
    recentCourse && recent
      ? playableHoles(
          recentCourse.holes,
          recent.holeCount === 18 ? 18 : 9,
          1,
        ).reduce((sum, h) => sum + h.par, 0)
      : null;
  const recentToPar =
    recent && recentPar != null ? recent.strokes - recentPar : null;

  const upcoming = upcomingMatchForPlayer(currentPlayer, state.matches);
  const upcomingCourse = upcoming ? getCourse(upcoming.courseId) : undefined;
  const homeTeam = upcoming
    ? getTeam(upcoming.teamPairing.homeTeamId)
    : undefined;
  const awayTeam = upcoming
    ? getTeam(upcoming.teamPairing.awayTeamId)
    : undefined;

  const previousResults = previousCompletedTeamMatches(
    currentPlayer,
    state.matches,
    upcoming?.weekNumber ?? Number.MAX_SAFE_INTEGER,
  );

  const resultsMatch = useMemo(
    () =>
      resultsMatchId
        ? state.matches.find((m) => m.id === resultsMatchId)
        : undefined,
    [resultsMatchId, state.matches],
  );

  const resultsCourse = resultsMatch
    ? getCourse(resultsMatch.courseId)
    : undefined;
  const resultsHoles =
    resultsCourse && resultsMatch
      ? leagueHolesForRound(resultsCourse.holes, state.league)
      : [];
  const resultsPlayers = resultsMatch
    ? scorecardPlayersForMatch(resultsMatch, state.players)
    : [];

  const homeLogoUrl = state.league.homeLogoUrl
    ? assetUrl(state.league.homeLogoUrl)
    : null;

  const hasRecent = !!(recent && recentCourse);
  const rise = useMemo(
    () =>
      homeCardRiseIndices({
        hasMakeup: makeupAttention > 0,
        hasRecent,
      }),
    [makeupAttention, hasRecent],
  );

  const playEntrance = useRef(shouldPlayHomeEntrance()).current;

  useEffect(() => {
    if (playEntrance) markHomeEntrancePlayed();
  }, [playEntrance]);

  return (
    <div className="min-h-full flex-1 space-y-4 pb-4">
      {homeLogoUrl ? (
        <div className="flex justify-center py-2">
          <img
            src={homeLogoUrl}
            alt="Sandbagger"
            width={320}
            height={64}
            className={`h-12 w-auto max-w-full object-contain ${playEntrance ? "home-logo-in" : ""}`}
          />
        </div>
      ) : null}

      {makeupAttention > 0 && rise.makeup >= 0 ? (
        <HomeRiseIn index={rise.makeup} animate={playEntrance}>
          <MakeupUrgentBanner surface="hunter" />
        </HomeRiseIn>
      ) : null}

      <HomeRiseIn index={rise.profile} animate={playEntrance}>
      <section className="rounded-[8px] border border-sand-hunter bg-white p-4">
        <div className="flex items-start gap-3">
          <PlayerAvatar player={currentPlayer} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-fairway-300">
              {currentPlayer.name}
            </p>
            <p className="mt-1 text-sm text-fairway-500">
              GHIN #{currentPlayer.ghinNumber}
            </p>
            <p className="text-sm text-fairway-500">
              GHIN handicap{" "}
              <span className="font-semibold tabular-nums text-fairway-300">
                {currentPlayer.handicapIndex.toFixed(1)}
              </span>
            </p>
          </div>
        </div>
      </section>
      </HomeRiseIn>

      {recent && recentCourse && rise.recent >= 0 ? (
        <HomeRiseIn index={rise.recent} animate={playEntrance}>
        <section className="rounded-[8px] border border-sand-hunter bg-white p-4">
          <p className="card-title">
            Most recent round
          </p>
          <div className="mt-2 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fairway-300">
                {recentCourse.name}
              </p>
              <p className="text-sm text-fairway-500">
                {formatLongDate(recent.playedOn)} · {recent.holeCount} holes ·{" "}
                <span className="font-semibold tabular-nums text-fairway-300">
                  {recent.strokes}
                </span>
                {recentToPar != null ? (
                  <span className="tabular-nums">
                    {" "}
                    ({formatToPar(recentToPar)})
                  </span>
                ) : null}
              </p>
            </div>
            {currentPlayer.recentScoreToParTrend &&
            currentPlayer.recentScoreToParTrend.length >= 2 ? (
              <ScoreTrendSparkline
                values={currentPlayer.recentScoreToParTrend}
                className="mt-0.5 shrink-0"
              />
            ) : null}
          </div>
        </section>
        </HomeRiseIn>
      ) : null}

      {upcoming && upcomingCourse ? (
        <HomeRiseIn index={rise.league} animate={playEntrance}>
        <section className="rounded-[8px] border border-sand-hunter bg-white p-4">
          <p className="card-title">
            League play
          </p>
          <Link
            to="/league"
            className="-mx-1 mt-2 block rounded-lg px-1 py-0.5 transition hover:bg-fairway-950/5 active:bg-fairway-950/10"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold leading-snug text-fairway-300">
                {nextUpHeading(
                  upcoming.weekNumber,
                  upcoming.gameType,
                  weekCardSubtitle(state.league, upcoming, upcomingCourse),
                )}
              </p>
              <span className="shrink-0 rounded-full border border-fairway-800/40 bg-fairway-950/5 px-2.5 py-1 text-xs font-medium tabular-nums text-fairway-500">
                {formatLongDate(upcoming.date)}
              </span>
            </div>
            {homeTeam && awayTeam ? (
              <p className="mt-1.5 text-sm leading-snug text-fairway-300">
                {homeTeam.name}
                <span className="text-fairway-500"> vs </span>
                {awayTeam.name}
              </p>
            ) : null}
          </Link>

          {previousResults.length > 0 ? (
            <>
              <div
                className="my-4 border-t border-fairway-800/25"
                role="separator"
              />
              <p className="mb-2 card-title">
                Previous week
              </p>
              <ul className="space-y-3">
                {previousResults.map((match) => {
                  const course = getCourse(match.courseId);
                  const formatLabel =
                    match.gameType ??
                    (course
                      ? weekCardSubtitle(state.league, match, course)
                      : "League match");
                  const resultSummary = matchResultSummaryLine(
                    match,
                    currentPlayer.teamId,
                    getTeam,
                  );

                  return (
                    <li key={match.id} className="space-y-1.5 text-sm">
                      <p className="font-medium leading-snug text-fairway-300">
                        {weekFormatLabel(match.weekNumber, formatLabel)}
                      </p>
                      {resultSummary || match.resultLabel ? (
                        <div className="flex items-center justify-between gap-3">
                          {resultSummary ? (
                            <p className="min-w-0 font-medium leading-snug text-fairway-300">
                              {resultSummary}
                            </p>
                          ) : (
                            <span />
                          )}
                          {match.resultLabel ? (
                            <button
                              type="button"
                              onClick={() => openResultsDrawer(match.id)}
                              className="shrink-0 font-medium text-sand-hunter underline-offset-2 hover:underline"
                            >
                              View results
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </section>
        </HomeRiseIn>
      ) : null}

      <BottomSheet
        open={!!resultsMatchId}
        onClose={() => setResultsMatchId(null)}
        title={
          resultsMatch
            ? scorecardTitleForMatch(resultsMatch, state.league)
            : "Scorecard"
        }
        tone="white"
        contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        {resultsMatch && resultsCourse && resultsHoles.length > 0 ? (
          <LeagueScorecardTable
            courseName={resultsCourse.name}
            nineLabel={leagueNineLabel(state.league.nineSide)}
            holes={resultsHoles}
            players={resultsPlayers}
            scoresForPlayer={(id) => getRound(resultsMatch.id, id)?.scores}
          />
        ) : null}
      </BottomSheet>
    </div>
  );
}
