import type { Hole } from "../types";

export function playableHoles(
  holes: Hole[],
  holeCount: 9 | 18,
  startHole: number,
): Hole[] {
  if (holeCount === 18) return holes;
  const startIdx = Math.max(0, Math.min(holes.length - 1, startHole - 1));
  return holes.slice(startIdx, startIdx + 9);
}
