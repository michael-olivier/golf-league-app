import type { Course, Player } from "../types";
import { assetUrl } from "./assetUrl";

export function recentCourseHeroUrl(
  player: Player,
  getCourse: (id: string) => Course | undefined,
): string | null {
  const courseId = player.recentRound?.courseId;
  if (!courseId) return null;
  const course = getCourse(courseId);
  if (!course?.heroImageUrl) return null;
  return assetUrl(course.heroImageUrl);
}

export function playerFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return fullName;
  return trimmed.split(/\s+/)[0] ?? trimmed;
}
