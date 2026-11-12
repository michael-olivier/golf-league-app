import type { Hole, Player, WeeklyMatch } from "../types";
import {
  foursomeMatchPairs,
  handicapStrokesVsOpponent,
} from "./matchPlay";
import { rosterSlots } from "../components/league/MatchFoursomeRoster";

export function leagueMatchPairingRows(
  match: WeeklyMatch,
  players: Player[],
  holes: Hole[],
): { left: Player; right: Player; strokes: number; receiverOnRight: boolean }[] {
  const slots = rosterSlots(
    match,
    players,
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  );
  const foursomeIds = match.foursomes[0]?.playerIds ?? [];
  const pairIds: [string, string][] = [];

  if (foursomeIds.length >= 4) {
    for (const [idA, idB] of foursomeMatchPairs(foursomeIds)) {
      pairIds.push([idA, idB]);
    }
  } else {
    if (slots.homeA && slots.awayA) pairIds.push([slots.homeA.id, slots.awayA.id]);
    if (slots.homeB && slots.awayB) pairIds.push([slots.homeB.id, slots.awayB.id]);
  }

  const byId = new Map(players.map((p) => [p.id, p]));
  const rows: { left: Player; right: Player; strokes: number; receiverOnRight: boolean }[] =
    [];

  for (const [idA, idB] of pairIds) {
    const playerA = byId.get(idA);
    const playerB = byId.get(idB);
    if (!playerA || !playerB) continue;

    const receiver =
      playerA.handicapIndex > playerB.handicapIndex ? playerA : playerB;
    const giver = receiver.id === playerA.id ? playerB : playerA;
    const strokes = handicapStrokesVsOpponent(
      receiver.handicapIndex,
      giver.handicapIndex,
      holes,
    );
    const receiverOnRight = receiver.id === playerB.id;
    rows.push({
      left: playerA,
      right: playerB,
      strokes,
      receiverOnRight,
    });
  }

  return rows;
}
