import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Course, League, Player, PlayerRecentRound } from "../../types";
import {
  homeAverageToPar,
  homeScoringAverage18,
  roundGrossToPar,
} from "../../utils/homeScoringStats";
import { formatToPar } from "../../utils/scorecard";
import { HomePassExpandable } from "./HomePassExpandable";
import { ScoringTrendChart } from "./ScoringTrendChart";
import { useHomeCardContentReveal } from "./useHomeCardContentReveal";

function formatVsParAverage(v: number): string {
  const rounded = Math.round(v * 10) / 10;
  if (rounded === 0) return "E";
  return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded.toFixed(1);
}

function formatCardDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface HomeScoringAverageCardProps {
  player: Player;
  league: League;
  recentRounds: PlayerRecentRound[];
  getCourse: (id: string) => Course | undefined;
  onOpenRound: (round: PlayerRecentRound) => void;
  playEntrance?: boolean;
  riseIndex?: number;
}

export function HomeScoringAverageCard({
  player,
  league,
  recentRounds,
  getCourse,
  onOpenRound,
  playEntrance = false,
  riseIndex = 0,
}: HomeScoringAverageCardProps) {
  const [recentExpanded, setRecentExpanded] = useState(false);
  const contentRevealed = useHomeCardContentReveal(playEntrance, riseIndex);
  const roundsForAverage =
    player.recentRounds?.length ? player.recentRounds : recentRounds;
  const scoringAvg = homeScoringAverage18(roundsForAverage);
  const avgToPar = homeAverageToPar(
    player,
    recentRounds,
    (r) => getCourse(r.courseId),
    league,
  );
  const trendChart = player.recentScoringAverageTrend ?? [];
  const roundsToShow = (
    player.recentRounds?.length ? player.recentRounds : recentRounds
  ).slice(0, 5);

  return (
    <article className="home-pass-card home-pass-card--scoring border border-sand-hunter/25">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <p
            className={`home-pass-stat-font home-pass-hero-stat tabular-nums text-sand-hunter ${
              playEntrance
                ? contentRevealed
                  ? "home-pass-hero-stat--revealed"
                  : "home-pass-hero-stat--pending"
                : ""
            }`}
          >
            {scoringAvg != null ? scoringAvg.toFixed(1) : "—"}
          </p>
          {trendChart.length >= 2 ? (
            <ScoringTrendChart
              values={trendChart}
              className="shrink-0"
              revealed={playEntrance ? contentRevealed : true}
              animate={playEntrance}
            />
          ) : null}
        </div>
        {avgToPar != null || trendChart.length >= 2 ? (
          <div className="flex items-baseline justify-between gap-4">
            {avgToPar != null ? (
              <p className="home-pass-scoring-caption tabular-nums">
                {formatVsParAverage(avgToPar)} vs par
              </p>
            ) : (
              <span aria-hidden />
            )}
            {trendChart.length >= 2 ? (
              <p className="home-pass-scoring-caption shrink-0 text-right">
                Scoring Trend
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {trendChart.length >= 2 ? (
        <p className="home-pass-trend-message mt-4">
          Scoring trend improved by 0.3 strokes per round
        </p>
      ) : null}

      <div className="home-pass-disclosure mt-4">
        <button
          type="button"
          aria-expanded={recentExpanded}
          aria-controls="home-scoring-recent-rounds"
          onClick={() => setRecentExpanded((open) => !open)}
          className="home-pass-footer border-t border-sand-hunter/20"
        >
          <span>Recent rounds</span>
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${
              recentExpanded ? "rotate-180" : ""
            }`}
            strokeWidth={1}
          />
        </button>

        {roundsToShow.length > 0 ? (
          <HomePassExpandable
            id="home-scoring-recent-rounds"
            open={recentExpanded}
            contentClassName="home-pass-expand__content"
          >
            <ul className="home-pass-recent-list">
              {roundsToShow.map((round) => {
                const course = getCourse(round.courseId);
                const toPar =
                  course != null
                    ? roundGrossToPar(round, course, league)
                    : null;
                return (
                  <li
                    key={`${round.playedOn}-${round.courseId}-${round.nineSide ?? ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenRound(round)}
                      className="home-pass-recent-row"
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <p className="home-pass-recent-course">
                          {course?.name ?? "Round"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="home-pass-recent-date tabular-nums">
                            {formatCardDate(round.playedOn)}
                          </span>
                          <span className="home-pass-recent-holes-pill tabular-nums">
                            {round.holeCount} holes
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-baseline gap-1.5">
                        <span className="home-pass-recent-score home-pass-recent-score-col tabular-nums">
                          {round.strokes}
                        </span>
                        {toPar != null ? (
                          <span
                            className={`home-pass-recent-score home-pass-recent-score-col tabular-nums ${
                              toPar > 0 ? "home-pass-recent-topar--over" : ""
                            }`}
                          >
                            {formatToPar(toPar)}
                          </span>
                        ) : (
                          <span
                            className="home-pass-recent-score-col"
                            aria-hidden
                          />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </HomePassExpandable>
        ) : null}
      </div>
    </article>
  );
}
