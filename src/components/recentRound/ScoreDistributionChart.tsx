import { useState } from "react";
import type { RecentRoundScoreDistribution } from "../../types";

const LABEL_COL_WIDTH = "6.25rem";
/** Two lines at 11px / 13px leading — keeps every row the same height. */
const LABEL_COL_HEIGHT = "26px";

const CATEGORIES: {
  key: keyof RecentRoundScoreDistribution;
  lines: [string] | [string, string];
  color: string;
}[] = [
  {
    key: "birdiesOrBetter",
    lines: ["Birdies or", "Better"],
    color: "bg-sand-sage",
  },
  { key: "pars", lines: ["Pars"], color: "bg-sand-hunter" },
  { key: "bogeys", lines: ["Bogeys"], color: "bg-sand-vanilla-custard" },
  {
    key: "doubleBogeys",
    lines: ["Double", "Bogeys"],
    color: "bg-sand-brick/80",
  },
  {
    key: "tripleOrWorse",
    lines: ["Triple Bogeys", "or Worse"],
    color: "bg-sand-brick",
  },
];

type ViewMode = "percentage" | "total";

interface ScoreDistributionChartProps {
  distribution: RecentRoundScoreDistribution;
}

export function ScoreDistributionChart({
  distribution,
}: ScoreDistributionChartProps) {
  const [mode, setMode] = useState<ViewMode>("percentage");

  const total = CATEGORIES.reduce((sum, c) => sum + distribution[c.key], 0);

  const toggleMode = () => {
    setMode((current) => (current === "percentage" ? "total" : "percentage"));
  };

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="touch-pan-y w-full rounded-[8px] border border-sand-hunter bg-white p-3 text-left"
      aria-label={
        mode === "percentage"
          ? "Scoring summary, showing percentages. Tap to show totals."
          : "Scoring summary, showing totals. Tap to show percentages."
      }
    >
      <p className="card-title mb-3">Scoring summary</p>
      <ul className="space-y-2.5">
        {CATEGORIES.map(({ key, lines, color }) => {
          const count = distribution[key];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const width = total > 0 ? `${(count / total) * 100}%` : "0%";
          const displayValue =
            mode === "percentage" ? `${pct.toFixed(0)}%` : `${count}`;

          return (
            <li key={key} className="flex items-center gap-2.5">
              <div
                className="flex shrink-0 flex-col justify-center text-[11px] leading-[13px] text-fairway-300"
                style={{ width: LABEL_COL_WIDTH, height: LABEL_COL_HEIGHT }}
              >
                {lines.length === 1 ? (
                  <span>{lines[0]}</span>
                ) : (
                  <>
                    <span className="block">{lines[0]}</span>
                    <span className="block">{lines[1]}</span>
                  </>
                )}
              </div>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-fairway-950/5">
                <div
                  className={`score-dist-bar-fill h-full rounded-full ${color}`}
                  style={{ width }}
                />
              </div>
              <span
                key={`${key}-${mode}`}
                className={`score-dist-value-swap w-9 shrink-0 text-right text-xs tabular-nums text-fairway-500 ${
                  count > 0 ? "font-bold text-fairway-300" : "font-normal"
                }`}
              >
                {displayValue}
              </span>
            </li>
          );
        })}
      </ul>
    </button>
  );
}
