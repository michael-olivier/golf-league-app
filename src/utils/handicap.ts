export function coursePar(holes: { par: number }[]): number {
  return holes.reduce((sum, h) => sum + h.par, 0);
}

/** USGA course handicap from handicap index and tee rating/slope. */
export function courseHandicapFromIndex(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number,
): number {
  return Math.round(
    handicapIndex * (slopeRating / 113) + (courseRating - par),
  );
}
