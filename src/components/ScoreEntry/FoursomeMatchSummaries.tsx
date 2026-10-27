import type { Hole, HoleScore, Player } from "../../types";
import { isHolePlayed } from "../../types";
import {
  computeHeadToHeadMatch,
  formatPlayerTotal,
  foursomeMatchPairs,
  playerGetsStrokeOnHole,
} from "../../utils/matchPlay";

interface FoursomeMatchSummariesProps {
  players: Player[];
  holes: Hole[];
  scoresForPlayer: (playerId: string) => HoleScore[] | undefined;
  /** When false, compare gross scores (match gross). Default true. */
  applyHandicapStrokes?: boolean;
}

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

function StrokePopMarker() {
  return (
    <span
      className="size-1 shrink-0 rounded-full bg-sand-hunter"
      aria-hidden
    />
  );
}

function HoleComparisonRow({
  hole,
  playerA,
  playerB,
  scoreA,
  scoreB,
  showPops,
}: {
  hole: Hole;
  playerA: Player;
  playerB: Player;
  scoreA: HoleScore | undefined;
  scoreB: HoleScore | undefined;
  showPops: boolean;
}) {
  const popA =
    showPops && playerGetsStrokeOnHole(playerA, playerB, hole);
  const popB =
    showPops && playerGetsStrokeOnHole(playerB, playerA, hole);
  const strokesA =
    scoreA && isHolePlayed(scoreA) ? String(scoreA.strokes) : "—";
  const strokesB =
    scoreB && isHolePlayed(scoreB) ? String(scoreB.strokes) : "—";

  return (
    <div className="grid grid-cols-[2.25rem_1fr_1fr] items-center gap-2 text-sm">
      <span className="text-xs font-medium tabular-nums text-fairway-500">
        {hole.number}
      </span>
      <div className="flex min-w-0 items-center justify-end gap-2 tabular-nums">
        <span className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-fairway-300">
          {popA ? <StrokePopMarker /> : null}
          <span className="truncate">{firstName(playerA.name)}</span>
        </span>
        <span className="font-semibold text-sand-hunter">{strokesA}</span>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2 tabular-nums">
        <span className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-fairway-300">
          {popB ? <StrokePopMarker /> : null}
          <span className="truncate">{firstName(playerB.name)}</span>
        </span>
        <span className="font-semibold text-sand-hunter">{strokesB}</span>
      </div>
    </div>
  );
}

function MatchPairCard({
  playerA,
  playerB,
  holes,
  scoresA,
  scoresB,
  applyHandicapStrokes,
}: {
  playerA: Player;
  playerB: Player;
  holes: Hole[];
  scoresA: HoleScore[];
  scoresB: HoleScore[];
  applyHandicapStrokes: boolean;
}) {
  const result = computeHeadToHeadMatch(
    playerA,
    playerB,
    holes,
    scoresA,
    scoresB,
    { applyHandicapStrokes },
  );

  const hasHoleRows = holes.some((_, i) => {
    const a = scoresA[i];
    const b = scoresB[i];
    return isHolePlayed(a) || isHolePlayed(b);
  });

  return (
    <div className="rounded-[8px] bg-white p-3">
      <p className="mb-3 text-center text-xs font-medium text-fairway-400">
        {result.strokeLabel}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <PlayerMatchColumn
          name={playerA.name}
          total={formatPlayerTotal(result.totalA, result.toParA)}
          holesWon={result.holesWonA}
        />
        <PlayerMatchColumn
          name={playerB.name}
          total={formatPlayerTotal(result.totalB, result.toParB)}
          holesWon={result.holesWonB}
        />
      </div>

      {hasHoleRows ? (
        <div className="mt-3 space-y-2 border-t border-fairway-800/20 pt-3">
          {holes.map((hole, i) => {
            const scoreA = scoresA[i];
            const scoreB = scoresB[i];
            if (!isHolePlayed(scoreA) && !isHolePlayed(scoreB)) return null;
            return (
              <HoleComparisonRow
                key={hole.number}
                hole={hole}
                playerA={playerA}
                playerB={playerB}
                scoreA={scoreA}
                scoreB={scoreB}
                showPops={applyHandicapStrokes}
              />
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 text-center text-xs font-semibold text-fairway-300">
        {result.matchStatus}
      </p>
    </div>
  );
}

function PlayerMatchColumn({
  name,
  total,
  holesWon,
}: {
  name: string;
  total: string;
  holesWon: number;
}) {
  return (
    <div className="text-center">
      <p className="truncate text-sm font-medium text-fairway-200">{name}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-sand-hunter">
        {total}
      </p>
      <p className="mt-1 text-xs text-fairway-500">
        {holesWon} hole{holesWon === 1 ? "" : "s"} won
      </p>
    </div>
  );
}

export function FoursomeMatchSummaries({
  players,
  holes,
  scoresForPlayer,
  applyHandicapStrokes = true,
}: FoursomeMatchSummariesProps) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const pairs = foursomeMatchPairs(players.map((p) => p.id));

  return (
    <div className="space-y-3">
      {pairs.map(([idA, idB]) => {
        const playerA = byId.get(idA);
        const playerB = byId.get(idB);
        const scoresA = scoresForPlayer(idA);
        const scoresB = scoresForPlayer(idB);
        if (!playerA || !playerB || !scoresA || !scoresB) return null;
        return (
          <MatchPairCard
            key={`${idA}-${idB}`}
            playerA={playerA}
            playerB={playerB}
            holes={holes}
            scoresA={scoresA}
            scoresB={scoresB}
            applyHandicapStrokes={applyHandicapStrokes}
          />
        );
      })}
    </div>
  );
}
