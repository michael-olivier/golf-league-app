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
import { leagueScoringFormat } from "../../utils/leaguePoints";
import { matchOpponentForPlayer } from "../../utils/matchPlay";
import { isHolePlayed } from "../../types";
import { matchFoursomeRosterHasData } from "./MatchFoursomeRoster";
import { LeagueNetScoringCard } from "./LeagueNetScoringCard";
import { LeagueFinalScoresCard } from "./LeagueFinalScoresCard";
import { LeagueSummarySection } from "./LeagueSummarySection";

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
  });
}

function formatSubtitle(gameType: string | undefined): string {
  const g = (gameType ?? "").toLowerCase();
  if (g.includes("match") && !g.includes("stroke")) return "Match Play";
  return "Stroke Play";
}

function displayPoints(points: string | null): string {
  if (points == null) return "—";
  return points.replace(/\u2013/g, "-");
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
  const formatLabel = formatSubtitle(match.gameType);
  const nineLabel = leagueNineLabel(league.nineSide);
  const holes = useMemo(
    () => leagueHolesForRound(course.holes, league),
    [course.holes, league],
  );
  const scorecardPlayers = useMemo(
    () => scorecardPlayersForMatch(match, players),
    [match, players],
  );

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

  const showNetScoring = matchFoursomeRosterHasData(match, scorecardPlayers);

  const showScorecard = useMemo(
    () =>
      scorecardPlayers.some((player) => {
        const scores = scoresForPlayer(player.id);
        return scores?.some(
          (score, index) => index < holes.length && isHolePlayed(score),
        );
      }),
    [scorecardPlayers, holes, scoresForPlayer],
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
              <Share2 aria-hidden className="h-4 w-4" strokeWidth={1} />
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
        <div className="space-y-3 pb-4 pt-3">
          <header className="league-match-detail-header mt-3">
            <p className="league-match-detail-header__week">
              Week {match.weekNumber}
            </p>
            <div className="league-match-detail-header__grid">
              <p className="league-match-detail-header__course">{course.name}</p>
              {homeTeam && awayTeam ? (
                <div className="league-match-detail-header__pills">
                  <button
                    type="button"
                    onClick={() => openTeam(homeTeam.id)}
                    className="league-match-detail-header__pill max-w-[min(100%,9.5rem)] rounded-full border border-sand-hunter/40 bg-fairway-950/5 px-2.5 py-0.5 text-xs font-bold tracking-wide text-sand-hunter transition hover:border-sand-hunter hover:bg-fairway-100 active:scale-[0.98]"
                  >
                    <span className="league-match-detail-header__pill-label">
                      {homeTeam.name}
                    </span>
                  </button>
                  <span className="league-match-detail-header__vs">vs.</span>
                  <button
                    type="button"
                    onClick={() => openTeam(awayTeam.id)}
                    className="league-match-detail-header__pill max-w-[min(100%,9.5rem)] rounded-full border border-sand-hunter/40 bg-fairway-950/5 px-2.5 py-0.5 text-xs font-bold tracking-wide text-sand-hunter transition hover:border-sand-hunter hover:bg-fairway-100 active:scale-[0.98]"
                  >
                    <span className="league-match-detail-header__pill-label">
                      {awayTeam.name}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="league-match-detail-header__pills" />
              )}
              <p className="league-match-detail-header__meta">
                {formatMatchDate(match.date)}
              </p>
              <p className="league-summary-header-score league-match-detail-header__score tabular-nums text-fairway-300">
                {displayPoints(points)}
              </p>
              <p className="league-match-detail-header__meta league-match-detail-header__format">
                {formatLabel}
              </p>
            </div>
          </header>

          {showNetScoring ? (
            <LeagueNetScoringCard
              match={match}
              players={scorecardPlayers}
              viewerTeamId={viewer.teamId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              holes={holes}
              scoringFormat={scoringFormat}
            />
          ) : null}

          {pointsResult && pointsResult.pairings.length > 0 ? (
            <LeagueFinalScoresCard
              result={pointsResult}
              players={scorecardPlayers}
              viewerTeamId={viewer.teamId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              holes={holes}
              course={course}
              league={league}
              scoresForPlayer={scoresForPlayer}
            />
          ) : null}

          {showScorecard ? (
            <LeagueSummarySection title="Scorecard">
              <LeagueScorecardTable
                courseName=""
                nineLabel={nineLabel}
                hideTitle
                holes={holes}
                players={scorecardPlayers}
                scoresForPlayer={scoresForPlayer}
                summaryFormat={scoringFormat}
                course={course}
                league={league}
                decoratedScores={scoringFormat === "match"}
              />
            </LeagueSummarySection>
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
