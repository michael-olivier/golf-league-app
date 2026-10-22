export interface FavoriteCourseEntry {
  id: string;
  name: string;
}

const STORAGE_KEY = "fairway-favorite-courses";

export function readFavoriteCourses(): FavoriteCourseEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): FavoriteCourseEntry | null => {
        if (typeof item === "string") {
          return { id: item, name: "Saved course" };
        }
        if (
          item &&
          typeof item === "object" &&
          typeof (item as FavoriteCourseEntry).id === "string"
        ) {
          const entry = item as FavoriteCourseEntry;
          return {
            id: entry.id,
            name:
              typeof entry.name === "string" ? entry.name : "Saved course",
          };
        }
        return null;
      })
      .filter((item): item is FavoriteCourseEntry => item != null);
  } catch {
    return [];
  }
}

function writeFavoriteCourses(entries: FavoriteCourseEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function isFavoriteCourse(courseId: string): boolean {
  return readFavoriteCourses().some((c) => c.id === courseId);
}

/** Toggle favorite; returns whether the course is favorited after toggle. */
export function toggleFavoriteCourse(
  courseId: string,
  courseName: string,
): boolean {
  const prev = readFavoriteCourses();
  const exists = prev.some((c) => c.id === courseId);
  if (exists) {
    writeFavoriteCourses(prev.filter((c) => c.id !== courseId));
    return false;
  }
  writeFavoriteCourses([{ id: courseId, name: courseName }, ...prev]);
  return true;
}
