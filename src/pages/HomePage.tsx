import { Link } from "react-router-dom";
import { HandicapBadge } from "../components/HandicapBadge";
import { useLeague } from "../store/LeagueContext";
import { weekCardSubtitle } from "../utils/weekDisplay";

export function HomePage() {
  const {
    activeMatch,
    currentPlayer,
    getCourse,
    getTeam,
    getFoursomeForUser,
    getTeamMakeups,
    getPostponedMatchesForTeam,
    state,
  } = useLeague();

  const openMakeups = getTeamMakeups().filter((t) => t.makeup.status === "open");
  const needsMakeupStart = getPostponedMatchesForTeam().length;
  const makeupAttention = openMakeups.length + needsMakeupStart;

  const match = activeMatch;
  const course = match ? getCourse(match.courseId) : undefined;
  const foursome = match ? getFoursomeForUser(match.id) : undefined;
  const home = match ? getTeam(match.teamPairing.homeTeamId) : undefined;
  const away = match ? getTeam(match.teamPairing.awayTeamId) : undefined;

  return (
    <div className="space-y-5">
      {makeupAttention > 0 && (
        <Link
          to="/makeup"
          className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <span>
            {openMakeups.length > 0
              ? `${openMakeups.length} makeup date${openMakeups.length === 1 ? "" : "s"} to coordinate`
              : "Schedule a postponed match"}
          </span>
          <span>→</span>
        </Link>
      )}

      <section className="rounded-2xl border border-fairway-800 bg-gradient-to-br from-fairway-900 to-fairway-950 p-5">
        {match && course ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fairway-300">
              {`WEEK ${match.weekNumber}`}
            </p>
            <h2 className="mt-2 text-xl font-bold text-fairway-200">
              {weekCardSubtitle(state.league, match, course)}
            </h2>
            <p className="mt-1 text-sm text-fairway-400">
              {new Date(match.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            {home && away && (
              <p className="mt-3 text-sm">
                <span style={{ color: home.color }}>{home.name}</span>
                <span className="text-fairway-500"> vs </span>
                <span style={{ color: away.color }}>{away.name}</span>
              </p>
            )}
          </>
        ) : (
          <p className="text-fairway-300">No upcoming match scheduled.</p>
        )}
      </section>

      <Link
        to="/scores"
        className="flex items-center justify-between rounded-2xl bg-fairway-600 px-5 py-4 font-semibold text-white shadow-lg shadow-black/10 transition active:scale-[0.98] dark:shadow-black/40"
      >
        <span>Enter scores</span>
        <span className="text-2xl">→</span>
      </Link>

      <section className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-fairway-400">
          Your GHIN
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="font-semibold text-fairway-200">{currentPlayer.name}</p>
            <p className="text-xs text-fairway-500">
              #{currentPlayer.ghinNumber}
            </p>
          </div>
          <HandicapBadge
            index={currentPlayer.handicapIndex}
            size="md"
          />
        </div>
      </section>

      {foursome && match && (
        <section className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-4">
          <h3 className="mb-2 text-sm font-medium text-fairway-400">
            Your foursome
          </h3>
          <ul className="space-y-1 text-sm text-fairway-200">
            {foursome.playerIds.map((id) => {
              const p = state.players.find((x) => x.id === id);
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
          {foursome.designatedScorerId && (
            <p className="mt-2 text-xs text-fairway-500">
              Designated scorer:{" "}
              {state.players.find(
                (p) => p.id === foursome.designatedScorerId,
              )?.name ?? "—"}
            </p>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/roster"
          className="rounded-xl border border-fairway-800 bg-fairway-900/40 px-4 py-3 text-center text-sm font-medium text-fairway-200 hover:border-fairway-600"
        >
          League roster
        </Link>
        <Link
          to="/handicaps"
          className="rounded-xl border border-fairway-800 bg-fairway-900/40 px-4 py-3 text-center text-sm font-medium text-fairway-200 hover:border-fairway-600"
        >
          View handicaps
        </Link>
        <Link
          to="/rules"
          className="rounded-xl border border-fairway-800 bg-fairway-900/40 px-4 py-3 text-center text-sm font-medium text-fairway-200 hover:border-fairway-600"
        >
          USGA rules
        </Link>
      </div>
    </div>
  );
}
