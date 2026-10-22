import { useEffect, useMemo, useState } from "react";
import { Sheet } from "lucide-react";
import { Navigate } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { DetailedHoleInput } from "../components/ScoreEntry/DetailedHoleInput";
import { CourseHandicapFooter } from "../components/CourseHandicapFooter";
import { CourseNameWithFavorite } from "../components/CourseNameWithFavorite";
import { PageTitleSection } from "../components/PageTitleSection";
import { ScoreModeToggle } from "../components/ScoreEntry/ScoreModeToggle";
import { FoursomeMatchSummaries } from "../components/ScoreEntry/FoursomeMatchSummaries";
import { LeagueScorecardTable } from "../components/ScoreEntry/LeagueScorecardTable";
import { ScorecardSummary } from "../components/ScoreEntry/ScorecardSummary";
import { FoursomePlayerTabs } from "../components/ScoreEntry/FoursomePlayerTabs";
import { SimpleHoleInput } from "../components/ScoreEntry/SimpleHoleInput";
import {
  emptyDetailedScore,
  isDetailedScore,
  isHolePlayed,
  type DetailedHoleScore,
  type SimpleHoleScore,
} from "../types";
import { useLeague } from "../store/LeagueContext";
import { useRoundSetup } from "../store/RoundSetupContext";
import { leagueNineLabel } from "../utils/player";
import { matchRoundHasStarted } from "../utils/matchScores";
import { playableHoles } from "../utils/playableHoles";

type EntryScope = "self" | "foursome";
type ScoreMode = "simple" | "detailed";

type ScoresPageProps = {
  variant: "league" | "casual";
};

