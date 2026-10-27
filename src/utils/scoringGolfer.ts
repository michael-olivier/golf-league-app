import type { HolesChoice, Player, ScoringGolfer } from "../types";

export function scoringGolferToPlayer(golfer: ScoringGolfer): Player {
  return {
    id: golfer.id,
    name: golfer.name,
    ghinNumber: golfer.ghinNumber ?? "",
    handicapIndex: golfer.handicapIndex,
    teamId: "",
    avatarUrl: golfer.avatarUrl,
  };
}

export function holeCountFromChoice(choice: HolesChoice): 9 | 18 {
  return choice === "9" ? 9 : 18;
}
