import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Course, League, Player, Team, WeeklyMatch } from "../../types";
import { TeamNameMultiline } from "./leagueTeamStack";
import { formatMatchStartTime, shouldShowLeagueStartRound } from "../../utils/matchStart";
import { leagueNineLabel } from "../../utils/player";
import { leagueHolesForRound } from "../../utils/matchScorecard";
import { leagueMatchPairingRows } from "../../utils/leaguePairingDisplay";

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

function formatMatchSubtitle(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function gameTypeLabel(gameType?: string): string {
  const g = (gameType ?? "").toLowerCase();
  if (g.includes("match") && !g.includes("stroke")) return "Match Play";
  if (g.includes("stroke")) return "Stroke Play";
  return gameType ?? "League";
}

function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
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

interface LeagueUpcomingMatchCardProps {
  league: League;
  match: WeeklyMatch;
  course: Course;
  home: Team | undefined;
  away: Team | undefined;
  players: Player[];
  scoresLocked: boolean;
  /** Viewer is on the match that accepts scoring entry (in progress). */
  scoreMatchActive: boolean;
}

export function LeagueUpcomingMatchCard({
  league,
  match,
  course,
  home,
  away,
  players,
  scoresLocked,
  scoreMatchActive,
}: LeagueUpcomingMatchCardProps) {
  const [now, setNow] = useState(() => new Date());
  const holes = leagueHolesForRound(course.holes, league);
  const pairingRows = leagueMatchPairingRows(match, players, holes);
  const nineLabel = leagueNineLabel(league.nineSide);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const withinScoreWindow = shouldShowLeagueStartRound(match, now);
  const scoreEnabled =
    scoreMatchActive && withinScoreWindow && !scoresLocked;

  return (
    <article className="app-glass-card league-upcoming-card border border-white/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="league-upcoming-card__intro min-w-0">
          <p className="league-upcoming-card__week">
            Week {match.weekNumber}
          </p>
          <p className="league-upcoming-card__course">{course.name}</p>
          <p className="league-upcoming-card__meta">
            {formatMatchSubtitle(match.date)}
            <span aria-hidden> • </span>
            {formatMatchStartTime(match)}
            <span aria-hidden> • </span>
            {nineLabel}
          </p>
        </div>
        <span className="league-upcoming-card__game-pill shrink-0">
          {gameTypeLabel(match.gameType)}
        </span>
      </div>

      {home && away ? (
        <div className="mt-4 grid grid-cols-2 items-end gap-2">
          <TeamNameMultiline
            name={home.name}
            uppercase
            align="left"
            className="league-upcoming-card__team"
            lineClassName="league-upcoming-card__team"
          />
          <TeamNameMultiline
            name={away.name}
            uppercase
            align="right"
            className="league-upcoming-card__team"
            lineClassName="league-upcoming-card__team"
          />
        </div>
      ) : null}

      {home && away ? (
        <div
          className="mt-3 border-t border-sand-hunter/25"
          role="separator"
        />
      ) : null}

      {pairingRows.length > 0 ? (
        <div className="mt-3 space-y-2.5">
          {pairingRows.map((row) => {
            const Arrow = row.receiverOnRight ? ArrowRight : ArrowLeft;
            const centerLabel =
              row.strokes === 0
                ? "Even"
                : `${row.strokes} stroke${row.strokes === 1 ? "" : "s"}`;
            return (
              <div
                key={`${row.left.id}-${row.right.id}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
              >
                <p className="league-upcoming-card__player truncate">
                  {firstName(row.left.name)}
                  <span className="league-upcoming-card__player-index">
                    {" "}
                    ({row.left.handicapIndex.toFixed(1)})
                  </span>
                </p>
                <span className="league-upcoming-card__pop inline-flex items-center gap-1 whitespace-nowrap">
                  {centerLabel}
                  <Arrow aria-hidden className="h-3 w-3 shrink-0" strokeWidth={1} />
                </span>
                <p className="league-upcoming-card__player truncate text-right">
                  {firstName(row.right.name)}
                  <span className="league-upcoming-card__player-index">
                    {" "}
                    ({row.right.handicapIndex.toFixed(1)})
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {scoresLocked ? (
          <div
            className="league-score-match-btn league-score-match-btn--locked"
            aria-disabled
          >
            <LockIcon />
            <span>Scores locked</span>
          </div>
        ) : scoreEnabled ? (
          <Link to="/scores/league" className="league-score-match-btn">
            Score match
          </Link>
        ) : (
          <>
            <div
              className="league-score-match-btn league-score-match-btn--disabled"
              aria-disabled
            >
              Score match
            </div>
            {scoreMatchActive ? (
              <p className="league-score-match-hint text-center">
                Not available until 30 minutes before your tee time.
              </p>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
