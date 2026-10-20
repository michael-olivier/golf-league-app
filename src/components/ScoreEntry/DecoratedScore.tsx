interface DecoratedScoreProps {
  strokes: number;
  par: number;
}

export function DecoratedScore({ strokes, par }: DecoratedScoreProps) {
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
      <span className="relative text-6xl font-bold tabular-nums leading-none text-fairway-50">
        {strokes}
      </span>
    </div>
  );
}
