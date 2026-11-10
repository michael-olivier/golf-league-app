import type { Hole, HoleScore } from "../types";
import { isHolePlayed } from "../types";

export function isTeamBestBallGame(gameType?: string): boolean {
  return (gameType ?? "").toLowerCase().includes("best ball");
}

/** Per-hole team score: lowest played stroke among partners (team card entry). */
export function teamBestBallHoleStrokes(
  partnerScores: (HoleScore[] | undefined)[],
  holeIndex: number,
): number | null {
  const values = partnerScores
    .map((scores) => scores?.[holeIndex])
    .filter((score): score is HoleScore => !!score && isHolePlayed(score))
    .map((score) => score.strokes!);
  if (values.length === 0) return null;
  return Math.min(...values);
}

export function teamBestBallTotals(
  partnerScores: (HoleScore[] | undefined)[],
  holes: Hole[],
): { byHole: (number | null)[]; total: number | null } {
  const byHole = holes.map((_, index) =>
    teamBestBallHoleStrokes(partnerScores, index),
  );
  const played = byHole.filter((v): v is number => v != null);
  const total = played.length > 0 ? played.reduce((a, b) => a + b, 0) : null;
  return { byHole, total };
}

export function teamBestBallScorecardHasData(
  partnerScores: (HoleScore[] | undefined)[],
  holes: Hole[],
): boolean {
  return holes.some((_, index) =>
    teamBestBallHoleStrokes(partnerScores, index) != null,
  );
}
