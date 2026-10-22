import {
  isHolePlayed,
  type LeagueState,
  type PlayerRound,
  type WeeklyMatch,
} from "../types";

function roundIsComplete(round: PlayerRound, holeCount: number): boolean {
  if (round.scores.length < holeCount) return false;
  return round.scores.slice(0, holeCount).every((s) => isHolePlayed(s));
}

/** True once any player has entered a stroke for this match. */
export function matchRoundHasStarted(
  match: WeeklyMatch | undefined,
  state: Pick<LeagueState, "rounds">,
): boolean {
  if (!match) return false;
  const prefix = `${match.id}:`;
  for (const [key, round] of Object.entries(state.rounds)) {
    if (!key.startsWith(prefix)) continue;
    if (round.scores.some((s) => isHolePlayed(s))) return true;
  }
  return false;
}

/** True when this week's scores were submitted and editing is closed. */
export function areMatchScoresLocked(
  match: WeeklyMatch | undefined,
  state: Pick<LeagueState, "rounds">,
  holeCount = 18,
): boolean {
  if (!match) return false;
  if (match.status === "completed") return true;
  if (match.status === "in_progress") return false;

  const prefix = `${match.id}:`;
  const matchRounds = Object.entries(state.rounds)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, round]) => round);

  if (!matchRounds.length) return false;
  return matchRounds.some((round) => roundIsComplete(round, holeCount));
}
