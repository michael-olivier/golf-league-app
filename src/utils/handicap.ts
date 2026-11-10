import type { Course, TeeBox } from "../types";

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

/** Playing course handicap for 9 or 18 holes (WHS, default tee). */
export function playingCourseHandicap(
  handicapIndex: number,
  course: Course,
  holeCount: 9 | 18,
  preferredTeeId?: string,
): number {
  const tee =
    course.tees.find((t) => t.id === preferredTeeId) ?? course.tees[0];
  if (!tee) return 0;
  const par18 = coursePar(course.holes);
  const ch18 = courseHandicapFromIndex(
    handicapIndex,
    tee.slopeRating,
    tee.courseRating,
    par18,
  );
  return holeCount === 9 ? Math.round(ch18 / 2) : ch18;
}

/** Strokes over/under playing to course handicap (0 = hit handicap). */
export function strokesVsPlayingHandicap(
  strokes: number,
  par: number,
  playingCourseHandicap: number,
): number {
  return strokes - par - playingCourseHandicap;
}

/** WHS score differential for posting (9- or 18-hole). */
export function whsScoreDifferential(
  strokes: number,
  holeCount: 9 | 18,
  tee: TeeBox,
): number {
  const courseRating =
    holeCount === 9 ? tee.courseRating / 2 : tee.courseRating;
  const raw = (113 / tee.slopeRating) * (strokes - courseRating);
  return Math.round(raw * 10) / 10;
}
