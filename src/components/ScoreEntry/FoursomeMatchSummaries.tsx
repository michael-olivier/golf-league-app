import type { Hole, HoleScore, Player } from "../../types";
import {
  computeHeadToHeadMatch,
  formatPlayerTotal,
  foursomeMatchPairs,
} from "../../utils/matchPlay";

interface FoursomeMatchSummariesProps {
  players: Player[];
  holes: Hole[];
  scoresForPlayer: (playerId: string) => HoleScore[] | undefined;
}

function MatchPairCard({
  playerA,
  playerB,
  holes,
  scoresA,
  scoresB,
}: {
  playerA: Player;
  playerB: Player;
  holes: Hole[];
  scoresA: HoleScore[];
  scoresB: HoleScore[];
}) {
  const result = computeHeadToHeadMatch(
    playerA,
    playerB,
    holes,
    scoresA,
    scoresB,
  );

  return (
    <div className="rounded-[8px] border border-sand-hunter bg-white p-3">
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
      <p className="mt-1 text-lg font-semibold tabular-nums text-fairway-100">
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
          />
        );
      })}
    </div>
  );
}
