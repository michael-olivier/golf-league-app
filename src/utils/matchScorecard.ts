import type {
  Hole,
  HoleScore,
  League,
  LeagueState,
  Player,
  PlayerRound,
  WeeklyMatch,
} from "../types";
import { roundKey } from "../types";
import { playableHoles } from "./playableHoles";
import { leagueNineLabel } from "./player";

export function scorecardPlayersForMatch(
  match: WeeklyMatch,
  players: Player[],
): Player[] {
  const foursome = match.foursomes[0];
  if (foursome) {
    return foursome.playerIds
      .map((id) => players.find((p) => p.id === id))
      .filter((p): p is Player => !!p);
  }
  const teamIds = new Set([
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  ]);
  return players.filter((p) => teamIds.has(p.teamId));
}

export function leagueHolesForRound(
  courseHoles: Hole[],
  league: League,
): Hole[] {
  const startHole = league.nineSide === "back" ? 10 : 1;
  return playableHoles(courseHoles, league.holesPerRound, startHole);
}

export function scoresForMatchPlayer(
  rounds: LeagueState["rounds"],
  matchId: string,
  playerId: string,
): HoleScore[] | undefined {
  return rounds[roundKey(matchId, playerId)]?.scores;
}

export function buildSimpleRound(
  playerId: string,
  strokesByHole: number[],
): PlayerRound {
  return {
    playerId,
    scoreEntryMode: "simple",
    scores: strokesByHole.map((strokes) => ({ strokes })),
  };
}

export function scorecardTitleForMatch(
  match: WeeklyMatch,
  league: League,
): string {
  return `Week ${match.weekNumber} · ${leagueNineLabel(league.nineSide)}`;
}
