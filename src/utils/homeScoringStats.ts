import type { Course, League, Player, PlayerRecentRound } from "../types";
import { leagueHolesForRound } from "./matchScorecard";

/** 18-hole equivalent scoring average for display (nine-hole rounds doubled). */
export function homeScoringAverage18(rounds: PlayerRecentRound[]): number | null {
  if (rounds.length === 0) return null;
  const total = rounds.reduce(
    (sum, r) => sum + (r.holeCount === 9 ? r.strokes * 2 : r.strokes),
    0,
  );
  return total / rounds.length;
}

export function roundGrossToPar(
  round: PlayerRecentRound,
  course: Course | undefined,
  league: League,
): number | null {
  if (!course || !round.holeScores?.length) return null;
  const holes =
    round.holeCount === 18
      ? course.holes
      : leagueHolesForRound(course.holes, league);
  let strokes = 0;
  let par = 0;
  for (let i = 0; i < Math.min(round.holeScores.length, holes.length); i++) {
    const holeStrokes = round.holeScores[i];
    if (holeStrokes == null || holeStrokes <= 0) continue;
    strokes += holeStrokes;
    par += holes[i].par;
  }
  if (strokes === 0) return null;
  return strokes - par;
}

export function homeAverageToPar(
  player: Player,
  rounds: PlayerRecentRound[],
  courseForRound: (r: PlayerRecentRound) => Course | undefined,
  league: League,
): number | null {
  const fromTrend = player.recentScoreToParTrend;
  if (fromTrend?.length) {
    const sum = fromTrend.reduce((a, b) => a + b, 0);
    return sum / fromTrend.length;
  }
  const vals = rounds
    .map((r) => roundGrossToPar(r, courseForRound(r), league))
    .filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
