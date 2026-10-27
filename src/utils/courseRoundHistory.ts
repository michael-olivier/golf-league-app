import type {
  CasualScoringMode,
  HolesChoice,
  ScoreType,
} from "../types";

export interface CourseRoundPrefs {
  holesChoice: HolesChoice;
  teeBoxId: string;
  startHole: number;
  scoreType: ScoreType;
  scoringMode: CasualScoringMode;
  playerCount: 1 | 2 | 3 | 4;
  teamsEnabled?: boolean;
}

const key = (courseId: string) => `fairway-round-prefs-${courseId}`;

export function readCourseRoundPrefs(
  courseId: string,
): CourseRoundPrefs | null {
  try {
    const raw = localStorage.getItem(key(courseId));
    if (!raw) return null;
    return JSON.parse(raw) as CourseRoundPrefs;
  } catch {
    return null;
  }
}

export function saveCourseRoundPrefs(
  courseId: string,
  prefs: CourseRoundPrefs,
): void {
  localStorage.setItem(key(courseId), JSON.stringify(prefs));
}
