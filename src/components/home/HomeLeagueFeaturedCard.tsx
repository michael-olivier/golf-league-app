import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type {
  Course,
  League,
  LeagueState,
  Player,
  Team,
  WeeklyMatch,
} from "../../types";
import { rosterSlots } from "../league/MatchFoursomeRoster";
import { TeamNameMultiline } from "../league/leagueTeamStack";
import { leagueNineLabel } from "../../utils/player";
import {
  leagueMatchPointsResult,
  matchPointsForViewer,
  opponentTeamIdForMatch,
} from "../../utils/leagueMatch";
import { HomePassExpandable } from "./HomePassExpandable";
import {
  foursomeMatchPairs,
  formatPopHoleList,
  popHoleNumbersForMatch,
} from "../../utils/matchPlay";
import { leagueHolesForRound } from "../../utils/matchScorecard";
import {
  formatMatchStartTime,
  shouldShowLeagueStartRound,
} from "../../utils/matchStart";
import { scrollEndAboveBottomNav } from "../../utils/scrollAboveBottomNav";

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

function formatMatchWhen(dateIso: string): string {
  const d = new Date(dateIso);
  const date = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return date;
}

interface HomeLeagueFeaturedCardProps {
  match: WeeklyMatch;
  league: League;
  players: Player[];
  viewer: Player;
  rounds: LeagueState["rounds"];
  recentMatches: WeeklyMatch[];
  getCourse: (id: string) => Course | undefined;
  getTeam: (id: string) => Team | undefined;
  onStartRound: () => void;
  onOpenMatch: (match: WeeklyMatch) => void;
}

