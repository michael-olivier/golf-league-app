import { useLeague } from "../store/LeagueContext";

export function useMakeupAttention(): {
  openMakeupCount: number;
  attentionCount: number;
} {
  const { getTeamMakeups, getPostponedMatchesForTeam } = useLeague();
  const openMakeupCount = getTeamMakeups().filter(
    (t) => t.makeup.status === "open",
  ).length;
  const needsMakeupStart = getPostponedMatchesForTeam().length;
  return {
    openMakeupCount,
    attentionCount: openMakeupCount + needsMakeupStart,
  };
}
