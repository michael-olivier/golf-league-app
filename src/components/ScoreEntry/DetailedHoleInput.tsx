import type { DetailedHoleScore } from "../../types";
import { DirectionalPicker } from "./DirectionalPicker";
import { HoleScoreStepper } from "./HoleScoreStepper";

interface DetailedHoleInputProps {
  holeNumber: number;
  par: number;
  score: DetailedHoleScore;
  onChange: (score: DetailedHoleScore) => void;
}

const statTitleClass = "mb-2 text-center text-xs font-semibold text-fairway-200";

function StatStepper({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number | string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div>
      <p className={statTitleClass}>{label}</p>
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={onDecrement}
          className="h-9 w-9 shrink-0 rounded-lg bg-fairway-800 font-bold"
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-lg font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-9 w-9 shrink-0 rounded-lg bg-fairway-600 font-bold text-white"
          aria-label={`More ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function DetailedHoleInput({
  holeNumber,
  par,
  score,
  onChange,
}: DetailedHoleInputProps) {
  const patch = (p: Partial<DetailedHoleScore>) => onChange({ ...score, ...p });

  return (
    <div className="space-y-4">
      <HoleScoreStepper
        holeNumber={holeNumber}
        par={par}
        strokes={score.strokes}
        onChange={(strokes) => patch({ strokes })}
      />

      <div className="space-y-5 border-t border-fairway-800/80 pt-4">
        <div className="grid grid-cols-2 items-start gap-2">
          {par >= 4 ? (
            <DirectionalPicker
              label="Fairway"
              compact
              value={score.fairwayHit}
              onChange={(fairwayHit) => patch({ fairwayHit })}
            />
          ) : (
            <div aria-hidden />
          )}
          <DirectionalPicker
            label="GIR"
            compact
            className={par >= 4 ? undefined : "col-start-2"}
            value={score.greenInRegulation}
            onChange={(greenInRegulation) => patch({ greenInRegulation })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatStepper
            label="Putts"
            value={score.putts ?? "—"}
            onDecrement={() =>
              patch({
                putts: Math.max(0, (score.putts ?? 2) - 1),
              })
            }
            onIncrement={() =>
              patch({
                putts: (score.putts ?? 0) + 1,
              })
            }
          />
          <StatStepper
            label="Penalties"
            value={score.penalties}
            onDecrement={() =>
              patch({ penalties: Math.max(0, score.penalties - 1) })
            }
            onIncrement={() => patch({ penalties: score.penalties + 1 })}
          />
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 py-1">
          <input
            type="checkbox"
            checked={score.sandSave === true}
            onChange={(e) => patch({ sandSave: e.target.checked })}
            className="h-4 w-4 rounded border-fairway-600 bg-fairway-950 text-fairway-600 focus:ring-fairway-500"
          />
          <span className="text-xs font-semibold text-fairway-200">Sand save</span>
        </label>
      </div>
    </div>
  );
}
