interface HandicapBadgeProps {
  index: number;
  ghinNumber?: string;
  size?: "sm" | "md";
}

export function HandicapBadge({
  index,
  ghinNumber,
  size = "md",
}: HandicapBadgeProps) {
  return (
    <div
      className={`inline-flex flex-col items-end ${
        size === "sm" ? "text-xs" : "text-sm"
      }`}
    >
      <span className="rounded-md border border-fairway-800 bg-fairway-950 px-2 py-0.5 font-semibold tabular-nums text-fairway-200">
        {index.toFixed(1)}
      </span>
      {ghinNumber && (
        <span className="mt-0.5 text-[10px] text-fairway-500">
          GHIN {ghinNumber}
        </span>
      )}
    </div>
  );
}
