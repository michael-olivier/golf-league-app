import {
  ArrowDownAZ,
  ArrowDownZA,
  ListFilterPlus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { PageTitleSection } from "../components/PageTitleSection";
import { HandicapBadge } from "../components/HandicapBadge";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useLeague } from "../store/LeagueContext";
import type { LeagueLevel, Team } from "../types";

const leagueTabs: { level: LeagueLevel; label: string }[] = [
  { level: "A", label: "A League" },
  { level: "B", label: "B League" },
];

const iconProps = {
  className: "h-4 w-4 shrink-0",
  strokeWidth: 0.5 as const,
  "aria-hidden": true as const,
};

function teamMatchesFilter(
  team: Team,
  players: { teamId: string; name: string }[],
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (team.name.toLowerCase().includes(q)) return true;
  return players
    .filter((p) => p.teamId === team.id)
    .some((p) => p.name.toLowerCase().includes(q));
}

export function RosterPage() {
  const { state } = useLeague();
  const [activeLevel, setActiveLevel] = useState<LeagueLevel>("A");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(false);
  const director = state.league.director;

  const teamsForLevel = useMemo(
    () => state.teams.filter((team) => team.leagueLevel === activeLevel),
    [state.teams, activeLevel],
  );

  const displayedTeams = useMemo(() => {
    const filtered = teamsForLevel.filter((team) =>
      teamMatchesFilter(team, state.players, filterQuery),
    );
    return [...filtered].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sortDescending ? -cmp : cmp;
    });
  }, [teamsForLevel, state.players, filterQuery, sortDescending]);

  const toggleSort = () => {
    setSortDescending((prev) => !prev);
  };

  const SortIcon = sortDescending ? ArrowDownZA : ArrowDownAZ;

  return (
    <div className="space-y-4 pb-4">
      <div className="space-y-4">
        <PageTitleSection title="Roster" />
        {director ? (
          <p className="page-title-gutter text-sm text-fairway-500">
            League Director:{" "}
            <Link
              to={`/contact/${director.id}`}
              className="font-medium text-sand-hunter underline-offset-2 hover:underline"
            >
              {director.name}
            </Link>
          </p>
        ) : null}

        <div className="flex gap-2">
          {leagueTabs.map(({ level, label }) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              className={`flex-1 rounded-md py-2 text-sm font-medium uppercase tracking-wide transition ${
                activeLevel === level
                  ? "bg-sand-hunter text-white"
                  : "border border-sand-hunter bg-transparent text-sand-hunter"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-hunter"
          >
            <ListFilterPlus {...iconProps} />
            Filter
            {filterQuery.trim() ? (
              <span className="sr-only"> (active)</span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={toggleSort}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-hunter"
            aria-label={
              sortDescending
                ? "Sort teams Z to A"
                : "Sort teams A to Z"
            }
          >
            <SortIcon {...iconProps} />
            Sort
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {displayedTeams.length === 0 ? (
          <li className="rounded-xl border border-fairway-800 bg-fairway-900/30 px-4 py-8 text-center text-sm text-fairway-500">
            No teams match your filter.
          </li>
        ) : (
          displayedTeams.map((team, index) => {
            const players = state.players.filter(
              (player) => player.teamId === team.id,
            );

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
                    <p className="text-xs text-fairway-500">Team {index + 1}</p>
                    <h3 className="font-semibold text-fairway-200">{team.name}</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 rounded-lg bg-fairway-950/60 px-3 py-2"
                    >
                      <PlayerAvatar player={player} size="xs" />
                      <div className="min-w-0 flex-1">
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
          })
        )}
      </ul>

      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter roster"
        tone="white"
        compact
        scrimClassName="bg-black/20"
        lockBackgroundScroll={false}
        contentClassName="!pt-6"
      >
        <label className="block text-sm font-medium text-fairway-300">
          <span className="flex items-center justify-between gap-2">
            Team or player name
            {filterQuery.trim() ? (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="text-xs font-medium text-sand-hunter underline-offset-2 hover:underline"
              >
                Clear
              </button>
            ) : null}
          </span>
          <div className="relative mt-2">
            <input
              type="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setFilterOpen(false);
              }}
              placeholder="Start typing…"
              className="w-full rounded-[8px] border border-sand-hunter bg-white py-2.5 pl-3 pr-12 text-sm text-fairway-300 placeholder:text-fairway-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              aria-label="Search"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[6px] bg-sand-hunter text-white"
            >
              <Search className="h-5 w-5" strokeWidth={0.5} aria-hidden />
            </button>
          </div>
        </label>
        <div className="h-[60px]" aria-hidden />
      </BottomSheet>
    </div>
  );
}
