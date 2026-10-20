import type { Hole } from "../../types";
import { formatToPar } from "../../utils/scorecard";
import { toPar, totalStrokes } from "../../store/LeagueContext";
import type { HoleScore } from "../../types";

interface ScorecardSummaryProps {
  playerName: string;
  holes: Hole[];
  scores: HoleScore[];
}

export function ScorecardSummary({
  playerName,
  holes,
  scores,
}: ScorecardSummaryProps) {
  const pars = holes.map((h) => h.par);
  const front = scores.slice(0, 9);
  const back = scores.slice(9, 18);
  const frontPar = pars.slice(0, 9);
  const backPar = pars.slice(9, 18);

  return (
    <div className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-fairway-200">{playerName}</span>
        <span className="text-sm text-fairway-300">
          {totalStrokes(scores) ?? "—"} (
          {formatToPar(toPar(scores, pars))})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-fairway-950/80 p-2">
          <p className="text-fairway-500">Out</p>
          <p className="text-lg font-semibold tabular-nums text-fairway-200">
            {totalStrokes(front) ?? "—"}
          </p>
          <p className="text-fairway-400">
            {formatToPar(toPar(front, frontPar))}
          </p>
        </div>
        <div className="rounded-lg bg-fairway-950/80 p-2">
          <p className="text-fairway-500">In</p>
          <p className="text-lg font-semibold tabular-nums text-fairway-200">
            {totalStrokes(back) ?? "—"}
          </p>
          <p className="text-fairway-400">
            {formatToPar(toPar(back, backPar))}
          </p>
        </div>
      </div>
    </div>
  );
}
