import type { ScoringGolfer } from "../types";
import { assetUrl } from "../utils/assetUrl";

/** GHIN home course for the signed-in user (mock). */
export const GHIN_HOME_COURSE_ID = "course-oakmont";
export const GHIN_HOME_COURSE_NAME = "Oakmont Valley Golf Club";

export interface GhinDirectoryEntry {
  ghinNumber: string;
  name: string;
  homeCourseName: string;
  handicapIndex: number;
}

/** Mock GHIN directory — in production, USGA GHIN API. */
const ghinDirectory: GhinDirectoryEntry[] = [
  {
    ghinNumber: "10127007",
    name: "Sarah Chen",
    homeCourseName: "Oakmont Valley Golf Club",
    handicapIndex: 12.4,
  },
  {
    ghinNumber: "10127008",
    name: "Tom Bradley",
    homeCourseName: "Denver City Park Golf Course",
    handicapIndex: 8.1,
  },
  {
    ghinNumber: "10127009",
    name: "Anna Reyes",
    homeCourseName: "Wellshire Golf Course",
    handicapIndex: 15.2,
  },
  {
    ghinNumber: "10127010",
    name: "James Park",
    homeCourseName: "Arrowhead Golf Club",
    handicapIndex: 6.8,
  },
  {
    ghinNumber: "10127011",
    name: "Lisa Morgan",
    homeCourseName: "Fossil Trace Golf Club",
    handicapIndex: 18.3,
  },
  {
    ghinNumber: "10127012",
    name: "Dave Wilson",
    homeCourseName: "Colorado National Golf Club",
    handicapIndex: 11.0,
  },
  {
    ghinNumber: "10127013",
    name: "Kate Nguyen",
    homeCourseName: "Murray Golf Course",
    handicapIndex: 22.5,
  },
  {
    ghinNumber: "10127014",
    name: "Carlos Rivera",
    homeCourseName: "Hyland Hills Golf Course",
    handicapIndex: 9.4,
  },
];

/** GHIN golfers the user follows (mock). */
export const followedGhinGolfers: GhinDirectoryEntry[] = ghinDirectory.slice(0, 5);

export function searchGhinGolfers(query: string): GhinDirectoryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ghinDirectory.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.ghinNumber.includes(q) ||
      g.homeCourseName.toLowerCase().includes(q),
  );
}

function ghinPortraitUrl(entry: GhinDirectoryEntry): string {
  const idx = ghinDirectory.findIndex((e) => e.ghinNumber === entry.ghinNumber);
  const portraitNum = (idx >= 0 ? idx : 0) % 20;
  const folder = idx % 2 === 1 ? "women" : "men";
  return assetUrl(`/avatars/${folder}-${portraitNum}.jpg`);
}

export function ghinEntryToScoringGolfer(entry: GhinDirectoryEntry): ScoringGolfer {
  return {
    id: `ghin-${entry.ghinNumber}`,
    name: entry.name,
    handicapIndex: entry.handicapIndex,
    homeCourseName: entry.homeCourseName,
    ghinNumber: entry.ghinNumber,
    avatarUrl: ghinPortraitUrl(entry),
  };
}

export function createManualScoringGolfer(input: {
  name: string;
  handicapIndex: number;
  ratedTees: "male" | "female";
}): ScoringGolfer {
  const folder = input.ratedTees === "female" ? "women" : "men";
  const portraitNum = Math.abs(input.name.length) % 20;
  return {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    handicapIndex: input.handicapIndex,
    homeCourseName: "—",
    ratedTees: input.ratedTees,
    avatarUrl: assetUrl(`/avatars/${folder}-${portraitNum}.jpg`),
  };
}
