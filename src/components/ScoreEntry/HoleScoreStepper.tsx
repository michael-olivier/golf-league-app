import { DecoratedScore } from "./DecoratedScore";

export interface HoleNavigation {
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

interface HoleScoreStepperProps {
  holeNumber: number;
  par: number;
  strokes: number | null;
  onChange: (strokes: number) => void;
  navigation?: HoleNavigation;
}

function NavChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export function HoleScoreStepper({
  holeNumber,
  par,
  strokes,
  onChange,
  navigation,
}: HoleScoreStepperProps) {
  const scorecard = !!navigation;

  const adjust = (delta: number) => {
    if (strokes === null) {
      if (delta > 0) {
        onChange(par);
      } else {
        onChange(Math.max(1, par - 1));
      }
      return;
    }
    onChange(Math.max(1, strokes + delta));
  };

  const stepperButtonClass =
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sand-hunter text-3xl font-bold text-white";

  return (
    <div>
      {scorecard && navigation ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!navigation.canPrevious}
            onClick={navigation.onPrevious}
            aria-label="Previous hole"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-sand-hunter bg-white text-sand-hunter disabled:opacity-35"
          >
            <NavChevron direction="left" />
          </button>
          <div className="text-center">
            <p className="text-base font-semibold text-[#373737]">
              Hole {holeNumber}
            </p>
            <p className="text-sm text-fairway-500">Par {par}</p>
          </div>
          <button
            type="button"
            disabled={!navigation.canNext}
            onClick={navigation.onNext}
            aria-label="Next hole"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-sand-hunter bg-white text-sand-hunter disabled:opacity-35"
          >
            <NavChevron direction="right" />
          </button>
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-fairway-200">
            Hole {holeNumber}
          </span>
          <span className="text-sm text-fairway-400">Par {par}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => adjust(-1)}
          className={
            scorecard
              ? stepperButtonClass
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fairway-800 text-2xl font-bold text-fairway-200 active:bg-fairway-700"
          }
          aria-label="Fewer strokes"
        >
          −
        </button>
        <DecoratedScore strokes={strokes} par={par} />
        <button
          type="button"
          onClick={() => adjust(1)}
          className={
            scorecard
              ? stepperButtonClass
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fairway-600 text-2xl font-bold text-white active:bg-fairway-500"
          }
          aria-label="More strokes"
        >
          +
        </button>
      </div>
    </div>
  );
}
