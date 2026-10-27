import { useState } from "react";

interface CourseHandicapFooterProps {
  courseHandicap: number;
  /** Under course title on score entry (replaces date). */
  inline?: boolean;
  /** Pin flush above tab bar; use on course setup. */
  docked?: boolean;
  /** Same row as play date on setup; no panel background. */
  afterDate?: boolean;
}

export function CourseHandicapFooter({
  courseHandicap,
  inline = false,
  docked = false,
  afterDate = false,
}: CourseHandicapFooterProps) {
  const [showInfo, setShowInfo] = useState(false);

  const infoButton = (
    <button
      type="button"
      aria-label="About course handicap"
      aria-expanded={showInfo}
      onClick={() => setShowInfo((v) => !v)}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-fairway-600 text-[10px] font-bold text-fairway-300"
    >
      i
    </button>
  );

  const infoText = showInfo && (
    <p className="mt-1.5 text-xs leading-relaxed text-fairway-500">
      Course handicap indicates the number of strokes you need to play to par
      for the selected tees and to adjust hole scores for handicap purposes.
    </p>
  );

  if (afterDate) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-[#000]">
        <span>
          Course handicap{" "}
          <span className="font-semibold tabular-nums">{courseHandicap}</span>
        </span>
        <button
          type="button"
          aria-label="About course handicap"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((v) => !v)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sand-hunter/50 text-[10px] font-bold text-[#000]"
        >
          i
        </button>
        {showInfo ? (
          <p className="w-full basis-full text-xs leading-relaxed text-fairway-500">
            Course handicap indicates the number of strokes you need to play to
            par for the selected tees and to adjust hole scores for handicap
            purposes.
          </p>
        ) : null}
      </div>
    );
  }

  if (inline) {
    return (
      <div className="mt-1">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-fairway-500">
          <span>
            Course handicap:{" "}
            <span className="font-semibold tabular-nums text-fairway-200">
              {courseHandicap}
            </span>
          </span>
          {infoButton}
        </div>
        {infoText}
      </div>
    );
  }

  return (
    <div
      className={
        docked
          ? "shrink-0 border-t border-sand-hunter bg-white py-3"
          : "sticky bottom-0 border-t border-fairway-800 bg-fairway-950/95 py-3 backdrop-blur"
      }
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-fairway-400">Course handicap</span>
        <span className="text-lg font-bold tabular-nums text-fairway-100">
          {courseHandicap}
        </span>
        <button
          type="button"
          aria-label="About course handicap"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-fairway-600 text-xs font-bold text-fairway-300"
        >
          i
        </button>
      </div>
      {showInfo && (
        <p className="mt-2 text-center text-xs leading-relaxed text-fairway-500">
          Course handicap indicates the number of strokes you need to play to par
          for the selected tees and to adjust hole scores for handicap purposes.
        </p>
      )}
    </div>
  );
}
