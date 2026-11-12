import type { CSSProperties } from "react";

interface ScoringTrendChartProps {
  /** Score-to-par per round, oldest → newest (last five plotted). */
  values: number[];
  className?: string;
  /** After card entrance — points pop in, then the line draws. */
  revealed?: boolean;
  /** When false, show the chart in its final state with no motion. */
  animate?: boolean;
}

const W = 140;
const H = 52;
const PAD_X = 8;
const PAD_Y = 8;

export function ScoringTrendChart({
  values,
  className = "",
  revealed = true,
  animate = true,
}: ScoringTrendChartProps) {
  const series = values.slice(-5);
  if (series.length < 2) return null;

  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  const nodes = series.map((v, i) => {
    const x = PAD_X + (i / (series.length - 1)) * innerW;
    const y = PAD_Y + ((max - v) / range) * innerH;
    return { x, y };
  });

  const pathD = nodes
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={`scoring-trend-chart block max-w-full ${revealed ? "is-revealed" : ""} ${!animate ? "is-static" : ""} ${className}`.trim()}
      style={
        { "--scoring-trend-point-count": series.length } as CSSProperties
      }
      role="img"
      aria-label="Scoring trend for recent rounds"
    >
      <path
        className="scoring-trend-chart__line"
        d={pathD}
        fill="none"
        stroke="var(--sand-hunter)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
      {nodes.map((p, i) => (
        <g
          key={i}
          className="scoring-trend-chart__point"
          style={{ "--scoring-trend-point-i": i } as CSSProperties}
        >
          <circle cx={p.x} cy={p.y} r={6} fill="var(--sand-hunter)" />
          <circle cx={p.x} cy={p.y} r={2.25} fill="var(--sand-champagne)" />
        </g>
      ))}
    </svg>
  );
}
