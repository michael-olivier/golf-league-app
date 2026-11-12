import type {
  Course,
  Hole,
  HoleScore,
  League,
  LeagueState,
  Player,
  WeeklyMatch,
} from "../types";
import { grossAndNetTotals } from "./casualScoring";
import { playingCourseHandicap } from "./handicap";
import {
  computeHeadToHeadMatch,
  foursomeMatchPairs,
} from "./matchPlay";
import { teamBestBallTotals } from "./bestBall";
import { scoresForMatchPlayer } from "./matchScorecard";

export type LeagueScoringFormat = "stroke" | "match";

export function leagueScoringFormat(gameType?: string): LeagueScoringFormat {
  const g = (gameType ?? "").toLowerCase();
  if (g.includes("match") && !g.includes("stroke")) return "match";
  return "stroke";
}

export interface PlayerNetLine {
  playerId: string;
  gross: number;
  courseHandicap: number;
  adjustment: number;
  net: number;
}

export interface PairingPointLine {
  playerAId: string;
  playerBId: string;
  homeTeamId: string;
  awayTeamId: string;
  homePoints: number;
  awayPoints: number;
  summary: string;
  stroke?: {
    lineA: PlayerNetLine;
    lineB: PlayerNetLine;
  };
  match?: {
    holesWonA: number;
    holesWonB: number;
    status: string;
  };
}

export type LeagueMatchStyle = "standard" | "best_ball_all_or_nothing";

export interface LeagueMatchPointsResult {
  format: LeagueScoringFormat;
  matchStyle?: LeagueMatchStyle;
  homeTeamId: string;
  awayTeamId: string;
  homePoints: number;
  awayPoints: number;
  pairings: PairingPointLine[];
  teamPoint: {
    homePoints: number;
    awayPoints: number;
    homeTeamNet: number;
    awayTeamNet: number;
    summary: string;
  };
}

export function isBestBallAllOrNothingResult(
  result: LeagueMatchPointsResult,
): boolean {
  return result.matchStyle === "best_ball_all_or_nothing";
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

function splitPoint(
  compare: number,
): { home: number; away: number } {
  if (compare < 0) return { home: 1, away: 0 };
  if (compare > 0) return { home: 0, away: 1 };
  return { home: 0, away: 0 };
}

export function playerNetLine(
  player: Player,
  scores: HoleScore[] | undefined,
  holes: Hole[],
  course: Course,
  league: League,
): PlayerNetLine | null {
  if (!scores) return null;
  const holeCount = league.holesPerRound === 9 ? 9 : 18;
  const ch = playingCourseHandicap(
    player.handicapIndex,
    course,
    holeCount,
    league.defaultTeeBoxId,
  );
  const { gross, net } = grossAndNetTotals(
    scores,
    holes,
    ch,
    holeCount,
  );
  if (gross == null || net == null) return null;
  return {
    playerId: player.id,
    gross,
    courseHandicap: ch,
    adjustment: gross - net,
    net,
  };
}

export function formatLeaguePoint(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n % 1 === 0.5) {
    const whole = Math.floor(n);
    return whole === 0 ? "½" : `${whole}½`;
  }
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, "");
}

export function formatLeaguePointsTotal(home: number, away: number): string {
  return `${formatLeaguePoint(home)}–${formatLeaguePoint(away)}`;
}

