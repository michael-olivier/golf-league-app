import { Pencil } from "lucide-react";
import type {
  Course,
  League,
  Player,
  PlayerRecentRound,
  PlayerRound,
  Team,
  WeeklyMatch,
} from "../../types";
import type { HomeWalletCard as HomeWalletCardModel } from "../../utils/homeWallet";
import { homeLeagueCardGradient } from "../../utils/homeLeagueCardSurface";
import {
  leagueMatchPointsResult,
  matchPointsForViewer,
  opponentTeamIdForMatch,
} from "../../utils/leagueMatch";
import { weekCardSubtitle } from "../../utils/weekDisplay";

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface HomeWalletCardProps {
  card: HomeWalletCardModel;
  viewer: Player;
  league: League;
  players: Player[];
  rounds: Record<string, PlayerRound>;
  getCourse: (id: string) => Course | undefined;
  getTeam: (id: string) => Team | undefined;
  roundDiff: (round: PlayerRecentRound) => number | null;
  onOpenRecent: (round: PlayerRecentRound) => void;
  onOpenLeaguePast: (match: WeeklyMatch) => void;
  onOpenLeagueUpcoming: () => void;
  onScoreNew: () => void;
}

export function HomeWalletCard({
  card,
  viewer,
  league,
  players,
  rounds,
  getCourse,
  getTeam,
  roundDiff,
  onOpenRecent,
  onOpenLeaguePast,
  onOpenLeagueUpcoming,
  onScoreNew,
}: HomeWalletCardProps) {
  if (card.kind === "score-new") {
    return (
      <button
        type="button"
        onClick={onScoreNew}
        className="home-wallet-card home-wallet-card--score-new border border-dashed border-sand-hunter/45"
      >
        <div className="flex flex-col items-center justify-center gap-2 py-1 text-center">
          <Pencil
            aria-hidden
            className="h-5 w-5 text-sand-hunter"
            strokeWidth={1}
          />
          <p className="text-sm font-bold tracking-wide text-sand-hunter">
            Score a new round
          </p>
        </div>
      </button>
    );
  }

  if (card.kind === "recent-round") {
    const { round } = card;
    const course = getCourse(round.courseId);
    const diff = roundDiff(round);
    return (
      <button
        type="button"
        onClick={() => onOpenRecent(round)}
        className="home-wallet-card home-wallet-card--recent border border-sand-hunter bg-white"
      >
        <p className="home-wallet-card-eyebrow">Recent round</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-end justify-between gap-3">
            <p className="min-w-0 text-base font-semibold leading-snug text-fairway-300">
              {course?.name ?? "Round"}
            </p>
            <p className="home-summary-card-score shrink-0 text-fairway-300">
              {round.strokes}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-fairway-500">
            <span>{formatLongDate(round.playedOn)}</span>
            <span className="shrink-0 text-right tabular-nums">
              {round.holeCount} holes
              {diff != null ? (
                <>
                  <span> • </span>
                  Diff {diff.toFixed(1)}
                </>
              ) : null}
            </span>
          </div>
        </div>
      </button>
    );
  }

  const { match } = card;
  const course = getCourse(match.courseId);
  const gameLabel =
    match.gameType ??
    (course ? weekCardSubtitle(league, match, course) : "League match");
  const opponentId = opponentTeamIdForMatch(match, viewer.teamId);
  const opponent = opponentId ? getTeam(opponentId) : undefined;
  const homeTeam = getTeam(match.teamPairing.homeTeamId);
  const awayTeam = getTeam(match.teamPairing.awayTeamId);
  const pointsComputed = leagueMatchPointsResult(
    match,
    players,
    course,
    league,
    rounds,
  );
  const points = matchPointsForViewer(match, viewer.teamId, pointsComputed);
  const upcoming = card.kind === "league-upcoming";

  const headline = upcoming
    ? homeTeam && awayTeam
      ? `${homeTeam.name} vs. ${awayTeam.name}`
      : "League match"
    : opponent
      ? `vs ${opponent.name}`
      : (course?.name ?? "League match");

  const onPress = upcoming ? onOpenLeagueUpcoming : () => onOpenLeaguePast(match);

  return (
    <button
      type="button"
      onClick={onPress}
      style={{ background: homeLeagueCardGradient(match.id) }}
      className={`home-wallet-card home-wallet-card--league border border-sand-hunter/60 ${
        upcoming ? "home-wallet-card--league-upcoming" : ""
      }`}
    >
      <p className="home-wallet-card-eyebrow">
        {upcoming ? "Up next" : `Week ${match.weekNumber}`}
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-end justify-between gap-3">
          <p className="min-w-0 text-base font-semibold leading-snug text-fairway-300">
            {headline}
          </p>
          {upcoming ? null : (
            <p className="home-summary-card-score shrink-0 text-fairway-300">
              {points ?? "—"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-fairway-500">
          <span>{formatLongDate(match.date)}</span>
          <span className="shrink-0 text-right tabular-nums">{gameLabel}</span>
        </div>
      </div>
    </button>
  );
}
