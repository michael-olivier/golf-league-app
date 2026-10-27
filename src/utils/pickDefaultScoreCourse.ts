import type { OpenGolfCourseCompact } from "../api/openGolfApi";
import type { RecentCourseEntry } from "./recentCourses";

/** Prefer most-recent course that is also nearby; else closest nearby; else most recent. */
export function pickDefaultScoreCourseId(
  recent: RecentCourseEntry[],
  nearby: OpenGolfCourseCompact[],
): string | null {
  const nearbyIds = new Set(nearby.map((c) => c.id));
  for (const entry of recent) {
    if (nearbyIds.has(entry.id)) return entry.id;
  }
  if (nearby[0]?.id) return nearby[0].id;
  if (recent[0]?.id) return recent[0].id;
  return null;
}
