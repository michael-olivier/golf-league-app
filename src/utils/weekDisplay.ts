import type { Course, League, WeeklyMatch } from "../types";

export function weekCardSubtitle(
  league: League,
  match: WeeklyMatch,
  course: Course,
): string {
  if (league.sameHomeCourseEachWeek && match.gameType) {
    return match.gameType;
  }
  return course.name;
}
