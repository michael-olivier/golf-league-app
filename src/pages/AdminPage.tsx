import { useState } from "react";
import type { Foursome, WeeklyMatch } from "../types";
import { useLeague } from "../store/LeagueContext";

export function AdminPage() {
  const { state, getCourse, addMatch, updateMatch, setMatchFoursomes } =
    useLeague();

  const [week, setWeek] = useState(5);
  const [date, setDate] = useState("2026-06-14");
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? "");

  const autoAssignFoursomes = (matchId: string, homeId: string, awayId: string) => {
    const home = state.players.filter((p) => p.teamId === homeId);
    const away = state.players.filter((p) => p.teamId === awayId);
    const ids = [...home.slice(0, 2), ...away.slice(0, 2)];
    const ids2 = [...home.slice(2, 4), ...away.slice(2, 4)];

    const foursomes: Foursome[] = [];
    if (ids.length === 4) {
      foursomes.push({
        id: `foursome-${matchId}-1`,
        matchId,
        playerIds: ids.map((player) => player.id),
        designatedScorerId: null,
      });
    }
    if (ids2.length === 4) {
      foursomes.push({
        id: `foursome-${matchId}-2`,
        matchId,
        playerIds: ids2.map((player) => player.id),
        designatedScorerId: null,
      });
    }
    return foursomes;
  };

  const createMatch = () => {
    const id = `match-week-${week}`;
    if (state.matches.some((m) => m.id === id)) return;

    const match: WeeklyMatch = {
      id,
      weekNumber: week,
      date,
      courseId,
      status: "scheduled",
      teamPairing: {
        homeTeamId: "team-a-01",
        awayTeamId: "team-a-02",
      },
      foursomes: [],
    };
    addMatch(match);
    const foursomes = autoAssignFoursomes(
      id,
      match.teamPairing.homeTeamId,
      match.teamPairing.awayTeamId,
    );
    setMatchFoursomes(id, foursomes);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-fairway-400">
        Set up weekly team matches and foursome pairings. Data is stored locally
        for this demo.
      </p>

      <section className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-4 space-y-3">
        <h2 className="font-semibold text-fairway-200">New match</h2>
        <label className="block text-xs text-fairway-400">
          Week number
          <input
            type="number"
            min={1}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200"
          />
        </label>
        <label className="block text-xs text-fairway-400">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200"
          />
        </label>
        <label className="block text-xs text-fairway-400">
          Course
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200"
          >
            {state.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={createMatch}
          className="w-full rounded-xl bg-fairway-600 py-3 font-semibold text-white"
        >
          Create match & assign foursomes
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase text-fairway-500">
          All matches
        </h2>
        <ul className="space-y-3">
          {state.matches.map((m) => {
            const course = getCourse(m.courseId);
            return (
              <li
                key={m.id}
                className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-fairway-200">
                      Week {m.weekNumber}
                    </p>
                    <p className="text-xs text-fairway-400">
                      {course?.name} · {m.date}
                    </p>
                    <p className="mt-1 text-xs capitalize text-fairway-500">
                      {m.status.replace("_", " ")} · {m.foursomes.length}{" "}
                      foursome(s)
                    </p>
                  </div>
                  <select
                    value={m.status}
                    onChange={(e) =>
                      updateMatch(m.id, {
                        status: e.target.value as WeeklyMatch["status"],
                      })
                    }
                    className="rounded-lg border border-fairway-800 bg-fairway-950 px-2 py-1 text-xs text-fairway-200"
                  >
                    <option value="scheduled">scheduled</option>
                    <option value="in_progress">in progress</option>
                    <option value="postponed">postponed</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
                {m.foursomes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-fairway-400">
                    {m.foursomes.map((f) => (
                      <li key={f.id}>
                        {f.playerIds
                          .map(
                            (id) =>
                              state.players.find((p) => p.id === id)?.name,
                          )
                          .join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