export function ScoresPage({ variant }: ScoresPageProps) {
  const {
    state,
    currentPlayer,
    getCourse,
    getPlayer,
    getFoursomeForUser,
    getRound,
    ensureRound,
    updateHoleScore,
    setRoundScoreEntryMode,
    setDesignatedScorer,
  } = useLeague();
  const { setup } = useRoundSetup();

  const isCasual = variant === "casual";
  const leagueMatch = state.matches.find((m) => m.status === "in_progress");
  const match = isCasual ? undefined : leagueMatch;
  const sessionId = isCasual ? setup?.sessionId : match?.id;
  const course = isCasual
    ? setup
      ? getCourse(setup.courseId)
      : undefined
    : match
      ? getCourse(match.courseId)
      : undefined;
  const playingHoles = useMemo(() => {
    if (!course) return [];
    if (isCasual && setup) {
      return playableHoles(course.holes, setup.holeCount, setup.startHole);
    }
    const startHole = state.league.nineSide === "back" ? 10 : 1;
    return playableHoles(
      course.holes,
      state.league.holesPerRound,
      startHole,
    );
  }, [
    course,
    isCasual,
    setup,
    state.league.holesPerRound,
    state.league.nineSide,
  ]);

  const foursome =
    !isCasual && match ? getFoursomeForUser(match.id) : undefined;

  const [scope, setScope] = useState<EntryScope>("self");
  const [mode, setMode] = useState<ScoreMode>("simple");
  const [activePlayerId, setActivePlayerId] = useState(currentPlayer.id);
  const [currentHole, setCurrentHole] = useState(0);
  const [scorecardOpen, setScorecardOpen] = useState(false);

  const foursomePlayers = useMemo(() => {
    if (!foursome) return [currentPlayer];
    return foursome.playerIds
      .map((id) => getPlayer(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [foursome, getPlayer, currentPlayer]);

  const leagueRoundStarted =
    !isCasual && match ? matchRoundHasStarted(match, state) : false;

  const roundPlayers = useMemo(() => {
    if (isCasual) {
      return foursomePlayers.filter((p) => p.id === state.currentUserId);
    }
    if (scope === "foursome") return foursomePlayers;
    return foursomePlayers.filter((p) => p.id === state.currentUserId);
  }, [isCasual, scope, foursomePlayers, state.currentUserId]);

  const canEditActivePlayer = isCasual
    ? true
    : scope === "self"
      ? activePlayerId === state.currentUserId
      : foursome?.designatedScorerId === state.currentUserId;

  const playersNeedingRounds = useMemo(() => {
    if (!isCasual && foursomePlayers.length > 1) return foursomePlayers;
    return roundPlayers;
  }, [isCasual, foursomePlayers, roundPlayers]);

  useEffect(() => {
    if (!sessionId || !course || !playingHoles.length) return;
    for (const p of playersNeedingRounds) {
      ensureRound(
        sessionId,
        p.id,
        mode,
        playingHoles.map((h) => h.par),
      );
    }
  }, [sessionId, course, playingHoles, playersNeedingRounds, mode, ensureRound]);

  useEffect(() => {
    const selectable =
      scope === "foursome" ? foursomePlayers : roundPlayers;
    if (selectable.length && !selectable.find((p) => p.id === activePlayerId)) {
      setActivePlayerId(selectable[0].id);
    }
  }, [scope, foursomePlayers, roundPlayers, activePlayerId]);

  useEffect(() => {
    if (!sessionId) return;
    const activeRound = getRound(sessionId, activePlayerId);
    if (activeRound) {
      setMode(activeRound.scoreEntryMode);
    }
  }, [sessionId, activePlayerId, getRound]);

  const forgotScoreOnPreviousHole = useMemo(() => {
    if (
      isCasual ||
      scope !== "foursome" ||
      !sessionId ||
      currentHole <= 0 ||
      foursomePlayers.length < 2 ||
      !canEditActivePlayer
    ) {
      return null;
    }
    const prevIndex = currentHole - 1;
    const missing = foursomePlayers.filter((p) => {
      const score = getRound(sessionId, p.id)?.scores[prevIndex];
      return !isHolePlayed(score);
    });
    if (missing.length === 0) return null;
    if (missing.length === 1) {
      return `You forgot to add a score for ${missing[0].name}`;
    }
    const names = missing.map((p) => p.name);
    return `You forgot to add scores for ${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  }, [
    isCasual,
    scope,
    sessionId,
    currentHole,
    foursomePlayers,
    canEditActivePlayer,
    getRound,
  ]);

  if (isCasual && !setup) {
    return <Navigate to="/scores" replace />;
  }

  if (!isCasual && !leagueMatch) {
    return <Navigate to="/" replace />;
  }

  if (!sessionId || !course || !playingHoles.length) {
    return (
      <p className="text-center text-fairway-400 py-8">
        {isCasual
          ? "Course not found. Go back and choose where you're playing."
          : "League course not found for this week."}
      </p>
    );
  }

  const hole = playingHoles[currentHole];
  const round = getRound(sessionId, activePlayerId);
  const holeScore = round?.scores[currentHole];

  const updateScore = (next: SimpleHoleScore | DetailedHoleScore) => {
    updateHoleScore(sessionId, activePlayerId, currentHole, () => {
      const strokes = next.strokes ?? null;
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
    setRoundScoreEntryMode(sessionId, activePlayerId, nextMode);
  };

  const claimScorer = () => {
    if (!foursome || !match) return;
    setDesignatedScorer(match.id, foursome.id, state.currentUserId);
  };

  const selectedTee =
    isCasual && setup
      ? (course.tees.find((t) => t.id === setup.teeBoxId) ?? course.tees[0])
      : (course.tees.find((t) => t.id === state.league.defaultTeeBoxId) ??
        course.tees[0]);

  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col space-y-4 pb-4">
      <PageTitleSection title="Score">
        <CourseNameWithFavorite courseId={course.id} courseName={course.name}>
          {isCasual && setup ? (
            <CourseHandicapFooter
              courseHandicap={setup.courseHandicap}
              inline
            />
          ) : (
            <div className="mt-1 space-y-0.5 text-sm text-fairway-500">
              <p>
                Week {match?.weekNumber} ·{" "}
                {leagueNineLabel(state.league.nineSide)}
              </p>
            </div>
          )}
        </CourseNameWithFavorite>
      </PageTitleSection>
      {isCasual && setup ? (
        <div className="rounded-[8px] border border-sand-hunter bg-white px-4 py-2.5 text-center text-sm font-medium capitalize text-sand-hunter">
          {setup.scoreType} · {setup.holeCount} holes
          {selectedTee ? ` · ${selectedTee.name} tees` : ""}
        </div>
      ) : null}

      {!isCasual && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setScope("self");
              setActivePlayerId(state.currentUserId);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              scope === "self"
                ? "bg-sand-hunter text-white"
                : "border border-sand-hunter bg-transparent text-sand-hunter"
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setScope("foursome")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              scope === "foursome"
                ? "bg-sand-hunter text-white"
                : "border border-sand-hunter bg-transparent text-sand-hunter"
            }`}
          >
            Foursome
          </button>
        </div>
      )}

      {!isCasual &&
      scope === "foursome" &&
      foursome &&
      foursome.designatedScorerId !== state.currentUserId ? (
        <div className="rounded-[8px] border border-sand-brick/35 bg-sand-brick/10 px-3 py-2 text-xs text-sand-brick">
          {foursome.designatedScorerId ? (
            <>
              <strong>
                {getPlayer(foursome.designatedScorerId)?.name}
              </strong>{" "}
              is entering for the group.
            </>
          ) : !leagueRoundStarted ? (
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
          ) : (
            <>Group scoring is in progress.</>
          )}
        </div>
      ) : null}

      {!isCasual && scope === "foursome" && foursomePlayers.length > 1 && (
        <FoursomePlayerTabs
          players={foursomePlayers}
          activePlayerId={activePlayerId}
          onSelect={setActivePlayerId}
        />
      )}

      {hole && holeScore && (
        <div
          className={`min-w-0 space-y-3 rounded-[8px] border border-sand-hunter bg-white p-4 ${
            !canEditActivePlayer ? "opacity-80" : ""
          }`}
        >
          <fieldset
            disabled={!canEditActivePlayer}
            className="space-y-3 disabled:pointer-events-none"
          >
            {mode === "simple" ? (
              <SimpleHoleInput
                holeNumber={hole.number}
                par={hole.par}
                score={{ strokes: holeScore?.strokes ?? null }}
                onChange={updateScore}
                navigation={{
                  onPrevious: () =>
                    setCurrentHole((h) => Math.max(0, h - 1)),
                  onNext: () =>
                    setCurrentHole((h) =>
                      Math.min(playingHoles.length - 1, h + 1),
                    ),
                  canPrevious: currentHole > 0,
                  canNext: currentHole < playingHoles.length - 1,
                }}
              />
            ) : (
              <DetailedHoleInput
                holeNumber={hole.number}
                par={hole.par}
                score={
                  holeScore && isDetailedScore(holeScore)
                    ? holeScore
                    : {
                        ...emptyDetailedScore(),
                        strokes: holeScore?.strokes ?? null,
                      }
                }
                onChange={updateScore}
                navigation={{
                  onPrevious: () =>
                    setCurrentHole((h) => Math.max(0, h - 1)),
                  onNext: () =>
                    setCurrentHole((h) =>
                      Math.min(playingHoles.length - 1, h + 1),
                    ),
                  canPrevious: currentHole > 0,
                  canNext: currentHole < playingHoles.length - 1,
                }}
              />
            )}
          </fieldset>

          {forgotScoreOnPreviousHole ? (
            <p className="text-xs leading-snug text-sand-brick">
              {forgotScoreOnPreviousHole}
            </p>
          ) : null}

          <div className="border-t border-fairway-800/25 pt-2">
            <ScoreModeToggle
              statsEnabled={mode === "detailed"}
              onChange={handleStatsToggle}
              disabled={!canEditActivePlayer}
            />
          </div>
        </div>
      )}

      {!isCasual && foursomePlayers.length > 1 ? (
        <FoursomeMatchSummaries
          players={foursomePlayers}
          holes={playingHoles}
          scoresForPlayer={(id) => getRound(sessionId, id)?.scores}
        />
      ) : (
        roundPlayers.map((p) => {
          const r = getRound(sessionId, p.id);
          if (!r) return null;
          return (
            <ScorecardSummary
              key={p.id}
              playerName={p.name}
              holes={playingHoles}
              scores={r.scores}
            />
          );
        })
      )}

      {!isCasual && (
        <>
          <button
            type="button"
            onClick={() => setScorecardOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-sand-hunter bg-transparent py-3 text-xs font-bold tracking-wide text-sand-hunter transition hover:bg-fairway-950/5 active:bg-fairway-950/10"
          >
            <Sheet className="h-5 w-5 shrink-0" strokeWidth={0.5} aria-hidden />
            VIEW SCORECARD
          </button>
          <BottomSheet
            open={scorecardOpen}
            onClose={() => setScorecardOpen(false)}
            title="Scorecard"
            tone="white"
            contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <LeagueScorecardTable
              courseName={course.name}
              nineLabel={leagueNineLabel(state.league.nineSide)}
              holes={playingHoles}
              players={foursomePlayers}
              scoresForPlayer={(id) => getRound(sessionId, id)?.scores}
            />
          </BottomSheet>
        </>
      )}

    </div>
  );
}
