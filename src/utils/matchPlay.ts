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

export function popsOnHole(
  playerIndex: number,
  opponentIndex: number,
  holeStrokeIndex: number,
): number {
  const diff = strokeDifference(playerIndex, opponentIndex);
  if (diff === 0 || playerIndex <= opponentIndex) return 0;
  return holeStrokeIndex <= diff ? 1 : 0;
}

/** Handicap strokes `player` receives over the round vs one opponent. */
export function handicapStrokesVsOpponent(
  playerHandicapIndex: number,
  opponentHandicapIndex: number,
  holes: Hole[],
): number {
  let total = 0;
  for (const hole of holes) {
    total += popsOnHole(
      playerHandicapIndex,
      opponentHandicapIndex,
      hole.handicapIndex,
    );
  }
  return total;
}

/** Head-to-head opponent for match play (foursome pairing rules). */
export function matchOpponentForPlayer(
  playerId: string,
  players: Player[],
): Player | undefined {
  const byId = new Map(players.map((p) => [p.id, p]));
  for (const [a, b] of foursomeMatchPairs(players.map((p) => p.id))) {
    if (a === playerId) return byId.get(b);
    if (b === playerId) return byId.get(a);
  }
  return undefined;
}

/** True when `player` receives a handicap stroke on this hole vs `opponent`. */
export function playerGetsStrokeOnHole(
  player: Player,
  opponent: Player,
  hole: Hole,
): boolean {
  return (
    popsOnHole(
      player.handicapIndex,
      opponent.handicapIndex,
      hole.handicapIndex,
    ) > 0
  );
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
  options?: { applyHandicapStrokes?: boolean },
): HeadToHeadMatchResult {
  const applyHandicap = options?.applyHandicapStrokes !== false;
  const pars = holes.map((h) => h.par);
  const totalA = playedTotalStrokes(scoresA);
  const totalB = playedTotalStrokes(scoresB);
  const toParA = formatToPar(playedToPar(scoresA, pars));
  const toParB = formatToPar(playedToPar(scoresB, pars));

  let strokeLabel = applyHandicap ? "Even strokes" : "Gross — no strokes";
  if (applyHandicap) {
    const diff = strokeDifference(playerA.handicapIndex, playerB.handicapIndex);
    if (diff > 0) {
      const receiver =
        playerA.handicapIndex > playerB.handicapIndex ? playerA : playerB;
      const first = receiver.name.split(/\s+/)[0] ?? receiver.name;
      strokeLabel = `${first} receives ${diff} stroke${diff === 1 ? "" : "s"}`;
    }
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

    const netA = applyHandicap
      ? grossA -
        popsOnHole(
          playerA.handicapIndex,
          playerB.handicapIndex,
          hole.handicapIndex,
        )
      : grossA;
    const netB = applyHandicap
      ? grossB -
        popsOnHole(
          playerB.handicapIndex,
          playerA.handicapIndex,
          hole.handicapIndex,
        )
      : grossB;

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

/** e.g. `Holes 1 & 4` or `Holes 1, 4, & 9` for match-play stroke allocation. */
export function formatPopHoleList(holeNumbers: number[]): string {
  if (holeNumbers.length === 0) return "";
  if (holeNumbers.length === 1) return `Hole ${holeNumbers[0]}`;
  if (holeNumbers.length === 2) {
    return `Holes ${holeNumbers[0]} & ${holeNumbers[1]}`;
  }
  const head = holeNumbers.slice(0, -1).join(", ");
  return `Holes ${head}, & ${holeNumbers[holeNumbers.length - 1]}`;
}

/** Hole numbers (course) where `receiver` gets a stroke vs `opponent` on this set of holes. */
export function popHoleNumbersForMatch(
  receiver: Player,
  opponent: Player,
  holes: Hole[],
): number[] {
  if (receiver.handicapIndex <= opponent.handicapIndex) return [];
  return holes
    .filter((hole) => playerGetsStrokeOnHole(receiver, opponent, hole))
    .map((hole) => hole.number)
    .sort((a, b) => a - b);
}

export function higherHandicapPlayer(a: Player, b: Player): Player {
  return a.handicapIndex >= b.handicapIndex ? a : b;
}
