import { HandicapBadge } from "../components/HandicapBadge";
import { useLeague } from "../store/LeagueContext";
import type { LeagueLevel } from "../types";

export function RosterPage() {
  const { state } = useLeague();
  const leagueLevels: LeagueLevel[] = ["A", "B"];

  return (
    <div className="space-y-5">
      <p className="text-sm text-fairway-400">
        Full league roster: 20 teams of 2 players in each league, 40 players per
        league.
      </p>

      {leagueLevels.map((leagueLevel) => {
        const teams = state.teams.filter((team) => team.leagueLevel === leagueLevel);
        const playerCount = teams.reduce(
          (total, team) =>
            total + state.players.filter((player) => player.teamId === team.id).length,
          0,
        );

        return (
          <section key={leagueLevel} className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-fairway-500">
                  {leagueLevel} League
                </p>
                <h2 className="text-xl font-bold text-fairway-200">
                  {teams.length} teams · {playerCount} golfers
                </h2>
              </div>
            </div>

            <ul className="space-y-2">
              {teams.map((team, index) => {
                const players = state.players.filter((player) => player.teamId === team.id);

                return (
                  <li
                    key={team.id}
                    className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="h-7 w-1.5 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <div>
                        <p className="text-xs text-fairway-500">
                          Team {index + 1}
                        </p>
                        <h3 className="font-semibold text-fairway-200">{team.name}</h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between rounded-lg bg-fairway-950/60 px-3 py-2"
                        >
                          <div>
                            <p className="font-medium text-fairway-200">
                              {player.name}
                            </p>
                            <p className="text-xs text-fairway-600">
                              GHIN {player.ghinNumber}
                            </p>
                          </div>
                          <HandicapBadge index={player.handicapIndex} size="sm" />
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
