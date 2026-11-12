import type { Player, PlayerRecentRound, WeeklyMatch } from "../types";
import { homeLeagueStackMatches } from "./homeStacks";

export type HomeWalletCard =
  | { kind: "league-upcoming"; id: string; match: WeeklyMatch }
  | { kind: "league-past"; id: string; match: WeeklyMatch }
  | { kind: "recent-round"; id: string; round: PlayerRecentRound }
  | { kind: "score-new"; id: "score-new" };

function isUpcomingMatch(match: WeeklyMatch): boolean {
  return match.status === "scheduled" || match.status === "in_progress";
}

/** Wallet stack: up next → recent rounds → past league → score CTA. */
export function homeWalletCards(
  player: Player,
  matches: WeeklyMatch[],
  recentRounds: PlayerRecentRound[],
): HomeWalletCard[] {
  const leagueRows = homeLeagueStackMatches(player, matches);
  const upcoming = leagueRows.filter(isUpcomingMatch);
  const pastLeague = leagueRows.filter((m) => !isUpcomingMatch(m));

  const cards: HomeWalletCard[] = [];

  for (const match of upcoming) {
    cards.push({ kind: "league-upcoming", id: match.id, match });
  }
  for (const round of recentRounds) {
    cards.push({
      kind: "recent-round",
      id: `recent-${round.playedOn}-${round.courseId}`,
      round,
    });
  }
  for (const match of pastLeague) {
    cards.push({ kind: "league-past", id: match.id, match });
  }
  cards.push({ kind: "score-new", id: "score-new" });

  return cards;
}
