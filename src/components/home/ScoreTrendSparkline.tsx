interface ScoreTrendSparklineProps {
  /** Score-to-par per round, oldest → newest (lower is better). */
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function ScoreTrendSparkline({
  values,
  width = 80,
  height = 44,
  className = "",
}: ScoreTrendSparklineProps) {
  if (values.length < 2) return null;

  const pad = 5;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * innerW;
    const y = pad + ((max - v) / range) * innerH;
    return `${x},${y}`;
  });

  const last = values[values.length - 1];
  const first = values[0];
  const improving = last < first;
  const declining = last > first;
  const stroke = improving
    ? "var(--sand-sage)"
    : declining
      ? "var(--sand-brick)"
      : "var(--ui-muted)";

  const trendLabel = improving
    ? "Recent rounds trending better than par"
    : declining
      ? "Recent rounds trending worse than par"
      : "Recent round scores stable versus par";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={trendLabel}
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {(() => {
        const lastPoint = points[points.length - 1].split(",").map(Number);
        return (
          <circle
            cx={lastPoint[0]}
            cy={lastPoint[1]}
            r={2.5}
            fill={stroke}
          />
        );
      })()}
    </svg>
  );
}
