import { PlayerAvatar } from "./PlayerAvatar";
import type { Player, Team } from "../types";

interface TeamDetailsContentProps {
  team: Team;
  players: Player[];
}

export function TeamDetailsContent({ team, players }: TeamDetailsContentProps) {
  return (
    <div className="space-y-3">
      <header className="rounded-[8px] border border-sand-hunter bg-white p-4">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: team.color }}
            aria-hidden
          />
          <div>
            <p className="card-title">
              {team.leagueLevel} league
            </p>
            <h2 className="text-xl font-bold text-fairway-300">{team.name}</h2>
          </div>
        </div>
      </header>

      <ul className="space-y-3">
        {players.map((player) => {
          const stats = player.seasonStats;
          return (
            <li
              key={player.id}
              className="rounded-[8px] border border-sand-hunter bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <PlayerAvatar player={player} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fairway-300">{player.name}</p>
                  <p className="text-sm text-fairway-500">
                    GHIN #{player.ghinNumber}
                  </p>
                  <p className="text-sm text-fairway-500">
                    Handicap index{" "}
                    <span className="font-semibold tabular-nums text-fairway-300">
                      {player.handicapIndex.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>
              {stats ? (
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-fairway-800/20 pt-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-fairway-500">
                      Rounds
                    </dt>
                    <dd className="font-semibold tabular-nums text-fairway-300">
                      {stats.roundsPlayed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-fairway-500">
                      Avg score
                    </dt>
                    <dd className="font-semibold tabular-nums text-fairway-300">
                      {stats.averageScore}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-fairway-500">
                      Match record
                    </dt>
                    <dd className="font-semibold tabular-nums text-fairway-300">
                      {stats.matchWins}–{stats.matchLosses}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
