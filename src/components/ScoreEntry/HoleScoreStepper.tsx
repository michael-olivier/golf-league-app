import { DecoratedScore } from "./DecoratedScore";

interface HoleScoreStepperProps {
  holeNumber: number;
  par: number;
  strokes: number | null;
  onChange: (strokes: number) => void;
}

export function HoleScoreStepper({
  holeNumber,
  par,
  strokes,
  onChange,
}: HoleScoreStepperProps) {
  const value = strokes ?? par;

  const adjust = (delta: number) => {
    onChange(Math.max(1, value + delta));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-fairway-200">Hole {holeNumber}</span>
        <span className="text-sm text-fairway-400">Par {par}</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-1)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fairway-800 text-2xl font-bold text-fairway-200 active:bg-fairway-700"
          aria-label="Fewer strokes"
        >
          −
        </button>
        <DecoratedScore strokes={value} par={par} />
        <button
          type="button"
          onClick={() => adjust(1)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fairway-600 text-2xl font-bold text-white active:bg-fairway-500"
          aria-label="More strokes"
        >
          +
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {[par - 1, par, par + 1, par + 2].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              value === v
                ? "bg-fairway-600 text-white"
                : "bg-fairway-950 text-fairway-400"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
