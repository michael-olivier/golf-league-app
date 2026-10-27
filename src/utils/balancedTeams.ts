import type { ScoringGolfer } from "../types";

export type TeamSide = 0 | 1;

/** Assign golfers to two teams with similar combined handicap index. */
export function balancedTeamAssignment(
  golfers: ScoringGolfer[],
): Record<string, TeamSide> {
  if (golfers.length === 0) return {};

  const sorted = [...golfers].sort(
    (a, b) => a.handicapIndex - b.handicapIndex,
  );
  const teamHi: [number, number] = [0, 0];
  const assignment: Record<string, TeamSide> = {};

  for (const g of sorted) {
    const team: TeamSide = teamHi[0] <= teamHi[1] ? 0 : 1;
    assignment[g.id] = team;
    teamHi[team] += g.handicapIndex;
  }

  return assignment;
}

export function golfersByTeam(
  roster: ScoringGolfer[],
  teamByGolferId: Record<string, TeamSide>,
): { teamA: ScoringGolfer[]; teamB: ScoringGolfer[] } {
  const teamA: ScoringGolfer[] = [];
  const teamB: ScoringGolfer[] = [];
  for (const g of roster) {
    if (teamByGolferId[g.id] === 1) teamB.push(g);
    else teamA.push(g);
  }
  return { teamA, teamB };
}
