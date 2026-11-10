import type {
  Course,
  League,
  LeagueState,
  Player,
  Team,
  WeeklyMatch,
} from "../types";
import { isTeamBestBallGame } from "./bestBall";
import {
  computeBestBallMatchPoints,
  computeLeagueMatchPoints,
  formatLeaguePointsTotal,
  viewerLeagueOutcome,
  viewerLeaguePointsDisplay,
} from "./leaguePoints";
import { leagueHolesForRound } from "./matchScorecard";

export function upcomingMatchForPlayer(
  player: Player,
  matches: WeeklyMatch[],
): WeeklyMatch | undefined {
  const forTeam = matches.filter(
    (m) =>
      m.teamPairing.homeTeamId === player.teamId ||
      m.teamPairing.awayTeamId === player.teamId,
  );
  const inProgress = forTeam.find((m) => m.status === "in_progress");
  if (inProgress) return inProgress;

  return [...forTeam]
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.weekNumber - b.weekNumber)[0];
}

export function previousCompletedTeamMatches(
  player: Player,
  matches: WeeklyMatch[],
  beforeWeekNumber: number,
): WeeklyMatch[] {
  return matches
    .filter(
      (m) =>
        m.status === "completed" &&
        m.weekNumber < beforeWeekNumber &&
        (m.teamPairing.homeTeamId === player.teamId ||
          m.teamPairing.awayTeamId === player.teamId),
    )
    .sort((a, b) => b.weekNumber - a.weekNumber);
}

export function opponentTeamIdForMatch(
  match: WeeklyMatch,
  teamId: string,
): string | undefined {
  if (match.teamPairing.homeTeamId === teamId) {
    return match.teamPairing.awayTeamId;
  }
  if (match.teamPairing.awayTeamId === teamId) {
    return match.teamPairing.homeTeamId;
  }
  return undefined;
}

function parseLegacyResultLabel(resultLabel: string): {
  userWon: boolean;
  ours: number;
  theirs: number;
} | null {
  const parsed = resultLabel.match(/^(Won|Lost|Tied)\s+([\d½.]+)\s*[–-]\s*([\d½.]+)$/i);
  if (!parsed) return null;
  const parsePt = (s: string) => {
    const t = s.trim();
    if (t === "½") return 0.5;
    if (t.endsWith("½")) {
      const whole = t.slice(0, -1);
      const n = whole === "" ? 0 : Number(whole);
      return Number.isFinite(n) ? n + 0.5 : NaN;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN;
  };
  return {
    userWon: parsed[1].toLowerCase() === "won",
    ours: parsePt(parsed[2]),
    theirs: parsePt(parsed[3]),
  };
}

export function leagueMatchPointsResult(
  match: WeeklyMatch,
  players: Player[],
  course: Course | undefined,
  league: League,
  rounds: LeagueState["rounds"],
) {
  if (!course || match.status !== "completed") return null;
  const holes = leagueHolesForRound(course.holes, league);
  if (isTeamBestBallGame(match.gameType)) {
    return computeBestBallMatchPoints(match, holes, rounds);
  }
  return computeLeagueMatchPoints(match, players, holes, course, league, rounds);
}

/** Points string for the viewer's team, e.g. `2–1`. */
export function matchPointsForViewer(
  match: WeeklyMatch,
  viewerTeamId: string,
  computed?: ReturnType<typeof computeLeagueMatchPoints> | null,
): string | null {
  if (computed) {
    return viewerLeaguePointsDisplay(computed, viewerTeamId);
  }

  const legacy = match.resultLabel
    ? parseLegacyResultLabel(match.resultLabel)
    : null;
  if (legacy) {
    return formatLeaguePointsTotal(legacy.ours, legacy.theirs);
  }

  return null;
}

export function matchOutcomeForViewer(
  match: WeeklyMatch,
  viewerTeamId: string,
  computed?: ReturnType<typeof computeLeagueMatchPoints> | null,
): "won" | "lost" | "tied" | null {
  if (computed) {
    return viewerLeagueOutcome(computed, viewerTeamId);
  }

  const legacy = match.resultLabel?.match(/^(Won|Lost|Tied)\s+/i);
  if (!legacy) return null;
  const key = legacy[1].toLowerCase();
  if (key === "won") return "won";
  if (key === "lost") return "lost";
  return "tied";
}

/** e.g. "Aces won 2–1" from viewer-relative data. */
export function matchResultSummaryLine(
  match: WeeklyMatch,
  viewerTeamId: string,
  getTeam: (id: string) => Team | undefined,
  computed?: ReturnType<typeof computeLeagueMatchPoints> | null,
): string | null {
  const points = matchPointsForViewer(match, viewerTeamId, computed);
  if (!points) return match.resultLabel ?? null;

  const outcome = matchOutcomeForViewer(match, viewerTeamId, computed);
  if (!outcome) return points;

  const winnerTeamId =
    outcome === "won"
      ? viewerTeamId
      : outcome === "lost"
        ? opponentTeamIdForMatch(match, viewerTeamId)
        : undefined;

  if (outcome === "tied") {
    return `Tied ${points}`;
  }

  const winner = winnerTeamId ? getTeam(winnerTeamId) : undefined;
  if (!winner) return points;
  return `${winner.name} won ${points}`;
}
