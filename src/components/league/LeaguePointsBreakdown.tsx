import type { Player, Team } from "../../types";
import type { LeagueMatchPointsResult } from "../../utils/leaguePoints";
import {
  formatLeaguePoint,
  isBestBallAllOrNothingResult,
} from "../../utils/leaguePoints";

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

interface LeaguePointsBreakdownProps {
  result: LeagueMatchPointsResult;
  players: Player[];
  getTeam: (id: string) => Team | undefined;
}

function NetEquation({
  name,
  handicapIndex,
  gross,
  adjustment,
  net,
}: {
  name: string;
  handicapIndex: number;
  gross: number;
  adjustment: number;
  net: number;
}) {
  return (
    <p className="text-sm tabular-nums text-fairway-300">
      <span className="font-medium">
        {firstName(name)} ({handicapIndex.toFixed(1)})
      </span>
      <span className="text-fairway-500">: </span>
      {gross}
      <span className="text-fairway-500"> − </span>
      {adjustment}
      <span className="text-fairway-500"> = </span>
      <span className="font-semibold text-sand-hunter">{net} net</span>
    </p>
  );
}

const sectionDivider = "border-t border-sand-hunter";

export function LeaguePointsBreakdown({
  result,
  players,
  getTeam,
}: LeaguePointsBreakdownProps) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const homeTeam = getTeam(result.homeTeamId);
  const awayTeam = getTeam(result.awayTeamId);

  const bestBall = isBestBallAllOrNothingResult(result);
  const formatNote = bestBall
    ? "Lower team best ball gross total wins all 3 points — no splits."
    : result.format === "stroke"
      ? "Gross minus course handicap strokes equals net. Lower net wins the pairing point (½ each on a tie). Team point goes to the lower combined team net."
      : "Net match play by hole; more holes won takes the pairing point (½ each if tied). Team point uses combined team net.";

  return (
    <section className="rounded-[8px] border border-sand-hunter bg-white p-3">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="card-title">League points</p>
        <p className="text-[10px] font-bold tracking-wide text-fairway-500">
          3 available
        </p>
      </div>
      <p className="mb-3 text-[10px] leading-snug text-fairway-500">{formatNote}</p>

      <ul>
        {bestBall ? (
          <li className={`py-3 ${sectionDivider}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-fairway-500">
                Match
              </p>
              <span className="shrink-0 text-[10px] font-bold tabular-nums tracking-wide text-sand-hunter">
                {homeTeam?.name?.split(/\s+/)[0] ?? "Home"}{" "}
                {formatLeaguePoint(result.homePoints)}–
                {formatLeaguePoint(result.awayPoints)}{" "}
                {awayTeam?.name?.split(/\s+/)[0] ?? "Away"}
              </span>
            </div>
            <p className="mt-2 text-sm tabular-nums text-fairway-300">
              {homeTeam?.name ?? "Home"}{" "}
              <span className="font-semibold text-sand-hunter">
                {result.teamPoint.homeTeamNet}
              </span>{" "}
              gross
              <span className="text-fairway-400"> vs </span>
              {awayTeam?.name ?? "Away"}{" "}
              <span className="font-semibold text-sand-hunter">
                {result.teamPoint.awayTeamNet}
              </span>{" "}
              gross
            </p>
          </li>
        ) : null}

        {!bestBall
          ? result.pairings.map((pair, index) => {
          const playerA = byId.get(pair.playerAId);
          const playerB = byId.get(pair.playerBId);
          if (!playerA || !playerB) return null;

          return (
            <li
              key={`${pair.playerAId}-${pair.playerBId}`}
              className={`py-3 ${sectionDivider}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-fairway-500">
                  Pairing {index + 1}
                </p>
                <span className="shrink-0 text-[10px] font-bold tabular-nums tracking-wide text-sand-hunter">
                  {homeTeam?.name?.split(/\s+/)[0] ?? "Home"}{" "}
                  {formatLeaguePoint(pair.homePoints)}–
                  {formatLeaguePoint(pair.awayPoints)}{" "}
                  {awayTeam?.name?.split(/\s+/)[0] ?? "Away"}
                </span>
              </div>

              {result.format === "stroke" && pair.stroke ? (
                <div className="mt-2 space-y-1">
                  <NetEquation
                    name={playerA.name}
                    handicapIndex={playerA.handicapIndex}
                    gross={pair.stroke.lineA.gross}
                    adjustment={pair.stroke.lineA.adjustment}
                    net={pair.stroke.lineA.net}
                  />
                  <NetEquation
                    name={playerB.name}
                    handicapIndex={playerB.handicapIndex}
                    gross={pair.stroke.lineB.gross}
                    adjustment={pair.stroke.lineB.adjustment}
                    net={pair.stroke.lineB.net}
                  />
                </div>
              ) : pair.match ? (
                <p className="mt-2 text-sm text-fairway-300">
                  {firstName(playerA.name)} {pair.match.holesWonA}–
                  {pair.match.holesWonB} {firstName(playerB.name)} holes won
                </p>
              ) : null}
            </li>
          );
        })
          : null}

        {!bestBall ? (
          <li className={`py-3 ${sectionDivider}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-fairway-500">
                Team point
              </p>
              <span className="shrink-0 text-[10px] font-bold tabular-nums tracking-wide text-sand-hunter">
                {homeTeam?.name?.split(/\s+/)[0] ?? "Home"}{" "}
                {formatLeaguePoint(result.teamPoint.homePoints)}–
                {formatLeaguePoint(result.teamPoint.awayPoints)}{" "}
                {awayTeam?.name?.split(/\s+/)[0] ?? "Away"}
              </span>
            </div>
            <p className="mt-2 text-sm tabular-nums text-fairway-300">
              {homeTeam?.name ?? "Home"}{" "}
              <span className="font-semibold text-sand-hunter">
                {result.teamPoint.homeTeamNet}
              </span>{" "}
              net
              <span className="text-fairway-400"> vs </span>
              {awayTeam?.name ?? "Away"}{" "}
              <span className="font-semibold text-sand-hunter">
                {result.teamPoint.awayTeamNet}
              </span>{" "}
              net
            </p>
            <p className="mt-1 text-xs leading-snug text-fairway-500">
              {result.teamPoint.summary}
            </p>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
