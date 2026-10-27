export function StrokePopMarker({ className = "" }: { className?: string }) {
  return (
    <span
      className={`size-1 shrink-0 rounded-full bg-sand-hunter ${className}`}
      aria-hidden
    />
  );
}
