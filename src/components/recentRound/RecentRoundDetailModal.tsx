import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import type {
  Course,
  League,
  Player,
  PlayerRecentRound,
} from "../../types";
import { FullPageModal } from "../FullPageModal";
import {
  FullPageModalFooterRow,
  modalFooterBtnPrimary,
  modalFooterBtnSecondary,
} from "../FullPageModalFooter";
import { IosShareSheet } from "../share/IosShareSheet";
import { LeagueScorecardTable } from "../ScoreEntry/LeagueScorecardTable";
import { distributionFromScores } from "../../utils/scoreDistribution";
import { buildSimpleRound } from "../../utils/matchScorecard";
import { playableHoles } from "../../utils/playableHoles";
import { leagueNineLabel } from "../../utils/player";
import { ScoreDistributionChart } from "./ScoreDistributionChart";

interface RecentRoundDetailModalProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  course: Course;
  recent: PlayerRecentRound;
  league: League;
}

function toParDisplay(toPar: number): { text: string; className: string } {
  if (toPar > 0) {
    return { text: `+${toPar}`, className: "text-sand-brick" };
  }
  if (toPar < 0) {
    return { text: `${toPar}`, className: "text-sand-hunter" };
  }
  return { text: "-", className: "text-fairway-500" };
}

function formatRoundDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AdvancedStatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="touch-pan-y flex h-full flex-col rounded-[8px] border border-sand-hunter bg-white p-3">
      <p className="card-title min-h-[2.75rem] shrink-0 leading-snug">{title}</p>
      <div className="mt-2 flex flex-1 flex-col justify-end text-sm text-fairway-300">
        {children}
      </div>
    </div>
  );
}

