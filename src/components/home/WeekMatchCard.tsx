import type { Course, Foursome, League, Player, Team, WeeklyMatch } from "../../types";
import { weekCardSubtitle } from "../../utils/weekDisplay";

interface WeekMatchCardProps {
  league: League;
  match: WeeklyMatch;
  course: Course;
  foursome: Foursome | undefined;
  home: Team | undefined;
  away: Team | undefined;
  players: Player[];
  showSwipeHint?: boolean;
}

export function WeekMatchCard({
  league,
  match,
  course,
  foursome,
  home,
  away,
  players,
  showSwipeHint,
}: WeekMatchCardProps) {
  return (
    <div className="rounded-2xl border border-fairway-800 bg-gradient-to-br from-fairway-900 to-fairway-950 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fairway-300">
          {`WEEK ${match.weekNumber}`}
        </p>
        {showSwipeHint && (
          <p className="text-[10px] text-fairway-500">Swipe ← →</p>
        )}
      </div>
      <h2 className="mt-2 text-xl font-bold text-fairway-200">
        {weekCardSubtitle(league, match, course)}
      </h2>
      <p className="mt-1 text-sm text-fairway-400">
        {new Date(match.date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      {match.status !== "in_progress" && (
        <p className="mt-1 text-xs capitalize text-fairway-500">
          {match.status.replace("_", " ")}
        </p>
      )}
      {home && away && (
        <p className="mt-3 text-sm">
          <span style={{ color: home.color }}>{home.name}</span>
          <span className="text-fairway-500"> vs </span>
          <span style={{ color: away.color }}>{away.name}</span>
        </p>
      )}

      {foursome && (
        <div className="mt-4 border-t border-fairway-800/80 pt-4">
          <h3 className="mb-2 text-sm font-medium text-fairway-400">
            Your foursome
          </h3>
          <ul className="space-y-1 text-sm text-fairway-200">
            {foursome.playerIds.map((id) => {
              const p = players.find((x) => x.id === id);
              return (
                <li key={id} className="flex justify-between">
                  <span>{p?.name}</span>
                  <span className="tabular-nums text-fairway-400">
                    {p?.handicapIndex.toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
