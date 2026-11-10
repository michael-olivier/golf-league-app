import { useCallback, useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  Course,
  League,
  LeagueState,
  Player,
  Team,
  WeeklyMatch,
} from "../../types";
import { FullPageModal } from "../FullPageModal";
import {
  FullPageModalFooterRow,
  modalFooterBtnPrimary,
  modalFooterBtnSecondary,
} from "../FullPageModalFooter";
import {
  FoursomeMatchSummaries,
  foursomeSummariesHasData,
} from "../ScoreEntry/FoursomeMatchSummaries";
import { LeagueScorecardTable } from "../ScoreEntry/LeagueScorecardTable";
import { IosShareSheet } from "../share/IosShareSheet";
import {
  leagueHolesForRound,
  scorecardPlayersForMatch,
  scoresForMatchPlayer,
} from "../../utils/matchScorecard";
import { leagueNineLabel } from "../../utils/player";
import {
  leagueMatchPointsResult,
  matchPointsForViewer,
} from "../../utils/leagueMatch";
import {
  isBestBallAllOrNothingResult,
  leagueScoringFormat,
} from "../../utils/leaguePoints";
import { matchOpponentForPlayer } from "../../utils/matchPlay";
import { isHolePlayed } from "../../types";
import { isTeamBestBallGame } from "../../utils/bestBall";
import {
  MatchFoursomeRoster,
  matchFoursomeRosterHasData,
  rosterSlots,
} from "./MatchFoursomeRoster";
import {
  TeamBestBallScorecard,
  teamBestBallTableHasData,
} from "./TeamBestBallScorecard";
import { LeaguePointsBreakdown } from "./LeaguePointsBreakdown";

interface LeagueMatchDetailModalProps {
  open: boolean;
  onClose: () => void;
  match: WeeklyMatch;
  course: Course;
  league: League;
  viewer: Player;
  players: Player[];
  rounds: LeagueState["rounds"];
  getTeam: (id: string) => Team | undefined;
}

function formatMatchDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function gameTypeTitle(gameType: string | undefined, fallback: string): string {
  const raw = gameType ?? fallback;
  return raw.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function LeagueMatchDetailModal({
  open,
  onClose,
  match,
  course,
  league,
  viewer,
  players,
  rounds,
  getTeam,
}: LeagueMatchDetailModalProps) {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);

  const openTeam = (teamId: string) => {
    onClose();
    navigate("/roster", { state: { teamId } });
  };

  const homeTeam = getTeam(match.teamPairing.homeTeamId);
  const awayTeam = getTeam(match.teamPairing.awayTeamId);
  const scoringFormat = leagueScoringFormat(match.gameType);
  const pointsResult = useMemo(
    () =>
      leagueMatchPointsResult(match, players, course, league, rounds),
    [match, players, course, league, rounds],
  );
  const points = matchPointsForViewer(match, viewer.teamId, pointsResult);
  const formatLabel = gameTypeTitle(match.gameType, course.name);
  const nineLabel = leagueNineLabel(league.nineSide);
  const holes = useMemo(
    () => leagueHolesForRound(course.holes, league),
    [course.holes, league],
  );
  const scorecardPlayers = useMemo(
    () => scorecardPlayersForMatch(match, players),
    [match, players],
  );
  const isBestBall = isTeamBestBallGame(match.gameType);

  const shareTitle = useMemo(() => {
    const opponent = matchOpponentForPlayer(viewer.id, scorecardPlayers);
    const vs = opponent?.name.split(/\s+/)[0] ?? "League match";
    return `Week ${match.weekNumber}: ${points ?? "—"} vs ${vs}`;
  }, [match.weekNumber, points, scorecardPlayers, viewer.id]);

  useEffect(() => {
    if (!open) setShareOpen(false);
  }, [open]);

  const scoresForPlayer = useCallback(
    (playerId: string) => scoresForMatchPlayer(rounds, match.id, playerId),
    [rounds, match.id],
  );

  const foursomeSummaryProps = useMemo(
    () => ({
      players: scorecardPlayers,
      holes,
      scoresForPlayer,
      applyHandicapStrokes: scoringFormat === "match",
      scoringFormat,
      course,
      league,
    }),
    [scorecardPlayers, holes, scoresForPlayer, scoringFormat, course, league],
  );

  const roster = useMemo(
    () =>
      rosterSlots(
        match,
        scorecardPlayers,
        match.teamPairing.homeTeamId,
        match.teamPairing.awayTeamId,
      ),
    [match, scorecardPlayers],
  );

  const homePartnerScores = useMemo(
    () =>
      [roster.homeA?.id, roster.homeB?.id]
        .filter((id): id is string => !!id)
        .map((id) => scoresForPlayer(id)),
    [roster.homeA?.id, roster.homeB?.id, scoresForPlayer],
  );

  const awayPartnerScores = useMemo(
    () =>
      [roster.awayA?.id, roster.awayB?.id]
        .filter((id): id is string => !!id)
        .map((id) => scoresForPlayer(id)),
    [roster.awayA?.id, roster.awayB?.id, scoresForPlayer],
  );

  const showPairingSummaries =
    !isBestBall && foursomeSummariesHasData(foursomeSummaryProps);

  const showHeadToHead = useMemo(() => {
    if (scoringFormat === "stroke") return false;
    return (
      matchFoursomeRosterHasData(match, scorecardPlayers) || showPairingSummaries
    );
  }, [scoringFormat, match, scorecardPlayers, showPairingSummaries]);

  const showIndividualScorecard = useMemo(
    () =>
      !isBestBall &&
      scorecardPlayers.some((player) => {
        const scores = scoresForPlayer(player.id);
        return scores?.some(
          (score, index) => index < holes.length && isHolePlayed(score),
        );
      }),
    [isBestBall, scorecardPlayers, holes, scoresForPlayer],
  );

  const showBestBallScorecard = useMemo(
    () =>
      isBestBall &&
      teamBestBallTableHasData(holes, homePartnerScores, awayPartnerScores),
    [isBestBall, holes, homePartnerScores, awayPartnerScores],
  );

  return (
    <>
      <FullPageModal
        open={open}
        onClose={onClose}
        footer={(requestClose) => (
          <FullPageModalFooterRow>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className={modalFooterBtnSecondary}
            >
              <Share2 aria-hidden className="h-4 w-4" strokeWidth={0.5} />
              SHARE
            </button>
            <button
              type="button"
              onClick={requestClose}
              className={modalFooterBtnPrimary}
            >
              DONE
            </button>
          </FullPageModalFooterRow>
        )}
      >
        <div className="space-y-4 pb-4 pt-3">
          <header className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-bold text-sand-hunter">{`Week ${match.weekNumber}:`}</p>
              {homeTeam && awayTeam ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <button
                    type="button"
                    onClick={() => openTeam(homeTeam.id)}
                    className="rounded-full border border-sand-hunter/40 bg-fairway-950/5 px-2.5 py-0.5 text-xs font-bold tracking-wide text-sand-hunter transition hover:border-sand-hunter hover:bg-fairway-100 active:scale-[0.98]"
                  >
                    {homeTeam.name}
                  </button>
                  <span className="text-xs font-bold text-fairway-400">vs.</span>
                  <button
                    type="button"
                    onClick={() => openTeam(awayTeam.id)}
                    className="rounded-full border border-sand-hunter/40 bg-fairway-950/5 px-2.5 py-0.5 text-xs font-bold tracking-wide text-sand-hunter transition hover:border-sand-hunter hover:bg-fairway-100 active:scale-[0.98]"
                  >
                    {awayTeam.name}
                  </button>
                </div>
              ) : null}
              <p className="text-xs text-fairway-500">
                {formatMatchDate(match.date)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold leading-none tabular-nums text-fairway-300">
                {points ?? "—"}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-fairway-300">
                {formatLabel}
              </p>
            </div>
          </header>

          {pointsResult &&
          (pointsResult.pairings.length > 0 ||
            isBestBallAllOrNothingResult(pointsResult)) ? (
            <LeaguePointsBreakdown
              result={pointsResult}
              players={scorecardPlayers}
              getTeam={getTeam}
            />
          ) : null}

          {showHeadToHead ? (
            <section className="rounded-[8px] border border-sand-hunter bg-white p-3">
              <p className="card-title mb-3">Head-to-head</p>
              <MatchFoursomeRoster
                match={match}
                players={scorecardPlayers}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                dividerBelow={showPairingSummaries}
              />
              <FoursomeMatchSummaries {...foursomeSummaryProps} />
            </section>
          ) : null}

          {showBestBallScorecard ? (
            <section className="rounded-[8px] border border-sand-hunter bg-white p-3">
              <p className="card-title mb-3">Match scorecard</p>
              <p className="mb-2 text-[10px] leading-snug text-fairway-500">
                Team best ball — one team score per hole (no handicap strokes).
              </p>
              <TeamBestBallScorecard
                holes={holes}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                homePartnerScores={homePartnerScores}
                awayPartnerScores={awayPartnerScores}
              />
            </section>
          ) : null}

          {showIndividualScorecard ? (
            <section className="rounded-[8px] border border-sand-hunter bg-white p-3">
              <p className="card-title mb-3">Match scorecard</p>
              <p className="mb-2 text-[10px] leading-snug text-fairway-500">
                {scoringFormat === "stroke"
                  ? "Gross strokes by hole — net totals are in League points."
                  : "Green dot marks a stroke hole (pop) on net match play."}
              </p>
              <LeagueScorecardTable
                courseName=""
                nineLabel={nineLabel}
                hideTitle
                casualMatchNet={scoringFormat === "match"}
                holes={holes}
                players={scorecardPlayers}
                scoresForPlayer={scoresForPlayer}
              />
            </section>
          ) : null}
        </div>
      </FullPageModal>
      <IosShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={shareTitle}
      />
    </>
  );
}
