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
    <div className="rounded-[8px] border border-sand-hunter bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-medium text-[#373737]">
          {playerName}
        </span>
        <span className="text-sm tabular-nums text-fairway-500">
          {totalStrokes(scores) ?? "—"} ({formatToPar(toPar(scores, pars))})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-fairway-950/5 p-2">
          <p className="font-medium uppercase tracking-wide text-fairway-500">
            Out
          </p>
          <p className="text-lg font-semibold tabular-nums text-[#373737]">
            {totalStrokes(front) ?? "—"}
          </p>
          <p className="text-fairway-500">
            {formatToPar(toPar(front, frontPar))}
          </p>
        </div>
        <div className="rounded-lg bg-fairway-950/5 p-2">
          <p className="font-medium uppercase tracking-wide text-fairway-500">
            In
          </p>
          <p className="text-lg font-semibold tabular-nums text-[#373737]">
            {totalStrokes(back) ?? "—"}
          </p>
          <p className="text-fairway-500">
            {formatToPar(toPar(back, backPar))}
          </p>
        </div>
      </div>
    </div>
  );
}
