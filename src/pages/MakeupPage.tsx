import { useMemo, useState } from "react";
import { useLeague } from "../store/LeagueContext";
import {
  formatMakeupDateTime,
  opponentTeamId,
  playersOnTeam,
} from "../utils/makeup";

export function MakeupPage() {
  const {
    state,
    currentPlayer,
    getTeam,
    getCourse,
    getPlayer,
    getTeamMakeups,
    getPostponedMatchesForTeam,
    startMakeupRequest,
    addMakeupProposal,
    confirmMakeupProposal,
  } = useLeague();

  const teamMakeups = getTeamMakeups();
  const postponedWithoutThread = getPostponedMatchesForTeam();

  const [expandedId, setExpandedId] = useState<string | null>(
    teamMakeups[0]?.makeup.id ?? null,
  );
  const [date, setDate] = useState("");
  const [teeTime, setTeeTime] = useState("16:00");
  const [notes, setNotes] = useState("");

  const myTeam = getTeam(currentPlayer.teamId);

  const resetForm = () => {
    setDate("");
    setTeeTime("16:00");
    setNotes("");
  };

  const handlePropose = (makeupId: string) => {
    if (!date) return;
    addMakeupProposal(makeupId, { date, teeTime, notes });
    resetForm();
  };

  const allThreads = useMemo(
    () => [
      ...teamMakeups,
      ...postponedWithoutThread.map((match) => ({
        match,
        makeup: null as null,
      })),
    ],
    [teamMakeups, postponedWithoutThread],
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-fairway-400">
        Coordinate a new date when a weekly match is postponed. Either team can
        propose times; a player from the <strong className="text-fairway-300">other</strong>{" "}
        team confirms to lock it in.
      </p>

      {allThreads.length === 0 ? (
        <div className="rounded-xl border border-fairway-800 bg-fairway-900/30 px-4 py-8 text-center text-sm text-fairway-500">
          No postponed matches need scheduling right now.
        </div>
      ) : (
        <ul className="space-y-4">
          {allThreads.map(({ match, makeup }) => {
            const course = getCourse(match.courseId);
            const home = getTeam(match.teamPairing.homeTeamId);
            const away = getTeam(match.teamPairing.awayTeamId);
            const opponentId = opponentTeamId(match, currentPlayer.teamId);
            const opponent = opponentId ? getTeam(opponentId) : undefined;
            const isExpanded = makeup
              ? expandedId === makeup.id
              : expandedId === `new-${match.id}`;

            if (!makeup) {
              return (
                <li
                  key={match.id}
                  className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">
                    Postponed · Week {match.weekNumber}
                  </p>
                  <h2 className="mt-1 font-semibold text-fairway-200">
                    {home?.name} vs {away?.name}
                  </h2>
                  <p className="mt-1 text-xs text-fairway-500">
                    Originally {match.date}
                    {course ? ` · ${course.name}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const created = startMakeupRequest(match.id);
                      if (created) setExpandedId(created.id);
                    }}
                    className="mt-3 w-full rounded-xl bg-fairway-600 py-2.5 text-sm font-semibold text-white"
                  >
                    Start makeup scheduling
                  </button>
                </li>
              );
            }

            const confirmed = makeup.status === "confirmed";
            const confirmedProposal = makeup.proposals.find(
              (p) => p.id === makeup.confirmedProposalId,
            );

            return (
              <li
                key={makeup.id}
                className="overflow-hidden rounded-xl border border-fairway-800 bg-fairway-900/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : makeup.id)
                  }
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fairway-500">
                      Week {match.weekNumber}
                      {confirmed ? " · Confirmed" : " · Scheduling"}
                    </p>
                    <h2 className="mt-0.5 font-semibold text-fairway-200">
                      <span style={{ color: home?.color }}>{home?.name}</span>
                      <span className="text-fairway-600"> vs </span>
                      <span style={{ color: away?.color }}>{away?.name}</span>
                    </h2>
                    {confirmed && confirmedProposal ? (
                      <p className="mt-1 text-sm text-fairway-400">
                        {formatMakeupDateTime(
                          confirmedProposal.date,
                          confirmedProposal.teeTime,
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-fairway-500">
                        {makeup.proposals.length} proposed date
                        {makeup.proposals.length === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                  <span className="text-fairway-600">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-fairway-800 px-4 py-4">
                    {confirmed && confirmedProposal ? (
                      <div className="rounded-lg bg-fairway-800/40 px-3 py-3 text-sm">
                        <p className="font-medium text-fairway-200">
                          Makeup locked in
                        </p>
                        <p className="mt-1 text-fairway-300">
                          {formatMakeupDateTime(
                            confirmedProposal.date,
                            confirmedProposal.teeTime,
                          )}
                        </p>
                        {confirmedProposal.notes && (
                          <p className="mt-2 text-xs text-fairway-500">
                            {confirmedProposal.notes}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-fairway-500">
                          Proposed by{" "}
                          {getPlayer(confirmedProposal.proposedByPlayerId)?.name}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-fairway-500">
                            Proposed dates
                          </h3>
                          {makeup.proposals.length === 0 ? (
                            <p className="mt-2 text-sm text-fairway-600">
                              No proposals yet — be the first to suggest a date.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-2">
                              {[...makeup.proposals]
                                .reverse()
                                .map((proposal) => {
                                  const proposer = getPlayer(
                                    proposal.proposedByPlayerId,
                                  );
                                  const proposerTeam = getTeam(
                                    proposal.proposedByTeamId,
                                  );
                                  const canConfirm =
                                    proposal.proposedByTeamId !==
                                    currentPlayer.teamId;

                                  return (
                                    <li
                                      key={proposal.id}
                                      className="rounded-lg border border-fairway-800 bg-fairway-950/60 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="font-medium text-fairway-200">
                                            {formatMakeupDateTime(
                                              proposal.date,
                                              proposal.teeTime,
                                            )}
                                          </p>
                                          <p className="mt-1 text-xs text-fairway-500">
                                            <span
                                              style={{
                                                color: proposerTeam?.color,
                                              }}
                                            >
                                              {proposerTeam?.name}
                                            </span>
                                            {" · "}
                                            {proposer?.name}
                                          </p>
                                          {proposal.notes && (
                                            <p className="mt-2 text-sm text-fairway-400">
                                              {proposal.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {canConfirm && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            confirmMakeupProposal(
                                              makeup.id,
                                              proposal.id,
                                            )
                                          }
                                          className="mt-3 w-full rounded-lg bg-fairway-600 py-2 text-sm font-semibold text-white"
                                        >
                                          Confirm for {opponent?.name ?? "opponent"}
                                        </button>
                                      )}
                                    </li>
                                  );
                                })}
                            </ul>
                          )}
                        </div>

                        <div className="rounded-xl border border-fairway-800 bg-fairway-950/40 p-3 space-y-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-fairway-500">
                            Propose a date ({myTeam?.name})
                          </h3>
                          <label className="block text-xs text-fairway-400">
                            Date
                            <input
                              type="date"
                              value={date}
                              min={new Date().toISOString().slice(0, 10)}
                              onChange={(e) => setDate(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200"
                            />
                          </label>
                          <label className="block text-xs text-fairway-400">
                            Tee time
                            <input
                              type="time"
                              value={teeTime}
                              onChange={(e) => setTeeTime(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200"
                            />
                          </label>
                          <label className="block text-xs text-fairway-400">
                            Note (optional)
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={2}
                              placeholder="e.g. Back nine only, twilight rates…"
                              className="mt-1 w-full resize-none rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200 placeholder:text-fairway-500"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={!date}
                            onClick={() => handlePropose(makeup.id)}
                            className="w-full rounded-lg bg-fairway-700 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                          >
                            Add proposal
                          </button>
                        </div>

                        <div className="text-xs text-fairway-600">
                          <p className="font-medium text-fairway-500">
                            Your teammates
                          </p>
                          <p className="mt-1">
                            {playersOnTeam(state.players, currentPlayer.teamId)
                              .map((p) => p.name)
                              .join(", ")}
                          </p>
                          {opponent && (
                            <>
                              <p className="mt-2 font-medium text-fairway-500">
                                {opponent.name}
                              </p>
                              <p className="mt-1">
                                {playersOnTeam(state.players, opponent.id)
                                  .map((p) => p.name)
                                  .join(", ")}
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
