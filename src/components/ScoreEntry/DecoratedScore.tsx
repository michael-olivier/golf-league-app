interface DecoratedScoreProps {
  strokes: number | null;
  par: number;
}

export function DecoratedScore({ strokes, par }: DecoratedScoreProps) {
  if (strokes === null) {
    return (
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="relative text-5xl font-bold tabular-nums leading-none text-fairway-500">
          —
        </span>
      </div>
    );
  }

  const diff = strokes - par;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      {diff <= -2 && (
        <>
          <span
            className="absolute inset-0 rounded-full border-2 border-fairway-300"
            aria-hidden
          />
          <span
            className="absolute inset-2 rounded-full border-2 border-fairway-300"
            aria-hidden
          />
        </>
      )}
      {diff === -1 && (
        <span
          className="absolute inset-2 rounded-full border-2 border-fairway-300"
          aria-hidden
        />
      )}
      {diff === 1 && (
        <span
          className="absolute inset-2 rounded-sm border-2 border-fairway-300"
          aria-hidden
        />
      )}
      {diff >= 2 && (
        <>
          <span
            className="absolute inset-0 rounded-sm border-2 border-fairway-300"
            aria-hidden
          />
          <span
            className="absolute inset-2 rounded-sm border-2 border-fairway-300"
            aria-hidden
          />
        </>
      )}
      <span className="relative text-6xl font-bold tabular-nums leading-none text-[#373737]">
        {strokes}
      </span>
    </div>
  );
}
