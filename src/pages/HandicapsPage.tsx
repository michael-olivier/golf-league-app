import { useMemo } from "react";
import { HandicapBadge } from "../components/HandicapBadge";
import { PlayerChip } from "../components/PlayerChip";
import { useLeague } from "../store/LeagueContext";

export function HandicapsPage() {
  const {
    state,
    currentPlayer,
    activeMatch,
    getFoursomeForUser,
    getTeam,
    getPlayer,
  } = useLeague();

  const foursome = activeMatch ? getFoursomeForUser(activeMatch.id) : undefined;

  const { teammates, opponents } = useMemo(() => {
    if (!foursome) {
      const same = state.players.filter((p) => p.teamId === currentPlayer.teamId);
      const opp = state.players.filter((p) => p.teamId !== currentPlayer.teamId);
      return { teammates: same, opponents: opp };
    }

    const inGroup = foursome.playerIds.map((id) => getPlayer(id)).filter(Boolean);
    const teammates = inGroup.filter(
      (p) => p!.teamId === currentPlayer.teamId && p!.id !== currentPlayer.id,
    ) as typeof state.players;
    const opponents = inGroup.filter(
      (p) => p!.teamId !== currentPlayer.teamId,
    ) as typeof state.players;
    return { teammates, opponents };
  }, [foursome, currentPlayer, state.players, getPlayer, getTeam]);

  const myTeam = getTeam(currentPlayer.teamId);

  return (
    <div className="space-y-6">
      <p className="text-sm text-fairway-400">
        Handicap indexes from GHIN (mock data). In production, sync via the
        USGA GHIN API with player authorization.
      </p>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fairway-500">
          You
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-fairway-800 bg-fairway-900/60 px-4 py-3">
          <div>
            <p className="font-semibold text-fairway-200">{currentPlayer.name}</p>
            <p className="text-xs text-fairway-400">{myTeam?.name}</p>
          </div>
          <HandicapBadge
            index={currentPlayer.handicapIndex}
            ghinNumber={currentPlayer.ghinNumber}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Teammates
        </h2>
        <div className="space-y-2">
          {teammates
            .filter((p) => p.id !== currentPlayer.id)
            .map((p) => (
              <PlayerChip
                key={p.id}
                name={p.name}
                handicapIndex={p.handicapIndex}
                ghinNumber={p.ghinNumber}
                teamColor={myTeam?.color}
              />
            ))}
          {teammates.filter((p) => p.id !== currentPlayer.id).length === 0 && (
            <p className="text-sm text-fairway-600">No other teammates in your group.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Opponents this week
        </h2>
        <div className="space-y-2">
          {opponents.map((p) => {
            const team = getTeam(p.teamId);
            return (
              <PlayerChip
                key={p.id}
                name={p.name}
                handicapIndex={p.handicapIndex}
                ghinNumber={p.ghinNumber}
                teamColor={team?.color}
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-fairway-800 bg-fairway-900/20 p-4 text-xs text-fairway-500">
        <p className="font-medium text-fairway-400">Course handicap</p>
        <p className="mt-1">
          Course Handicap = Handicap Index × (Slope ÷ 113) + (Rating − Par).
          League admins set stroke allocation per hole using stroke index.
        </p>
      </section>
    </div>
  );
}
