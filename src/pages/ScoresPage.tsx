import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { DetailedHoleInput } from "../components/ScoreEntry/DetailedHoleInput";
import { CourseFavoriteStar } from "../components/CourseFavoriteStar";
import { LeagueScorecardTable } from "../components/ScoreEntry/LeagueScorecardTable";
import { FoursomeScoringWithTabs } from "../components/ScoreEntry/FoursomePlayerTabs";
import type { Player } from "../types";
import { scoringGolferToPlayer } from "../utils/scoringGolfer";
import {
  emptyDetailedScore,
  isDetailedScore,
  isHolePlayed,
  type DetailedHoleScore,
} from "../types";
import { useLeague } from "../store/LeagueContext";
import { useRoundSetup } from "../store/RoundSetupContext";
import { leagueNineLabel } from "../utils/player";
import { matchRoundHasStarted } from "../utils/matchScores";
import {
  matchOpponentForPlayer,
  playerGetsStrokeOnHole,
} from "../utils/matchPlay";
import { playableHoles } from "../utils/playableHoles";

const SCORE_ENTRY_MODE = "detailed" as const;

function casualRoundLabel(setup: {
  holeCount: 9 | 18;
  startHole: number;
}): string {
  if (setup.holeCount === 18) return "18 holes";
  return `9 holes · start ${setup.startHole}`;
}

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
    setDesignatedScorer,
  } = useLeague();
  const { setup, setSetup } = useRoundSetup();
  const navigate = useNavigate();

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

  const [activePlayerId, setActivePlayerId] = useState(currentPlayer.id);
  const [currentHole, setCurrentHole] = useState(0);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [missingScoreWarning, setMissingScoreWarning] = useState<
    string | null
  >(null);

  const foursomePlayers = useMemo(() => {
    if (!foursome) return [currentPlayer];
    return foursome.playerIds
      .map((id) => getPlayer(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [foursome, getPlayer, currentPlayer]);

  const casualScoringPlayers = useMemo((): Player[] => {
    if (!isCasual || !setup) return [currentPlayer];
    if (setup.scoringGolfers?.length) {
      return setup.scoringGolfers.map((g) => {
        const player = scoringGolferToPlayer(g);
        if (player.avatarUrl) return player;
        const leaguePlayer = getPlayer(g.id);
        return leaguePlayer?.avatarUrl
          ? { ...player, avatarUrl: leaguePlayer.avatarUrl }
          : player;
      });
    }
    return [currentPlayer];
  }, [isCasual, setup, currentPlayer, getPlayer]);

  const scoringPlayers = isCasual ? casualScoringPlayers : foursomePlayers;

  const leagueRoundStarted =
    !isCasual && match ? matchRoundHasStarted(match, state) : false;

  const canEditActivePlayer = isCasual
    ? true
    : foursome?.designatedScorerId === state.currentUserId ||
      !foursome?.designatedScorerId;

  const playersNeedingRounds = scoringPlayers;

  useEffect(() => {
    if (!sessionId || !course || !playingHoles.length) return;
    for (const p of playersNeedingRounds) {
      ensureRound(
        sessionId,
        p.id,
        SCORE_ENTRY_MODE,
        playingHoles.map((h) => h.par),
      );
    }
  }, [sessionId, course, playingHoles, playersNeedingRounds, ensureRound]);

  useEffect(() => {
    if (
      scoringPlayers.length &&
      !scoringPlayers.find((p) => p.id === activePlayerId)
    ) {
      setActivePlayerId(scoringPlayers[0].id);
    }
  }, [scoringPlayers, activePlayerId]);

  useEffect(() => {
    if (!missingScoreWarning || !sessionId) return;
    const complete = scoringPlayers.every((p) =>
      isHolePlayed(getRound(sessionId, p.id)?.scores[currentHole]),
    );
    if (complete) setMissingScoreWarning(null);
  }, [
    missingScoreWarning,
    sessionId,
    currentHole,
    scoringPlayers,
    getRound,
    state.rounds,
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

  const updateScore = (next: DetailedHoleScore) => {
    updateHoleScore(sessionId, activePlayerId, currentHole, () => {
      const strokes = next.strokes ?? null;
      return isDetailedScore(next)
        ? { ...next, strokes }
        : { ...emptyDetailedScore(), strokes };
    });
  };

  const claimScorer = () => {
    if (!foursome || !match) return;
    setDesignatedScorer(match.id, foursome.id, state.currentUserId);
  };

  const goToPreviousHole = () => {
    setMissingScoreWarning(null);
    setCurrentHole((h) => Math.max(0, h - 1));
  };

  const goToNextHole = () => {
    if (currentHole >= playingHoles.length - 1) return;

    if (canEditActivePlayer && scoringPlayers.length > 1) {
      const missing = scoringPlayers.filter((p) => {
        const score = getRound(sessionId, p.id)?.scores[currentHole];
        return !isHolePlayed(score);
      });
      if (missing.length > 0) {
        setActivePlayerId(missing[0].id);
        setMissingScoreWarning(
          `You forgot to add a score for ${missing[0].name}`,
        );
        return;
      }
    }

    setMissingScoreWarning(null);
    setCurrentHole((h) => Math.min(playingHoles.length - 1, h + 1));
  };

  const scoreEntryFields =
    hole && holeScore ? (
      <>
        <fieldset
          disabled={!canEditActivePlayer}
          className="w-full disabled:pointer-events-none"
        >
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
              onPrevious: goToPreviousHole,
              onNext: goToNextHole,
              canPrevious: currentHole > 0,
              canNext: currentHole < playingHoles.length - 1,
            }}
          />
        </fieldset>

        {missingScoreWarning ? (
          <p className="mt-3 text-xs leading-snug text-sand-brick">
            {missingScoreWarning}
          </p>
        ) : null}
      </>
    ) : null;

  const leagueScorerBanner =
    foursome && foursome.designatedScorerId !== state.currentUserId ? (
      <div className="mb-3 rounded-[8px] border border-sand-brick/35 bg-sand-brick/10 px-3 py-2 text-xs text-sand-brick">
        {foursome.designatedScorerId ? (
          <>
            <strong>{getPlayer(foursome.designatedScorerId)?.name}</strong> is
            entering for the group.
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
    ) : null;

  const courseHandicapForPlayer = (playerId: string) =>
    setup?.golferCourseHandicaps?.[playerId] ?? setup?.courseHandicap ?? 0;

  const scoreEntryBody =
    scoreEntryFields != null ? (
      <div className={!canEditActivePlayer ? "opacity-80" : undefined}>
        {scoreEntryFields}
      </div>
    ) : null;

  const leagueHeaderMeta = (
    <div className="mb-2 flex items-start gap-1">
      <button
        type="button"
        onClick={() => navigate("/league")}
        aria-label="Back to league"
        className="-ml-1 shrink-0 p-1 text-white"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={1} aria-hidden />
      </button>
      <div className="min-w-0 flex-1 flex flex-col items-start gap-0.5 py-0.5 text-left text-white">
        {match?.weekNumber != null ? (
          <p className="text-xs font-light uppercase tracking-wide">
            Week {match.weekNumber}
          </p>
        ) : null}
        <p className="text-lg font-semibold capitalize leading-snug">
          {course.name}
        </p>
        {match?.gameType ? (
          <p className="text-sm font-normal capitalize">
            Game: {match.gameType}
          </p>
        ) : null}
      </div>
      <CourseFavoriteStar
        courseId={course.id}
        courseName={course.name}
        className="text-white/90 hover:text-white [&_svg:not([class*='fill-'])]:stroke-white"
      />
    </div>
  );

  const leagueFooterActions = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setScorecardOpen(true)}
        className="flex-1 rounded-[8px] bg-sand-hunter py-3 text-xs font-bold tracking-wide text-white transition active:scale-[0.99]"
      >
        View Scorecard
      </button>
      <button
        type="button"
        onClick={() => navigate("/league")}
        className="flex-1 rounded-[8px] border border-sand-brick py-3 text-xs font-bold tracking-wide text-sand-brick transition active:scale-[0.99]"
      >
        Quit Round
      </button>
    </div>
  );

  const scorecardNineLabel = isCasual
    ? setup
      ? casualRoundLabel(setup)
      : ""
    : leagueNineLabel(state.league.nineSide);

  const scorecardSheet = (
    <BottomSheet
      open={scorecardOpen}
      onClose={() => setScorecardOpen(false)}
      title="Scorecard"
      tone="white"
      expanded
      contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
    >
      <LeagueScorecardTable
        courseName={course.name}
        nineLabel={scorecardNineLabel}
        holes={playingHoles}
        players={scoringPlayers}
        scoresForPlayer={(id) => getRound(sessionId, id)?.scores}
        casualStrokeNet={
          isCasual && setup?.scoringMode === "stroke"
            ? {
                holeCount: setup.holeCount,
                courseHandicapForPlayer: courseHandicapForPlayer,
              }
            : undefined
        }
        casualMatchNet={
          isCasual &&
          setup?.scoringMode === "match_net" &&
          scoringPlayers.length >= 2
        }
      />
    </BottomSheet>
  );

  const activePlayingHole = playingHoles[currentHole];

  const matchNetStrokePop = (playerId: string): boolean => {
    if (!isCasual || !setup || setup.scoringMode !== "match_net") {
      return false;
    }
    if (!activePlayingHole) return false;
    const player = scoringPlayers.find((p) => p.id === playerId);
    const opponent = matchOpponentForPlayer(playerId, scoringPlayers);
    if (!player || !opponent) return false;
    return playerGetsStrokeOnHole(player, opponent, activePlayingHole);
  };

  const casualHeaderMeta = setup ? (
    <div className="mb-1 flex w-full items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-start gap-0">
        <button
          type="button"
          onClick={() => navigate(`/scores?courseId=${course.id}`)}
          aria-label="Back to round setup"
          className="shrink-0 p-1 pl-0 text-sand-hunter"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1} aria-hidden />
        </button>
        <p className="min-w-0 flex-1 pt-0.5 text-left text-lg font-semibold capitalize leading-snug text-[#373737]">
          {course.name}
        </p>
      </div>
      <CourseFavoriteStar
        courseId={course.id}
        courseName={course.name}
        className="mt-0.5 shrink-0"
      />
    </div>
  ) : null;

  const casualFooterActions = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setScorecardOpen(true)}
        className="flex-1 rounded-[8px] bg-sand-hunter py-3 text-xs font-bold tracking-wide text-white transition active:scale-[0.99]"
      >
        View Scorecard
      </button>
      <button
        type="button"
        onClick={() => {
          setSetup(null);
          navigate("/scores");
        }}
        className="flex-1 rounded-[8px] border border-sand-brick py-3 text-xs font-bold tracking-wide text-sand-brick transition active:scale-[0.99]"
      >
        Quit Round
      </button>
    </div>
  );

  const immersiveHeader = isCasual ? casualHeaderMeta : leagueHeaderMeta;
  const immersiveFooter = isCasual ? casualFooterActions : leagueFooterActions;
  const headerBandClassName = isCasual
    ? "bg-sand-score-mist -mt-2 pb-0 pt-0"
    : "bg-sand-sage";
  const tabVariant = isCasual ? "onScoreMist" : "onSage";
  const casualPaddingX = "px-4";

  const scrollContent = (
    <>
      {!isCasual ? leagueScorerBanner : null}
      {scoreEntryBody}
    </>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <FoursomeScoringWithTabs
        layout="league"
        headerBandClassName={headerBandClassName}
        tabVariant={tabVariant}
        players={scoringPlayers}
        activePlayerId={activePlayerId}
        onSelect={setActivePlayerId}
        leagueHeader={immersiveHeader}
        footer={immersiveFooter}
        strokePopForPlayer={
          isCasual && setup?.scoringMode === "match_net"
            ? matchNetStrokePop
            : undefined
        }
        contentPaddingX={isCasual ? casualPaddingX : "px-8"}
      >
        {scrollContent}
      </FoursomeScoringWithTabs>
      {scorecardSheet}
    </div>
  );
}
