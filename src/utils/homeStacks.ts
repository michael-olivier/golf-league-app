import type { Player, PlayerRecentRound, WeeklyMatch } from "../types";
import { upcomingMatchForPlayer, previousCompletedTeamMatches } from "./leagueMatch";

function daysBefore(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Always up to three rounds, newest first (synthetic fill when needed). */
export function recentRoundsForPlayer(player: Player): PlayerRecentRound[] {
  const seed =
    player.recentRounds?.length ? [...player.recentRounds] : player.recentRound
      ? [player.recentRound]
      : [];

  if (seed.length === 0) return [];

  const primary = seed[0];
  const templates: Omit<PlayerRecentRound, "playedOn">[] = [
    primary,
    seed[1] ?? {
      courseId: primary.courseId,
      holeCount: primary.holeCount,
      strokes: Math.max(primary.strokes - 4, 34),
      scoreDifferential: (primary.scoreDifferential ?? 2) - 0.7,
      nineSide: primary.nineSide === "back" ? "front" : "back",
    },
    seed[2] ?? {
      courseId: "course-pinehurst",
      holeCount: 9,
      strokes: primary.strokes - 2,
      scoreDifferential: (primary.scoreDifferential ?? 2) + 1.1,
      nineSide: "front",
    },
  ];

  return templates.slice(0, 3).map((round, index) => ({
    ...round,
    playedOn:
      seed[index]?.playedOn ??
      daysBefore(primary.playedOn, (index + 1) * 11),
  }));
}

/** Upcoming (if any) first, then completed matches newest → oldest — up to 3. */
export function homeLeagueStackMatches(
  player: Player,
  matches: WeeklyMatch[],
): WeeklyMatch[] {
  const upcoming = upcomingMatchForPlayer(player, matches);
  const beforeWeek = upcoming?.weekNumber ?? Number.MAX_SAFE_INTEGER;
  const completed = previousCompletedTeamMatches(player, matches, beforeWeek);
  const rows: WeeklyMatch[] = [];
  if (upcoming) rows.push(upcoming);
  for (const match of completed) {
    if (rows.length >= 3) break;
    rows.push(match);
  }
  return rows.slice(0, 3);
}