export function RecentRoundDetailModal({
  open,
  onClose,
  player,
  course,
  recent,
  league,
}: RecentRoundDetailModalProps) {
  const nineSide = recent.nineSide ?? league.nineSide;
  const startHole = nineSide === "back" ? 10 : 1;
  const tee =
    course.tees.find((t) => t.id === (recent.teeBoxId ?? league.defaultTeeBoxId)) ??
    course.tees[0];

  const holeScores = recent.holeScores ?? [];

  const scoreHoles = useMemo(
    () =>
      recent.holeCount === 18
        ? playableHoles(course.holes, 18, startHole)
        : playableHoles(course.holes, 9, startHole),
    [course.holes, recent.holeCount, startHole],
  );

  const frontNineHoles = scoreHoles.slice(0, 9);
  const backNineHoles = scoreHoles.slice(9, 18);

  const parTotal = scoreHoles.reduce((s, h) => s + h.par, 0);
  const adjustedGross = recent.adjustedGrossScore ?? recent.strokes;
  const toPar = adjustedGross - parTotal;
  const differential =
    recent.scoreDifferential ??
    null;

  const distribution = useMemo(() => {
    if (recent.distribution) return recent.distribution;
    if (holeScores.length > 0) {
      return distributionFromScores(holeScores, scoreHoles);
    }
    return {
      birdiesOrBetter: 0,
      pars: 0,
      bogeys: 0,
      doubleBogeys: 0,
      tripleOrWorse: 0,
    };
  }, [recent.distribution, holeScores, scoreHoles]);

  const playerRound = useMemo(
    () => buildSimpleRound(player.id, holeScores),
    [player.id, holeScores],
  );

  const postingTag =
    recent.scorePostingSide === "home"
      ? "HOME"
      : recent.scorePostingSide === "away"
        ? "AWAY"
        : null;

  const nineLabel =
    nineSide === "back" ? "Back 9" : "Front 9";
  const displayCourseRating = tee
    ? recent.holeCount === 9
      ? (tee.courseRating / 2).toFixed(1)
      : tee.courseRating.toFixed(1)
    : null;

  const stats = recent.advancedStats;
  const toParLine = toParDisplay(toPar);
  const [shareOpen, setShareOpen] = useState(false);
  const shareTitle = `${adjustedGross} at ${course.name}`;

  useEffect(() => {
    if (!open) setShareOpen(false);
  }, [open]);

  return (
  <>
    <FullPageModal
      open={open}
      onClose={onClose}
      contentTopInsetPx={60}
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
      <div className="space-y-4 pb-4">
        <header className="recent-round-header flex items-end justify-between gap-6">
          <div>
            <p className="recent-round-header__gross tabular-nums text-fairway-300">
              {adjustedGross}
            </p>
            <p className="recent-round-header__stat-label mt-1">
              Adjusted
              <br />
              Gross score
            </p>
          </div>
          <div className="flex shrink-0 items-end gap-8">
            <div className="recent-round-header__to-par text-right">
              <p
                className={`recent-round-header__to-par-value tabular-nums ${toParLine.className}`}
              >
                {toParLine.text}
              </p>
              <p className="recent-round-header__stat-label mt-1">
                To par
                <br aria-hidden />
                <span aria-hidden="true">&nbsp;</span>
              </p>
            </div>
            {differential != null ? (
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-fairway-300">
                  {differential.toFixed(1)}
                </p>
                <p className="recent-round-header__stat-label mt-1">
                  Differential
                </p>
              </div>
            ) : null}
          </div>
        </header>

        <section className="touch-pan-y rounded-[8px] border border-sand-hunter bg-white p-4 shadow-[0_2px_12px_rgb(0_0_0_/0.06)]">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 text-xs text-fairway-500">
              {formatRoundDate(recent.playedOn)}
            </span>
            {postingTag ? (
              <span className="shrink-0 rounded-full border border-sand-hunter/40 bg-fairway-950/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-sand-hunter">
                {postingTag}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-base font-medium leading-snug text-fairway-300">
            {course.name}
          </p>
          <div
            className="mt-3 border-t border-sand-hunter/[0.65]"
            role="separator"
          />
          <div className="mt-3 flex items-stretch">
            <div className="min-w-0 flex-1 text-sm text-fairway-500">
              {tee ? (
                <>
                  <p className="font-medium text-fairway-300">
                    {tee.name} – {nineLabel}
                  </p>
                  <p className="mt-1 tabular-nums">
                    {tee.yardage.toLocaleString()} yds
                  </p>
                </>
              ) : (
                <p>{nineLabel}</p>
              )}
            </div>
            <div
              className="mx-3 w-px shrink-0 self-stretch bg-sand-hunter/[0.65]"
              role="separator"
              aria-orientation="vertical"
            />
            <div className="w-[4.75rem] shrink-0 text-right text-xs text-fairway-500">
              <p className="tabular-nums leading-snug">{recent.holeCount} holes</p>
              {tee && displayCourseRating ? (
                <p className="mt-1 tabular-nums leading-snug">
                  {displayCourseRating} / {tee.slopeRating}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="touch-pan-y rounded-[8px] border border-sand-hunter bg-white p-3">
          <p className="card-title mb-3">Scorecard</p>
          <div className={recent.holeCount === 18 ? "space-y-6" : undefined}>
            {recent.holeCount === 18 ? (
              <>
                <LeagueScorecardTable
                  courseName=""
                  nineLabel="Front 9"
                  hideTitle
                  decoratedScores
                  holes={frontNineHoles}
                  players={[player]}
                  scoresForPlayer={() =>
                    playerRound.scores.slice(0, 9)
                  }
                />
                <LeagueScorecardTable
                  courseName=""
                  nineLabel="Back 9"
                  hideTitle
                  decoratedScores
                  holes={backNineHoles}
                  players={[player]}
                  scoresForPlayer={() => playerRound.scores.slice(9, 18)}
                />
              </>
            ) : (
              <LeagueScorecardTable
                courseName=""
                nineLabel={leagueNineLabel(nineSide)}
                hideTitle
                decoratedScores
                holes={scoreHoles}
                players={[player]}
                scoresForPlayer={() => playerRound.scores}
              />
            )}
          </div>
        </section>

        <ScoreDistributionChart distribution={distribution} />

        {stats ? (
          <section>
            <p className="card-title mb-3 px-0.5">Advanced stats</p>
            <div className="grid items-stretch gap-3 sm:grid-cols-3">
              <AdvancedStatCard title="Driving accuracy">
                <p className="text-lg font-semibold tabular-nums text-fairway-300">
                  {Math.round(
                    (stats.fairwaysHit / stats.fairwaysPossible) * 100,
                  )}
                  %
                </p>
                <p className="mt-1 text-xs text-fairway-500">
                  {stats.fairwaysHit}/{stats.fairwaysPossible} fairways
                </p>
              </AdvancedStatCard>
              <AdvancedStatCard title="Greens in regulation">
                <p className="text-lg font-semibold tabular-nums text-fairway-300">
                  {Math.round((stats.greensHit / stats.greensPossible) * 100)}%
                </p>
                <p className="mt-1 text-xs text-fairway-500">
                  {stats.greensHit}/{stats.greensPossible} greens
                </p>
              </AdvancedStatCard>
              <AdvancedStatCard title="Putts">
                <p className="text-lg font-semibold tabular-nums text-fairway-300">
                  {stats.putts}
                </p>
                <p className="mt-1 text-xs text-fairway-500">Total putts</p>
              </AdvancedStatCard>
            </div>
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
