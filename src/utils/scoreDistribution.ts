import type { Hole, RecentRoundScoreDistribution } from "../types";

export function distributionFromScores(
  scores: number[],
  holes: Hole[],
): RecentRoundScoreDistribution {
  const counts: RecentRoundScoreDistribution = {
    birdiesOrBetter: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeys: 0,
    tripleOrWorse: 0,
  };
  for (let i = 0; i < scores.length && i < holes.length; i += 1) {
    const diff = scores[i]! - holes[i]!.par;
    if (diff <= -1) counts.birdiesOrBetter += 1;
    else if (diff === 0) counts.pars += 1;
    else if (diff === 1) counts.bogeys += 1;
    else if (diff === 2) counts.doubleBogeys += 1;
    else counts.tripleOrWorse += 1;
  }
  return counts;
}
