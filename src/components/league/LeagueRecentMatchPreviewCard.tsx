import type { Course, League, LeagueState, Player, Team, WeeklyMatch } from "../../types";
import { LeagueFinalScoresCard } from "./LeagueFinalScoresCard";
import {
  leagueMatchPointsResult,
  matchPointsForViewer,
} from "../../utils/leagueMatch";
import { leagueHolesForRound, scoresForMatchPlayer } from "../../utils/matchScorecard";

function formatSubtitle(gameType: string | undefined): string {
  const g = (gameType ?? "").toLowerCase();
  if (g.includes("match") && !g.includes("stroke")) return "Match Play";
  return "Stroke Play";
}

function displayPoints(points: string | null): string {
  if (points == null) return "—";
  return points.replace(/\u2013/g, "-");
}

interface LeagueRecentMatchPreviewCardProps {
  match: WeeklyMatch;
  course: Course;
  league: League;
  viewer: Player;
  players: Player[];
  rounds: LeagueState["rounds"];
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  onOpen: () => void;
}

export function LeagueRecentMatchPreviewCard({
  match,
  course,
  league,
  viewer,
  players,
  rounds,
  homeTeam,
  awayTeam,
  onOpen,
}: LeagueRecentMatchPreviewCardProps) {
  const holes = leagueHolesForRound(course.holes, league);
  const pointsResult = leagueMatchPointsResult(
    match,
    players,
    course,
    league,
    rounds,
  );
  const points = matchPointsForViewer(match, viewer.teamId, pointsResult);
  const formatLabel = formatSubtitle(match.gameType);

  const scoresForPlayer = (playerId: string) =>
    scoresForMatchPlayer(rounds, match.id, playerId);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="league-recent-preview-card w-full border border-sand-hunter text-left"
    >
      <header className="league-recent-preview-card__header">
        <div>
          <p className="league-recent-preview-card__week">
            Week {match.weekNumber}
          </p>
          <p className="league-recent-preview-card__course">{course.name}</p>
        </div>
        <div className="text-right">
          <p className="league-summary-header-score league-recent-preview-card__score tabular-nums text-fairway-300">
            {displayPoints(points)}
          </p>
          <p className="league-recent-preview-card__format">{formatLabel}</p>
        </div>
      </header>

      {pointsResult && pointsResult.pairings.length > 0 ? (
        <div className="mt-4">
          <LeagueFinalScoresCard
            embedded
            result={pointsResult}
            players={players}
            viewerTeamId={viewer.teamId}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            holes={holes}
            course={course}
            league={league}
            scoresForPlayer={scoresForPlayer}
          />
        </div>
      ) : null}
    </button>
  );
}
