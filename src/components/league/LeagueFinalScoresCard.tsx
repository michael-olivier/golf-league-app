import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Course, Hole, HoleScore, League, Player, Team } from "../../types";
import type { LeagueMatchPointsResult } from "../../utils/leaguePoints";
import { formatLeaguePoint, playerNetLine } from "../../utils/leaguePoints";
import { LeagueStackedTeamName } from "./leagueTeamStack";
import { LeagueSummarySection } from "./LeagueSummarySection";

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

function PointBadge({
  leftPoints,
  rightPoints,
}: {
  leftPoints: number;
  rightPoints: number;
}) {
  if (leftPoints === rightPoints) {
    return (
      <span className="league-final-scores-player tabular-nums text-fairway-500">
        -
      </span>
    );
  }
  const winner = leftPoints > rightPoints ? "left" : "right";
  const points = winner === "left" ? leftPoints : rightPoints;
  const Arrow = winner === "left" ? ArrowLeft : ArrowRight;
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-fairway-400">
      <Arrow aria-hidden className="h-3 w-3 shrink-0" strokeWidth={1} />
      {formatLeaguePoint(points)} point{points === 1 ? "" : "s"}
    </span>
  );
}

interface LeagueFinalScoresCardProps {
  result: LeagueMatchPointsResult;
  players: Player[];
  viewerTeamId: string;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  holes: Hole[];
  course: Course;
  league: League;
  scoresForPlayer: (playerId: string) => HoleScore[] | undefined;
  embedded?: boolean;
}

export function LeagueFinalScoresCard({
  result,
  players,
  viewerTeamId,
  homeTeam,
  awayTeam,
  holes,
  course,
  league,
  scoresForPlayer,
  embedded = false,
}: LeagueFinalScoresCardProps) {
  const viewerIsHome = viewerTeamId === result.homeTeamId;
  const leftTeam = viewerIsHome ? homeTeam : awayTeam;
  const rightTeam = viewerIsHome ? awayTeam : homeTeam;
  const leftTeamId = viewerIsHome ? result.homeTeamId : result.awayTeamId;
  const rightTeamId = viewerIsHome ? result.awayTeamId : result.homeTeamId;

  const byId = new Map(players.map((p) => [p.id, p]));

  const teamLeftPts = viewerIsHome
    ? result.teamPoint.homePoints
    : result.teamPoint.awayPoints;
  const teamRightPts = viewerIsHome
    ? result.teamPoint.awayPoints
    : result.teamPoint.homePoints;

  let teamLeftSuffix: string | undefined;
  let teamRightSuffix: string | undefined;

  if (result.format === "stroke") {
    let leftGross = 0;
    let rightGross = 0;
    for (const p of players) {
      const line = playerNetLine(
        p,
        scoresForPlayer(p.id),
        holes,
        course,
        league,
      );
      if (!line) continue;
      if (p.teamId === leftTeamId) leftGross += line.gross;
      else if (p.teamId === rightTeamId) rightGross += line.gross;
    }
    teamLeftSuffix = `${leftGross} strokes`;
    teamRightSuffix = `${rightGross} strokes`;
  } else {
    let leftHoles = 0;
    let rightHoles = 0;
    for (const line of result.pairings) {
      const a = byId.get(line.playerAId);
      if (!a) continue;
      const aIsLeft = a.teamId === leftTeamId;
      if (!line.match) continue;
      if (aIsLeft) {
        leftHoles += line.match.holesWonA;
        rightHoles += line.match.holesWonB;
      } else {
        leftHoles += line.match.holesWonB;
        rightHoles += line.match.holesWonA;
      }
    }
    teamLeftSuffix = `${leftHoles} hole${leftHoles === 1 ? "" : "s"}`;
    teamRightSuffix = `${rightHoles} hole${rightHoles === 1 ? "" : "s"}`;
  }

  const body = (
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <LeagueStackedTeamName
            name={leftTeam?.name ?? "Team"}
            suffix={teamLeftSuffix}
            align="left"
          />
          <PointBadge leftPoints={teamLeftPts} rightPoints={teamRightPts} />
          <LeagueStackedTeamName
            name={rightTeam?.name ?? "Team"}
            suffix={teamRightSuffix}
            align="right"
          />
        </div>

        {result.pairings.map((line) => {
          const playerA = byId.get(line.playerAId);
          const playerB = byId.get(line.playerBId);
          if (!playerA || !playerB) return null;

          const leftPlayer = playerA.teamId === leftTeamId ? playerA : playerB;
          const rightPlayer =
            leftPlayer.id === playerA.id ? playerB : playerA;
          const leftPts =
            playerA.teamId === leftTeamId ? line.homePoints : line.awayPoints;
          const rightPts =
            playerA.teamId === leftTeamId ? line.awayPoints : line.homePoints;
          const displayLeftPts = leftPlayer.id === playerA.id ? leftPts : rightPts;
          const displayRightPts = leftPlayer.id === playerA.id ? rightPts : leftPts;

          let leftDetail: string;
          let rightDetail: string;

          if (result.format === "stroke" && line.stroke) {
            const lineLeft =
              leftPlayer.id === playerA.id ? line.stroke.lineA : line.stroke.lineB;
            const lineRight =
              leftPlayer.id === playerA.id ? line.stroke.lineB : line.stroke.lineA;
            leftDetail = `${firstName(leftPlayer.name)} – ${lineLeft.net}`;
            rightDetail = `${firstName(rightPlayer.name)} – ${lineRight.net}`;
          } else if (line.match) {
            const holesLeft =
              leftPlayer.id === playerA.id
                ? line.match.holesWonA
                : line.match.holesWonB;
            const holesRight =
              leftPlayer.id === playerA.id
                ? line.match.holesWonB
                : line.match.holesWonA;
            leftDetail = `${firstName(leftPlayer.name)} – ${holesLeft} holes`;
            rightDetail = `${firstName(rightPlayer.name)} – ${holesRight} holes`;
          } else {
            leftDetail = firstName(leftPlayer.name);
            rightDetail = firstName(rightPlayer.name);
          }

          return (
            <div
              key={`${line.playerAId}-${line.playerBId}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              <span className="league-final-scores-player truncate">
                {leftDetail}
              </span>
              <PointBadge
                leftPoints={displayLeftPts}
                rightPoints={displayRightPts}
              />
              <span className="league-final-scores-player truncate text-right">
                {rightDetail}
              </span>
            </div>
          );
        })}
      </div>
  );

  if (embedded) return body;

  return (
    <LeagueSummarySection title="Final scores">{body}</LeagueSummarySection>
  );
}