export function computeBestBallMatchPoints(
  match: WeeklyMatch,
  holes: Hole[],
  rounds: LeagueState["rounds"],
): LeagueMatchPointsResult | null {
  const ids = match.foursomes[0]?.playerIds;
  if (!ids || ids.length < 4) return null;

  const homePartnerScores = [
    scoresForMatchPlayer(rounds, match.id, ids[0]),
    scoresForMatchPlayer(rounds, match.id, ids[1]),
  ];
  const awayPartnerScores = [
    scoresForMatchPlayer(rounds, match.id, ids[2]),
    scoresForMatchPlayer(rounds, match.id, ids[3]),
  ];

  const homeTotal = teamBestBallTotals(homePartnerScores, holes).total;
  const awayTotal = teamBestBallTotals(awayPartnerScores, holes).total;
  if (homeTotal == null || awayTotal == null) return null;

  const homeTeamId = match.teamPairing.homeTeamId;
  const awayTeamId = match.teamPairing.awayTeamId;

  let homePoints = 0;
  let awayPoints = 0;
  let summary: string;

  if (homeTotal < awayTotal) {
    homePoints = 3;
    summary = `Home best ball ${homeTotal} beats away ${awayTotal} — 3 points`;
  } else if (awayTotal < homeTotal) {
    awayPoints = 3;
    summary = `Away best ball ${awayTotal} beats home ${homeTotal} — 3 points`;
  } else {
    summary = `Team best ball tied at ${homeTotal} — no points awarded`;
  }

  return {
    format: "stroke",
    matchStyle: "best_ball_all_or_nothing",
    homeTeamId,
    awayTeamId,
    homePoints,
    awayPoints,
    pairings: [],
    teamPoint: {
      homePoints,
      awayPoints,
      homeTeamNet: homeTotal,
      awayTeamNet: awayTotal,
      summary,
    },
  };
}

