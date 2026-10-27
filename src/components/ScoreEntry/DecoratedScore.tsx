import type { ReactNode } from "react";

interface DecoratedScoreProps {
  strokes: number | null;
  par: number;
  size?: "lg" | "sm";
}

function decorationForDiff(diff: number, size: "lg" | "sm"): ReactNode {
  const insetLg = { inner: "inset-2", outer: "inset-0" };
  const insetSm = { inner: "inset-0.5", outer: "inset-0" };
  const { inner, outer } = size === "lg" ? insetLg : insetSm;
  const border = size === "lg" ? "border-2" : "border";
  const circle = `${border} border-fairway-300 rounded-full`;
  const square = `${border} border-fairway-300 rounded-sm`;

  if (diff <= -2) {
    return (
      <>
        <span className={`absolute ${outer} ${circle}`} aria-hidden />
        <span className={`absolute ${inner} ${circle}`} aria-hidden />
      </>
    );
  }
  if (diff === -1) {
    return <span className={`absolute ${inner} ${circle}`} aria-hidden />;
  }
  if (diff === 1) {
    return <span className={`absolute ${inner} ${square}`} aria-hidden />;
  }
  if (diff >= 2) {
    return (
      <>
        <span className={`absolute ${outer} ${square}`} aria-hidden />
        <span className={`absolute ${inner} ${square}`} aria-hidden />
      </>
    );
  }
  return null;
}

export function DecoratedScore({
  strokes,
  par,
  size = "lg",
}: DecoratedScoreProps) {
  const boxClass =
    size === "lg"
      ? "relative flex h-28 w-28 items-center justify-center"
      : "relative flex h-7 w-7 items-center justify-center";
  const textClass =
    size === "lg"
      ? "relative text-6xl font-bold tabular-nums leading-none text-[#373737]"
      : "relative text-[11px] font-semibold tabular-nums leading-none text-[#373737]";
  const emptyClass =
    size === "lg"
      ? "relative text-5xl font-bold tabular-nums leading-none text-fairway-500"
      : "relative text-[11px] font-medium text-fairway-500";

  if (strokes === null) {
    return (
      <div className={boxClass}>
        <span className={emptyClass}>—</span>
      </div>
    );
  }

  const diff = strokes - par;

  return (
    <div className={boxClass}>
      {decorationForDiff(diff, size)}
      <span className={textClass}>{strokes}</span>
    </div>
  );
}
