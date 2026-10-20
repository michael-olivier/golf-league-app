import type { MakeupRequest, Player, WeeklyMatch } from "../types";

export function opponentTeamId(
  match: WeeklyMatch,
  teamId: string,
): string | undefined {
  const { homeTeamId, awayTeamId } = match.teamPairing;
  if (teamId === homeTeamId) return awayTeamId;
  if (teamId === awayTeamId) return homeTeamId;
  return undefined;
}

export function isOnMatchTeam(match: WeeklyMatch, teamId: string): boolean {
  return (
    teamId === match.teamPairing.homeTeamId ||
    teamId === match.teamPairing.awayTeamId
  );
}

export function makeupForMatch(
  requests: MakeupRequest[],
  matchId: string,
): MakeupRequest | undefined {
  return requests.find((r) => r.matchId === matchId && r.status !== "cancelled");
}

export function formatMakeupDateTime(date: string, teeTime: string): string {
  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (!teeTime) return formatted;
  const [h, m] = teeTime.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${formatted} · ${displayHour}:${m} ${suffix}`;
}

export function playersOnTeam(players: Player[], teamId: string): Player[] {
  return players.filter((p) => p.teamId === teamId);
}