export function HomeLeagueFeaturedCard({
  match,
  league,
  players,
  viewer,
  rounds,
  recentMatches,
  getCourse,
  getTeam,
  onStartRound,
  onOpenMatch,
}: HomeLeagueFeaturedCardProps) {
  const [matchesExpanded, setMatchesExpanded] = useState(false);
  const leagueCardRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => new Date());
  const showStartRound = shouldShowLeagueStartRound(match, now);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!matchesExpanded || !leagueCardRef.current) return;
    scrollEndAboveBottomNav(leagueCardRef.current, {
      expandSelector: "#home-league-recent-matches",
    });
  }, [matchesExpanded]);
  const course = getCourse(match.courseId);
  const homeTeam = getTeam(match.teamPairing.homeTeamId);
  const awayTeam = getTeam(match.teamPairing.awayTeamId);
  const holes = course ? leagueHolesForRound(course.holes, league) : [];
  const slots = rosterSlots(
    match,
    players,
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  );
  const foursomeIds = match.foursomes[0]?.playerIds ?? [];
  const pairs =
    foursomeIds.length >= 4
      ? foursomeMatchPairs(foursomeIds)
      : ([
          [slots.homeA?.id, slots.awayA?.id],
          [slots.homeB?.id, slots.awayB?.id],
        ].filter(
          (p): p is [string, string] => !!p[0] && !!p[1],
        ) as [string, string][]);

  const pairingRows = pairs
    .map(([idA, idB]) => {
      const playerA = players.find((p) => p.id === idA);
      const playerB = players.find((p) => p.id === idB);
      if (!playerA || !playerB) return null;
      const receiver =
        playerA.handicapIndex > playerB.handicapIndex ? playerA : playerB;
      const giver =
        playerA.handicapIndex > playerB.handicapIndex ? playerB : playerA;
      const popHoles = popHoleNumbersForMatch(receiver, giver, holes);
      return { playerA, playerB, popHoles };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);

  const gameLabel = match.gameType ?? "League";
  const nineLabel = leagueNineLabel(league.nineSide);

  return (
    <article
      ref={leagueCardRef}
      className="app-glass-card home-pass-card home-pass-card--league border border-white/60 text-[#243f2d]"
    >
      <h2 className="text-xl font-bold leading-tight text-[#243f2d]">
        {homeTeam?.name ?? "Home"}
        <span className="font-medium text-[#243f2d]/70"> vs. </span>
        {awayTeam?.name ?? "Away"}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#243f2d]/90">
        <span>{formatMatchWhen(match.date)}</span>
        <span className="text-[#243f2d]/45" aria-hidden>
          •
        </span>
        <span>{formatMatchStartTime(match)}</span>
        <span className="text-[#243f2d]/45" aria-hidden>
          •
        </span>
        <span>{nineLabel}</span>
        <span className="league-game-type-pill ml-auto shrink-0">
          {gameLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="home-pass-league-team-names grid grid-cols-2 items-end gap-2">
          <TeamNameMultiline
            name={homeTeam?.name ?? "Home"}
            uppercase
            align="left"
            className="home-pass-league-team-name"
            lineClassName="home-pass-league-team-name"
          />
          <TeamNameMultiline
            name={awayTeam?.name ?? "Away"}
            uppercase
            align="right"
            className="home-pass-league-team-name"
            lineClassName="home-pass-league-team-name"
          />
        </div>
        {pairingRows.map((row) => (
          <div
            key={`${row.playerA.id}-${row.playerB.id}`}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm"
          >
            <p className="truncate font-medium text-[#243f2d]">
              {firstName(row.playerA.name)}
              <span className="text-[#243f2d]/72">
                {" "}
                ({row.playerA.handicapIndex.toFixed(1)})
              </span>
            </p>
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[#243f2d]/90">
              {row.popHoles.length > 0
                ? formatPopHoleList(row.popHoles)
                : "Even"}
              <ArrowRight
                aria-hidden
                className="h-3 w-3 shrink-0"
                strokeWidth={1}
              />
            </span>
            <p className="truncate text-right font-medium text-[#243f2d]">
              {firstName(row.playerB.name)}
              <span className="text-[#243f2d]/72">
                {" "}
                ({row.playerB.handicapIndex.toFixed(1)})
              </span>
            </p>
          </div>
        ))}
      </div>

      {showStartRound ? (
        <button
          type="button"
          onClick={onStartRound}
          className="home-pass-cta mt-5 w-full rounded-full bg-white py-3 text-center text-sm font-bold tracking-wide text-sand-hunter transition active:scale-[0.98]"
        >
          Start Round
        </button>
      ) : null}

      <div
        className={`home-pass-disclosure ${showStartRound ? "mt-4" : "mt-5"}`}
      >
        <button
          type="button"
          aria-expanded={matchesExpanded}
          aria-controls="home-league-recent-matches"
          onClick={() => setMatchesExpanded((open) => !open)}
          className="home-pass-footer border-t border-sand-hunter/20"
        >
          <span>Recent matches</span>
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${
              matchesExpanded ? "rotate-180" : ""
            }`}
            strokeWidth={1}
          />
        </button>

        {recentMatches.length > 0 ? (
          <HomePassExpandable
            id="home-league-recent-matches"
            open={matchesExpanded}
            contentClassName="home-pass-expand__content"
          >
            <ul className="home-pass-league-recent-list">
              {recentMatches.map((past) => {
                const pastCourse = getCourse(past.courseId);
                const opponentId = opponentTeamIdForMatch(past, viewer.teamId);
                const opponent = opponentId ? getTeam(opponentId) : undefined;
                const pointsComputed =
                  pastCourse != null
                    ? leagueMatchPointsResult(
                        past,
                        players,
                        pastCourse,
                        league,
                        rounds,
                      )
                    : undefined;
                const points = matchPointsForViewer(
                  past,
                  viewer.teamId,
                  pointsComputed,
                );
                return (
                  <li key={past.id}>
                    <button
                      type="button"
                      onClick={() => onOpenMatch(past)}
                      className="home-pass-league-recent-row"
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <p className="home-pass-league-recent-title">
                          Week {past.weekNumber}
                          {opponent ? <> vs {opponent.name}</> : null}
                        </p>
                        <p className="home-pass-league-recent-meta mt-1 tabular-nums">
                          {formatMatchWhen(past.date)}
                          <span className="mx-1.5 text-[#243f2d]/45" aria-hidden>
                            •
                          </span>
                          {past.gameType ?? "League"}
                        </p>
                      </div>
                      {points != null ? (
                        <span className="home-pass-league-recent-points home-pass-league-recent-points-col tabular-nums">
                          {points.replace(/\u2013/g, "-")}
                        </span>
                      ) : (
                        <span
                          className="home-pass-league-recent-points-col"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </HomePassExpandable>
        ) : null}
      </div>
    </article>
  );
}