export function computeLeagueMatchPoints(
  match: WeeklyMatch,
  players: Player[],
  holes: Hole[],
  course: Course,
  league: League,
  rounds: LeagueState["rounds"],
): LeagueMatchPointsResult | null {
  const scorecardPlayers = match.foursomes[0]?.playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
  if (!scorecardPlayers?.length) return null;

  const byId = new Map(scorecardPlayers.map((p) => [p.id, p]));
  const format = leagueScoringFormat(match.gameType);
  const homeTeamId = match.teamPairing.homeTeamId;
  const awayTeamId = match.teamPairing.awayTeamId;

  const pairings: PairingPointLine[] = [];
  let homePoints = 0;
  let awayPoints = 0;

  for (const [idA, idB] of foursomeMatchPairs(
    scorecardPlayers.map((p) => p.id),
  )) {
    const playerA = byId.get(idA);
    const playerB = byId.get(idB);
    if (!playerA || !playerB) continue;

    const scoresA = scoresForMatchPlayer(rounds, match.id, idA);
    const scoresB = scoresForMatchPlayer(rounds, match.id, idB);
    if (!scoresA || !scoresB) continue;

    const aIsHome = playerA.teamId === homeTeamId;

    if (format === "stroke") {
      const lineA = playerNetLine(playerA, scoresA, holes, course, league);
      const lineB = playerNetLine(playerB, scoresB, holes, course, league);
      if (!lineA || !lineB) continue;

      const homeNet = aIsHome ? lineA.net : lineB.net;
      const awayNet = aIsHome ? lineB.net : lineA.net;
      const split = splitPoint(homeNet - awayNet);
      homePoints += split.home;
      awayPoints += split.away;

      const homePlayer = aIsHome ? playerA : playerB;
      const awayPlayer = aIsHome ? playerB : playerA;

      let summary: string;
      if (split.home === 0 && split.away === 0) {
        summary = `${firstName(homePlayer.name)} and ${firstName(awayPlayer.name)} tied net (${homeNet}) — no point awarded`;
      } else if (split.home === 1) {
        summary = `${firstName(homePlayer.name)} ${homeNet} net beats ${firstName(awayPlayer.name)} ${awayNet} net`;
      } else {
        summary = `${firstName(awayPlayer.name)} ${awayNet} net beats ${firstName(homePlayer.name)} ${homeNet} net`;
      }

      pairings.push({
        playerAId: idA,
        playerBId: idB,
        homeTeamId,
        awayTeamId,
        homePoints: split.home,
        awayPoints: split.away,
        summary,
        stroke: { lineA, lineB },
      });
    } else {
      const result = computeHeadToHeadMatch(
        playerA,
        playerB,
        holes,
        scoresA,
        scoresB,
        { applyHandicapStrokes: true },
      );

      const aWon = result.holesWonA;
      const bWon = result.holesWonB;
      const homeWon = aIsHome ? aWon : bWon;
      const awayWon = aIsHome ? bWon : aWon;
      const split = splitPoint(awayWon - homeWon);
      homePoints += split.home;
      awayPoints += split.away;

      const homePlayer = aIsHome ? playerA : playerB;
      const awayPlayer = aIsHome ? playerB : playerA;

      let summary: string;
      if (split.home === 0 && split.away === 0) {
        summary = `${firstName(homePlayer.name)} and ${firstName(awayPlayer.name)} halved (${homeWon}–${awayWon} holes) — no point awarded`;
      } else if (split.home === 1) {
        summary = `${result.matchStatus} — ${firstName(homePlayer.name)} wins the point`;
      } else {
        summary = `${result.matchStatus} — ${firstName(awayPlayer.name)} wins the point`;
      }

      pairings.push({
        playerAId: idA,
        playerBId: idB,
        homeTeamId,
        awayTeamId,
        homePoints: split.home,
        awayPoints: split.away,
        summary,
        match: {
          holesWonA: aWon,
          holesWonB: bWon,
          status: result.matchStatus,
        },
      });
    }
  }

  const homePlayers = scorecardPlayers.filter((p) => p.teamId === homeTeamId);
  const awayPlayers = scorecardPlayers.filter((p) => p.teamId === awayTeamId);

  let homeTeamNet = 0;
  let awayTeamNet = 0;
  let teamTotalsReady = true;

  for (const p of homePlayers) {
    const scores = scoresForMatchPlayer(rounds, match.id, p.id);
    const line = playerNetLine(p, scores, holes, course, league);
    if (!line) {
      teamTotalsReady = false;
      break;
    }
    homeTeamNet += line.net;
  }
  for (const p of awayPlayers) {
    const scores = scoresForMatchPlayer(rounds, match.id, p.id);
    const line = playerNetLine(p, scores, holes, course, league);
    if (!line) {
      teamTotalsReady = false;
      break;
    }
    awayTeamNet += line.net;
  }

  if (!teamTotalsReady || pairings.length === 0) return null;

  const teamSplit = splitPoint(homeTeamNet - awayTeamNet);
  homePoints += teamSplit.home;
  awayPoints += teamSplit.away;

  let teamSummary: string;
  if (teamSplit.home === 0 && teamSplit.away === 0) {
    teamSummary = `Team nets tied at ${homeTeamNet} — no team point awarded`;
  } else if (teamSplit.home === 1) {
    teamSummary = `Home ${homeTeamNet} net vs away ${awayTeamNet} net`;
  } else {
    teamSummary = `Away ${awayTeamNet} net vs home ${homeTeamNet} net`;
  }

  return {
    format,
    homeTeamId,
    awayTeamId,
    homePoints,
    awayPoints,
    pairings,
    teamPoint: {
      homePoints: teamSplit.home,
      awayPoints: teamSplit.away,
      homeTeamNet,
      awayTeamNet,
      summary: teamSummary,
    },
  };
}

export function viewerLeaguePointsDisplay(
  result: LeagueMatchPointsResult,
  viewerTeamId: string,
): string {
  const isHome = viewerTeamId === result.homeTeamId;
  const ours = isHome ? result.homePoints : result.awayPoints;
  const theirs = isHome ? result.awayPoints : result.homePoints;
  return formatLeaguePointsTotal(ours, theirs);
}

export function viewerLeagueOutcome(
  result: LeagueMatchPointsResult,
  viewerTeamId: string,
): "won" | "lost" | "tied" {
  const isHome = viewerTeamId === result.homeTeamId;
  const ours = isHome ? result.homePoints : result.awayPoints;
  const theirs = isHome ? result.awayPoints : result.homePoints;
  if (ours > theirs) return "won";
  if (ours < theirs) return "lost";
  return "tied";
}
