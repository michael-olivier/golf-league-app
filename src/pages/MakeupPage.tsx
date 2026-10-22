import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { PageTitleSection } from "../components/PageTitleSection";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useLeague } from "../store/LeagueContext";
import type { MakeupProposal, Player, WeeklyMatch } from "../types";
import {
  allMatchPlayersConfirmedProposal,
  formatMakeupDateTime,
  isOnMatchTeam,
  playersInMatch,
} from "../utils/makeup";

function ConfirmedPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-sage/25 px-3 py-1.5 text-xs font-semibold text-sand-hunter">
      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={0.5} aria-hidden />
      Confirmed
    </span>
  );
}

function ProposalConfirmationsList({
  proposal,
  match,
  players,
  getPlayer,
}: {
  proposal: MakeupProposal;
  match: WeeklyMatch;
  players: Player[];
  getPlayer: (id: string) => Player | undefined;
}) {
  const roster = playersInMatch(players, match);
  const confirmed = proposal.confirmedByPlayerIds
    .map((id) => getPlayer(id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  if (confirmed.length === 0) {
    return (
      <p className="mt-3 text-xs text-fairway-600">No confirmations yet.</p>
    );
  }

  const allConfirmed =
    roster.length > 0 && confirmed.length === roster.length;

  return (
    <div className="mt-3">
      <p className="card-title">
        {allConfirmed
          ? "Confirmed"
          : `${confirmed.length} of ${roster.length} players`}
      </p>
      <ul className="mt-2 space-y-2">
        {confirmed.map((player) => (
          <li key={player.id} className="flex items-center gap-2">
            <PlayerAvatar player={player} size="xs" />
            <span className="min-w-0 flex-1 text-sm text-fairway-200">
              {player.name}
            </span>
            <Check
              className="h-4 w-4 shrink-0 text-sand-hunter"
              strokeWidth={0.5}
              aria-hidden
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    <div className="space-y-5 pb-4">
      <PageTitleSection title="Makeup dates">
        <p className="text-sm text-fairway-400">
          Coordinate a new date when a weekly match is postponed. Anyone in the
          match can propose a time;{" "}
          <strong className="text-fairway-300">all four players</strong> must
          confirm the same proposal before it is locked in.
        </p>
      </PageTitleSection>

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
            const isExpanded = makeup
              ? expandedId === makeup.id
              : expandedId === `new-${match.id}`;

            if (!makeup) {
              return (
                <li
                  key={match.id}
                  className="rounded-xl border border-sand-brick/35 bg-sand-brick/10 p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-brick">
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-fairway-200">
                            Makeup locked in
                          </p>
                          <ConfirmedPill />
                        </div>
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
                        <ProposalConfirmationsList
                          proposal={confirmedProposal}
                          match={match}
                          players={state.players}
                          getPlayer={getPlayer}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="card-title">
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
                                  const isProposalLocked =
                                    makeup.status === "confirmed" &&
                                    makeup.confirmedProposalId === proposal.id;
                                  const allPlayersConfirmed =
                                    allMatchPlayersConfirmedProposal(
                                      proposal,
                                      match,
                                      state.players,
                                    );
                                  const userConfirmed =
                                    proposal.confirmedByPlayerIds.includes(
                                      currentPlayer.id,
                                    );
                                  const canConfirm =
                                    makeup.status === "open" &&
                                    isOnMatchTeam(match, currentPlayer.teamId) &&
                                    !userConfirmed &&
                                    !allPlayersConfirmed;
                                  const showLockedHighlight =
                                    isProposalLocked || allPlayersConfirmed;
                                  return (
                                    <li
                                      key={proposal.id}
                                      className={`rounded-lg border p-3 ${
                                        showLockedHighlight
                                          ? "border-sand-hunter bg-sand-sage/15 ring-1 ring-sand-sage/35"
                                          : "border-fairway-800 bg-fairway-950/60"
                                      }`}
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
                                        {showLockedHighlight ? (
                                          <ConfirmedPill />
                                        ) : null}
                                      </div>
                                      <ProposalConfirmationsList
                                        proposal={proposal}
                                        match={match}
                                        players={state.players}
                                        getPlayer={getPlayer}
                                      />
                                      {canConfirm ? (
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
                                          Confirm
                                        </button>
                                      ) : null}
                                    </li>
                                  );
                                })}
                            </ul>
                          )}
                        </div>

                        {makeup.status === "open" ? (
                          <div>
                            <h3 className="card-title">Propose a date</h3>
                            <fieldset
                              disabled={makeup.proposals.some((p) =>
                                allMatchPlayersConfirmedProposal(
                                  p,
                                  match,
                                  state.players,
                                ),
                              )}
                              className="mt-2 space-y-3 disabled:opacity-50"
                            >
                              <label className="block text-xs text-fairway-400">
                                Date
                                <input
                                  type="date"
                                  value={date}
                                  min={new Date().toISOString().slice(0, 10)}
                                  onChange={(e) => setDate(e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200 disabled:cursor-not-allowed"
                                />
                              </label>
                              <label className="block text-xs text-fairway-400">
                                Tee time
                                <input
                                  type="time"
                                  value={teeTime}
                                  onChange={(e) => setTeeTime(e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200 disabled:cursor-not-allowed"
                                />
                              </label>
                              <label className="block text-xs text-fairway-400">
                                Note (optional)
                                <textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={2}
                                  placeholder="e.g. Back nine only, twilight rates…"
                                  className="mt-1 w-full resize-none rounded-lg border border-fairway-800 bg-fairway-950 px-3 py-2 text-fairway-200 placeholder:text-fairway-500 disabled:cursor-not-allowed"
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
                            </fieldset>
                          </div>
                        ) : null}
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
