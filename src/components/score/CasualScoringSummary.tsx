import type { CasualScoringMode, Hole, HoleScore, Player } from "../../types";
import { FoursomeMatchSummaries } from "../ScoreEntry/FoursomeMatchSummaries";
import {
  grossAndNetTotals,
  isMatchScoringMode,
  scoringModeLabel,
} from "../../utils/casualScoring";
import { playerTabLabels } from "../../utils/player";

interface CasualScoringSummaryProps {
  scoringMode: CasualScoringMode;
  players: Player[];
  holes: Hole[];
  holeCount: 9 | 18;
  scoresForPlayer: (playerId: string) => HoleScore[] | undefined;
  courseHandicapForPlayer: (playerId: string) => number;
}

export function CasualScoringSummary({
  scoringMode,
  players,
  holes,
  holeCount,
  scoresForPlayer,
  courseHandicapForPlayer,
}: CasualScoringSummaryProps) {
  const labels = playerTabLabels(players);

  if (isMatchScoringMode(scoringMode) && players.length >= 2) {
    return (
      <div className="mb-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-fairway-500">
          {scoringModeLabel(scoringMode)}
        </p>
        <FoursomeMatchSummaries
          players={players}
          holes={holes}
          scoresForPlayer={scoresForPlayer}
          applyHandicapStrokes={scoringMode === "match_net"}
        />
      </div>
    );
  }

  if (scoringMode === "stroke") {
    return (
      <div className="mb-4 rounded-xl border border-sand-score-border bg-white/80 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-fairway-500">
          {scoringModeLabel(scoringMode)}
        </p>
        <ul className="mt-2 space-y-2">
          {players.map((player) => {
            const scores = scoresForPlayer(player.id) ?? [];
            const ch = courseHandicapForPlayer(player.id);
            const { gross, net } = grossAndNetTotals(
              scores,
              holes,
              ch,
              holeCount,
            );
            const label = labels.get(player.id) ?? player.name;
            return (
              <li
                key={player.id}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
                <span className="min-w-0 truncate font-semibold text-[#373737]">
                  {label}
                </span>
                <span className="shrink-0 tabular-nums text-[#575757]">
                  {gross == null ? (
                    "—"
                  ) : (
                    <>
                      {gross}{" "}
                      <span className="font-bold text-sand-hunter">
                        ({net} net)
                      </span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[10px] leading-snug text-fairway-500">
          Net uses course handicap strokes on the hardest holes.
        </p>
      </div>
    );
  }

  return null;
}
