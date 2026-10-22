import type { Player, Team, WeeklyMatch } from "../types";

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

/** e.g. "Aces won 5-4" from a viewer-relative `resultLabel` like "Won 5–4". */
export function matchResultSummaryLine(
  match: WeeklyMatch,
  viewerTeamId: string,
  getTeam: (id: string) => Team | undefined,
): string | null {
  if (!match.resultLabel) return null;

  const parsed = match.resultLabel.match(/^(Won|Lost)\s+(\d+)\s*[–-]\s*(\d+)$/i);
  if (!parsed) return match.resultLabel;

  const userWon = parsed[1].toLowerCase() === "won";
  const ours = Number(parsed[2]);
  const theirs = Number(parsed[3]);
  const winnerTeamId = userWon
    ? viewerTeamId
    : opponentTeamIdForMatch(match, viewerTeamId);
  const winner = winnerTeamId ? getTeam(winnerTeamId) : undefined;
  const winScore = userWon ? `${ours}-${theirs}` : `${theirs}-${ours}`;

  if (!winner) return winScore;
  return `${winner.name} won ${winScore}`;
}
