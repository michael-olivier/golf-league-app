import { useEffect, useMemo, useState } from "react";
import { DetailedHoleInput } from "../components/ScoreEntry/DetailedHoleInput";
import { ScoreModeToggle } from "../components/ScoreEntry/ScoreModeToggle";
import { FoursomeMatchSummaries } from "../components/ScoreEntry/FoursomeMatchSummaries";
import { ScorecardSummary } from "../components/ScoreEntry/ScorecardSummary";
import { FoursomePlayerTabs } from "../components/ScoreEntry/FoursomePlayerTabs";
import { SimpleHoleInput } from "../components/ScoreEntry/SimpleHoleInput";
import {
  emptyDetailedScore,
  isDetailedScore,
  type DetailedHoleScore,
  type SimpleHoleScore,
} from "../types";
import { useLeague } from "../store/LeagueContext";

type EntryScope = "self" | "foursome";
type ScoreMode = "simple" | "detailed";

export function ScoresPage() {
  const {
    state,
    currentPlayer,
    activeMatch,
    getCourse,
    getPlayer,
    getFoursomeForUser,
    getRound,
    ensureRound,
    updateHoleScore,
    setRoundScoreEntryMode,
    setDesignatedScorer,
  } = useLeague();

  const match = activeMatch;
  const course = match ? getCourse(match.courseId) : undefined;
  const foursome = match ? getFoursomeForUser(match.id) : undefined;

  const [scope, setScope] = useState<EntryScope>("self");
  const [mode, setMode] = useState<ScoreMode>("simple");
  const [activePlayerId, setActivePlayerId] = useState(currentPlayer.id);
  const [currentHole, setCurrentHole] = useState(0);

  const foursomePlayers = useMemo(() => {
    if (!foursome) return [currentPlayer];
    return foursome.playerIds
      .map((id) => getPlayer(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [foursome, getPlayer, currentPlayer]);

  const canEditAll =
    scope === "foursome" &&
    (foursome?.designatedScorerId === state.currentUserId ||
      foursome?.designatedScorerId === null ||
      state.role === "admin");

  const editablePlayers =
    scope === "self" || !canEditAll
      ? foursomePlayers.filter((p) => p.id === state.currentUserId)
      : foursomePlayers;

  const roundPlayers = scope === "foursome" ? foursomePlayers : editablePlayers;

  const canEditActivePlayer =
    scope === "self" ||
    canEditAll ||
    activePlayerId === state.currentUserId;

  useEffect(() => {
    if (!match || !course) return;
    for (const p of roundPlayers) {
      ensureRound(
        match.id,
        p.id,
        mode,
        course.holes.map((h) => h.par),
      );
    }
  }, [match, course, roundPlayers, mode, ensureRound]);

  useEffect(() => {
    const selectable =
      scope === "foursome" ? foursomePlayers : editablePlayers;
    if (selectable.length && !selectable.find((p) => p.id === activePlayerId)) {
      setActivePlayerId(selectable[0].id);
    }
  }, [scope, foursomePlayers, editablePlayers, activePlayerId]);

  useEffect(() => {
    if (!match) return;
    const activeRound = getRound(match.id, activePlayerId);
    if (activeRound) {
      setMode(activeRound.scoreEntryMode);
    }
  }, [match, activePlayerId, getRound]);

  if (!match || !course) {
    return (
      <p className="text-center text-fairway-400 py-8">
        No active match. Ask an admin to schedule this week&apos;s round.
      </p>
    );
  }

  const hole = course.holes[currentHole];
  const activePlayer = getPlayer(activePlayerId);
  const round = getRound(match.id, activePlayerId);
  const holeScore = round?.scores[currentHole];

  const updateScore = (next: SimpleHoleScore | DetailedHoleScore) => {
    updateHoleScore(match.id, activePlayerId, currentHole, () => {
      const strokes = next.strokes ?? hole.par;
      if (mode === "simple") {
        return { strokes };
      }
      return isDetailedScore(next)
        ? { ...next, strokes }
        : { ...emptyDetailedScore(), strokes };
    });
  };

  const handleStatsToggle = (statsEnabled: boolean) => {
    const nextMode: ScoreMode = statsEnabled ? "detailed" : "simple";
    setMode(nextMode);
    setRoundScoreEntryMode(match.id, activePlayerId, nextMode);
  };

  const claimScorer = () => {
    if (!foursome) return;
    setDesignatedScorer(match.id, foursome.id, state.currentUserId);
  };

  const releaseScorer = () => {
    if (!foursome) return;
    setDesignatedScorer(match.id, foursome.id, null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl bg-fairway-900/60 p-1">
        <button
          type="button"
          onClick={() => {
            setScope("self");
            setActivePlayerId(state.currentUserId);
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            scope === "self" ? "bg-fairway-700 text-white" : "text-fairway-400"
          }`}
        >
          My score
        </button>
        <button
          type="button"
          onClick={() => setScope("foursome")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            scope === "foursome"
              ? "bg-fairway-700 text-white"
              : "text-fairway-400"
          }`}
        >
          Foursome
        </button>
      </div>

      {scope === "foursome" && foursome && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {foursome.designatedScorerId ? (
            <>
              <strong>
                {getPlayer(foursome.designatedScorerId)?.name}
              </strong>{" "}
              is entering for the group.
              {foursome.designatedScorerId === state.currentUserId && (
                <button
                  type="button"
                  onClick={releaseScorer}
                  className="ml-2 underline"
                >
                  Let others enter
                </button>
              )}
            </>
          ) : (
            <>
              Anyone in the group can enter scores, or{" "}
              <button
                type="button"
                onClick={claimScorer}
                className="font-semibold underline"
              >
                enter for everyone
              </button>
              .
            </>
          )}
        </div>
      )}

      {scope === "foursome" && foursomePlayers.length > 1 && (
        <FoursomePlayerTabs
          players={foursomePlayers}
          activePlayerId={activePlayerId}
          onSelect={setActivePlayerId}
        />
      )}

      {hole && holeScore && (
        <div
          className={`space-y-3 rounded-xl border border-fairway-800 bg-fairway-900/40 p-3 ${
            !canEditActivePlayer ? "opacity-80" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentHole === 0}
              onClick={() => setCurrentHole((h) => Math.max(0, h - 1))}
              className="rounded-lg bg-fairway-800 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-fairway-400">
              {currentHole + 1} / {course.holes.length}
            </span>
            <button
              type="button"
              disabled={currentHole >= course.holes.length - 1}
              onClick={() =>
                setCurrentHole((h) =>
                  Math.min(course.holes.length - 1, h + 1),
                )
              }
              className="rounded-lg bg-fairway-800 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <fieldset disabled={!canEditActivePlayer} className="space-y-3 disabled:pointer-events-none">
            {mode === "simple" ? (
              <SimpleHoleInput
                holeNumber={hole.number}
                par={hole.par}
                score={{ strokes: holeScore.strokes }}
                onChange={updateScore}
              />
            ) : (
              <DetailedHoleInput
                holeNumber={hole.number}
                par={hole.par}
                score={
                  isDetailedScore(holeScore)
                    ? holeScore
                    : {
                        ...emptyDetailedScore(),
                        strokes: holeScore.strokes ?? hole.par,
                      }
                }
                onChange={updateScore}
              />
            )}

          </fieldset>

          <div className="border-t border-fairway-800/80 pt-2">
            <ScoreModeToggle
              statsEnabled={mode === "detailed"}
              onChange={handleStatsToggle}
              disabled={!canEditActivePlayer}
            />
          </div>
        </div>
      )}

      {scope === "foursome" && foursomePlayers.length > 1 ? (
        <FoursomeMatchSummaries
          players={foursomePlayers}
          holes={course.holes}
          scoresForPlayer={(id) => getRound(match.id, id)?.scores}
        />
      ) : (
        editablePlayers.map((p) => {
          const r = getRound(match.id, p.id);
          if (!r) return null;
          return (
            <ScorecardSummary
              key={p.id}
              playerName={p.name}
              holes={course.holes}
              scores={r.scores}
            />
          );
        })
      )}

      {activePlayer && (
        <p className="text-center text-xs text-fairway-600">
          Scoring for {activePlayer.name}
          {scope === "foursome" && !canEditActivePlayer && (
            <span className="text-amber-500"> — view only</span>
          )}
        </p>
      )}
    </div>
  );
}
