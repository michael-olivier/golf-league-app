import { DEFAULT_RECENT_COURSES } from "./defaultRecentCourses";

export interface RecentCourseEntry {
  id: string;
  name: string;
}

const STORAGE_KEY = "fairway-recent-courses";
export const MAX_RECENT = 4;

function readStoredRecentCourses(): RecentCourseEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): RecentCourseEntry | null => {
        if (typeof item === "string") {
          return { id: item, name: "Recent course" };
        }
        if (
          item &&
          typeof item === "object" &&
          typeof (item as RecentCourseEntry).id === "string"
        ) {
          const entry = item as RecentCourseEntry;
          return {
            id: entry.id,
            name:
              typeof entry.name === "string" ? entry.name : "Recent course",
          };
        }
        return null;
      })
      .filter((item): item is RecentCourseEntry => item != null)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function readRecentCourses(): RecentCourseEntry[] {
  const stored = readStoredRecentCourses();
  if (stored.length > 0) return stored;
  return DEFAULT_RECENT_COURSES;
}

/** @deprecated Use readRecentCourses */
export function readRecentCourseIds(): string[] {
  return readRecentCourses().map((c) => c.id);
}

export function rememberCourse(courseId: string, courseName: string): void {
  const prev = readStoredRecentCourses().filter((c) => c.id !== courseId);
  const next: RecentCourseEntry[] = [
    { id: courseId, name: courseName },
    ...prev,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("fairway-recent-changed"));
}
