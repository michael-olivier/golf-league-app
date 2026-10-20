import type { Hole, HoleScore, Player } from "../types";
import { isHolePlayed } from "../types";
import { playedToPar, playedTotalStrokes } from "../store/LeagueContext";
import { formatToPar } from "./scorecard";

/** Home vs away within a foursome (see admin foursome assignment). */
export function foursomeMatchPairs(playerIds: string[]): [string, string][] {
  if (playerIds.length >= 4) {
    return [
      [playerIds[0], playerIds[2]],
      [playerIds[1], playerIds[3]],
    ];
  }
  const pairs: [string, string][] = [];
  for (let i = 0; i + 1 < playerIds.length; i += 2) {
    pairs.push([playerIds[i], playerIds[i + 1]]);
  }
  return pairs;
}

function strokeDifference(indexA: number, indexB: number): number {
  return Math.max(0, Math.round(Math.abs(indexA - indexB)));
}

function popsOnHole(
  playerIndex: number,
  opponentIndex: number,
  holeStrokeIndex: number,
): number {
  const diff = strokeDifference(playerIndex, opponentIndex);
  if (diff === 0 || playerIndex <= opponentIndex) return 0;
  return holeStrokeIndex <= diff ? 1 : 0;
}

export interface HeadToHeadMatchResult {
  playerAId: string;
  playerBId: string;
  strokeLabel: string;
  holesWonA: number;
  holesWonB: number;
  matchStatus: string;
  totalA: number;
  totalB: number;
  toParA: string;
  toParB: string;
}

export function computeHeadToHeadMatch(
  playerA: Player,
  playerB: Player,
  holes: Hole[],
  scoresA: HoleScore[],
  scoresB: HoleScore[],
): HeadToHeadMatchResult {
  const pars = holes.map((h) => h.par);
  const totalA = playedTotalStrokes(scoresA);
  const totalB = playedTotalStrokes(scoresB);
  const toParA = formatToPar(playedToPar(scoresA, pars));
  const toParB = formatToPar(playedToPar(scoresB, pars));

  const diff = strokeDifference(playerA.handicapIndex, playerB.handicapIndex);
  let strokeLabel = "Even strokes";
  if (diff > 0) {
    const receiver =
      playerA.handicapIndex > playerB.handicapIndex ? playerA : playerB;
    const first = receiver.name.split(/\s+/)[0] ?? receiver.name;
    strokeLabel = `${first} receives ${diff} stroke${diff === 1 ? "" : "s"}`;
  }

  let holesWonA = 0;
  let holesWonB = 0;

  for (let i = 0; i < holes.length; i++) {
    const hole = holes[i];
    const scoreA = scoresA[i];
    const scoreB = scoresB[i];
    if (!isHolePlayed(scoreA) || !isHolePlayed(scoreB)) continue;

    const grossA = scoreA.strokes!;
    const grossB = scoreB.strokes!;

    const netA =
      grossA -
      popsOnHole(playerA.handicapIndex, playerB.handicapIndex, hole.handicapIndex);
    const netB =
      grossB -
      popsOnHole(playerB.handicapIndex, playerA.handicapIndex, hole.handicapIndex);

    if (netA < netB) holesWonA++;
    else if (netB < netA) holesWonB++;
  }

  const lead = holesWonA - holesWonB;
  let matchStatus = "All square";
  if (lead > 0) {
    matchStatus = `${playerA.name.split(/\s+/)[0]} ${lead} up`;
  } else if (lead < 0) {
    matchStatus = `${playerB.name.split(/\s+/)[0]} ${-lead} up`;
  }

  return {
    playerAId: playerA.id,
    playerBId: playerB.id,
    strokeLabel,
    holesWonA,
    holesWonB,
    matchStatus,
    totalA,
    totalB,
    toParA,
    toParB,
  };
}

export function formatPlayerTotal(total: number, toParFormatted: string): string {
  return `${total} (${toParFormatted})`;
}
