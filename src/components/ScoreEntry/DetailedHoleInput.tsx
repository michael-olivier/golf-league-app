import type { DetailedHoleScore } from "../../types";
import { greenInRegulationHit } from "../../utils/scorecard";
import { DirectionalPicker } from "./DirectionalPicker";
import {
  HoleScoreStepper,
  type HoleNavigation,
} from "./HoleScoreStepper";

interface DetailedHoleInputProps {
  holeNumber: number;
  par: number;
  score: DetailedHoleScore;
  onChange: (score: DetailedHoleScore) => void;
  navigation: HoleNavigation;
}

const statTitleClass =
  "mb-2 text-center text-sm font-bold uppercase tracking-wider text-[#373737]";

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
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sand-sage/50 bg-sand-sage/15 text-xl font-bold text-sand-hunter"
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-xl font-semibold tabular-nums text-[#373737]">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand-hunter text-xl font-bold text-white"
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
  navigation,
}: DetailedHoleInputProps) {
  const patch = (p: Partial<DetailedHoleScore>) => {
    const next = { ...score, ...p };
    const girHit = greenInRegulationHit(par, next.strokes, next.putts);
    onChange({
      ...next,
      greenInRegulation:
        girHit === null ? null : girHit ? "center" : null,
    });
  };

  return (
    <div className="space-y-3">
      <HoleScoreStepper
        holeNumber={holeNumber}
        par={par}
        strokes={score.strokes}
        onChange={(strokes) => patch({ strokes })}
        navigation={navigation}
      />

      <div className="space-y-5">
        {par >= 4 ? (
          <div className="flex justify-center">
            <DirectionalPicker
              label="Fairway"
              compact
              value={score.fairwayHit}
              onChange={(fairwayHit) => patch({ fairwayHit })}
            />
          </div>
        ) : null}

        <div className="grid min-w-0 grid-cols-2 gap-2">
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

        <label className="flex cursor-pointer items-center justify-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={score.sandSave === true}
            onChange={(e) => patch({ sandSave: e.target.checked })}
            className="h-[18px] w-[18px] rounded border-2 border-sand-hunter accent-sand-hunter"
          />
          <span className="text-xs font-bold uppercase tracking-wide text-[#373737]">
            Sand save
          </span>
        </label>
      </div>
    </div>
  );
}
