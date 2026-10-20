import type { Course, League } from "../types";
import { assetUrl } from "./assetUrl";

export interface SplashBranding {
  imageUrl: string;
  title: string;
  subtitle?: string;
  source: "league" | "course";
}

/** League logo when configured; otherwise the league home course logo. */
export function getSplashBranding(
  league: League,
  course: Course | undefined,
): SplashBranding | null {
  if (league.logoUrl) {
    return {
      imageUrl: assetUrl(league.logoUrl),
      title: league.name,
      subtitle: course?.name,
      source: "league",
    };
  }

  if (course?.logoUrl) {
    return {
      imageUrl: assetUrl(course.logoUrl),
      title: course.name,
      subtitle: league.name,
      source: "course",
    };
  }

  return null;
}
