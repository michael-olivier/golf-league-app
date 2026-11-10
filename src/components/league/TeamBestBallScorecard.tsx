import type { Hole, HoleScore, Team } from "../../types";
import {
  teamBestBallTotals,
  teamBestBallScorecardHasData,
} from "../../utils/bestBall";

interface TeamBestBallScorecardProps {
  holes: Hole[];
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  homePartnerScores: (HoleScore[] | undefined)[];
  awayPartnerScores: (HoleScore[] | undefined)[];
}

export function teamBestBallTableHasData(
  holes: Hole[],
  homePartnerScores: (HoleScore[] | undefined)[],
  awayPartnerScores: (HoleScore[] | undefined)[],
): boolean {
  return (
    teamBestBallScorecardHasData(homePartnerScores, holes) ||
    teamBestBallScorecardHasData(awayPartnerScores, holes)
  );
}

export function TeamBestBallScorecard({
  holes,
  homeTeam,
  awayTeam,
  homePartnerScores,
  awayPartnerScores,
}: TeamBestBallScorecardProps) {
  const home = teamBestBallTotals(homePartnerScores, holes);
  const away = teamBestBallTotals(awayPartnerScores, holes);
  const parTotal = holes.reduce((sum, hole) => sum + hole.par, 0);

  if (!teamBestBallTableHasData(holes, homePartnerScores, awayPartnerScores)) {
    return null;
  }

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[280px] border-collapse text-center text-[11px]">
        <thead>
          <tr className="border-b border-sand-hunter/40">
            <th className="sticky left-0 z-10 bg-white px-1 py-1.5 text-left font-semibold uppercase tracking-wide text-fairway-500">
              Hole
            </th>
            {holes.map((hole) => (
              <th
                key={hole.number}
                className="min-w-[1.75rem] px-0.5 py-1.5 font-semibold tabular-nums text-fairway-300"
              >
                {hole.number}
              </th>
            ))}
            <th className="min-w-[2rem] px-1 py-1.5 font-semibold text-fairway-300">
              Tot
            </th>
          </tr>
        </thead>
        <tbody className="tabular-nums text-fairway-300">
          <tr className="border-b border-sand-hunter/25 bg-white/50">
            <td className="sticky left-0 z-10 bg-white/90 px-1 py-1.5 text-left text-[10px] font-semibold uppercase text-fairway-500">
              Par
            </td>
            {holes.map((hole) => (
              <td key={hole.number} className="px-0.5 py-1.5 text-fairway-500">
                {hole.par}
              </td>
            ))}
            <td className="px-1 py-1.5 font-semibold text-fairway-500">
              {parTotal}
            </td>
          </tr>
          <tr className="border-b border-sand-hunter/30">
            <td
              className="sticky left-0 z-10 bg-white px-1 py-1.5 text-left text-[10px] font-semibold uppercase"
              style={{ color: homeTeam?.color }}
            >
              {homeTeam?.name ?? "Home"}
            </td>
            {home.byHole.map((strokes, index) => (
              <td key={holes[index].number} className="px-0.5 py-1.5 font-semibold">
                {strokes ?? "—"}
              </td>
            ))}
            <td className="px-1 py-1.5 font-semibold text-sand-hunter">
              {home.total ?? "—"}
            </td>
          </tr>
          <tr>
            <td
              className="sticky left-0 z-10 bg-white px-1 py-1.5 text-left text-[10px] font-semibold uppercase"
              style={{ color: awayTeam?.color }}
            >
              {awayTeam?.name ?? "Away"}
            </td>
            {away.byHole.map((strokes, index) => (
              <td key={holes[index].number} className="px-0.5 py-1.5 font-semibold">
                {strokes ?? "—"}
              </td>
            ))}
            <td className="px-1 py-1.5 font-semibold text-sand-hunter">
              {away.total ?? "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
