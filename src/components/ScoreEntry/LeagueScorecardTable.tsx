import type { Course, Hole, HoleScore, League, Player } from "../../types";
import { isHolePlayed } from "../../types";
import { playerTabLabels } from "../../utils/player";
import { totalStrokes } from "../../store/LeagueContext";
import {
  courseStrokesOnHole,
  grossAndNetTotals,
} from "../../utils/casualScoring";
import { playerNetLine } from "../../utils/leaguePoints";
import {
  computeHeadToHeadMatch,
  matchOpponentForPlayer,
  playerGetsStrokeOnHole,
  popsOnHole,
} from "../../utils/matchPlay";
import { DecoratedScore } from "./DecoratedScore";
import { StrokePopMarker } from "./StrokePopMarker";

interface LeagueScorecardTableProps {
  courseName: string;
  nineLabel: string;
  /** Hide centered course / nine heading (e.g. when wrapped in a titled card). */
  hideTitle?: boolean;
  holes: Hole[];
  players: Player[];
  scoresForPlayer: (playerId: string) => HoleScore[] | undefined;
  casualStrokeNet?: {
    holeCount: 9 | 18;
    courseHandicapForPlayer: (playerId: string) => number;
  };
  /** Match (Net): pops vs paired opponent + decorated gross scores. */
  casualMatchNet?: boolean;
  /** Birdie/bogey circles and squares on gross strokes. */
  decoratedScores?: boolean;
  /** League match summary modal layout. */
  summaryFormat?: "stroke" | "match";
  course?: Course;
  league?: League;
}

function strokeCell(score: HoleScore | undefined): string {
  if (!score || !isHolePlayed(score)) return "—";
  return String(score.strokes);
}

function strokeCellNet(
  score: HoleScore | undefined,
  hole: Hole,
  courseHandicap: number,
  holeCount: 9 | 18,
): string {
  if (!score || !isHolePlayed(score)) return "—";
  const pop = courseStrokesOnHole(
    courseHandicap,
    hole.handicapIndex,
    holeCount,
  );
  const net = score.strokes! - pop;
  return pop > 0 ? `${score.strokes}→${net}` : String(score.strokes);
}

function MatchNetScoreCell({
  score,
  hole,
  player,
  players,
}: {
  score: HoleScore | undefined;
  hole: Hole;
  player: Player;
  players: Player[];
}) {
  const opponent = matchOpponentForPlayer(player.id, players);
  const showPop =
    opponent != null &&
    playerGetsStrokeOnHole(player, opponent, hole);

  return (
    <div className="inline-flex items-center justify-center gap-0.5">
      {showPop ? <StrokePopMarker /> : null}
      <DecoratedScore
        size="sm"
        strokes={score && isHolePlayed(score) ? score.strokes : null}
        par={hole.par}
      />
    </div>
  );
}

function playerWonMatchHole(
  player: Player,
  opponent: Player,
  hole: Hole,
  playerScore: HoleScore | undefined,
  opponentScore: HoleScore | undefined,
): boolean {
  if (
    !playerScore ||
    !opponentScore ||
    !isHolePlayed(playerScore) ||
    !isHolePlayed(opponentScore)
  ) {
    return false;
  }
  const netPlayer =
    playerScore.strokes! -
    popsOnHole(
      player.handicapIndex,
      opponent.handicapIndex,
      hole.handicapIndex,
    );
  const netOpponent =
    opponentScore.strokes! -
    popsOnHole(
      opponent.handicapIndex,
      player.handicapIndex,
      hole.handicapIndex,
    );
  return netPlayer < netOpponent;
}

export function LeagueScorecardTable({
  courseName,
  nineLabel,
  hideTitle = false,
  holes,
  players,
  scoresForPlayer,
  casualStrokeNet,
  casualMatchNet = false,
  decoratedScores = false,
  summaryFormat,
  course,
  league,
}: LeagueScorecardTableProps) {
  const labels = playerTabLabels(players);
  const showWomenPar = holes.some(
    (h) => h.parWomen != null && h.parWomen !== h.par,
  );
  const parTotal = holes.reduce((s, h) => s + h.par, 0);
  const parWomenTotal = holes.reduce(
    (s, h) => s + (h.parWomen ?? h.par),
    0,
  );

  return (
    <div className="space-y-3">
      {hideTitle ? null : (
        <div className="text-center">
          <p className="text-sm font-semibold text-[#373737]">{courseName}</p>
          <p className="text-xs text-fairway-500">{nineLabel}</p>
        </div>
      )}

      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-center text-[11px]">
          <thead>
            <tr className="border-b border-sand-hunter/40">
              <th className="sticky left-0 z-10 bg-white px-1 py-1.5 text-left font-semibold uppercase tracking-wide text-fairway-500">
                Hole
              </th>
              {holes.map((h) => (
                <th
                  key={h.number}
                  className="min-w-[1.75rem] px-0.5 py-1.5 font-semibold tabular-nums text-[#373737]"
                >
                  {h.number}
                </th>
              ))}
              <th className="min-w-[2rem] px-1 py-1.5 font-semibold text-[#373737]">
                Total
              </th>
              {summaryFormat === "stroke" ? (
                <th className="min-w-[2rem] px-1 py-1.5 font-semibold text-[#373737]">
                  Net
                </th>
              ) : null}
              {summaryFormat === "match" ? (
                <th className="min-w-[2rem] px-1 py-1.5 font-semibold text-[#373737]">
                  Holes
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="tabular-nums text-[#373737]">
            <tr className="border-b border-sand-hunter/25 bg-white/50">
              <td className="sticky left-0 z-10 bg-white/90 px-1 py-1.5 text-left text-[10px] font-semibold uppercase text-fairway-500">
                Par{showWomenPar ? " (M)" : ""}
              </td>
              {holes.map((h) => (
                <td key={h.number} className="px-0.5 py-1.5">
                  {h.par}
                </td>
              ))}
              <td className="px-1 py-1.5 font-semibold">{parTotal}</td>
              {summaryFormat === "stroke" ? <td className="px-1 py-1.5" /> : null}
              {summaryFormat === "match" ? <td className="px-1 py-1.5" /> : null}
            </tr>
            {showWomenPar ? (
              <tr className="border-b border-sand-hunter/25 bg-white/50">
                <td className="sticky left-0 z-10 bg-white/90 px-1 py-1.5 text-left text-[10px] font-semibold uppercase text-fairway-500">
                  Par (F)
                </td>
                {holes.map((h) => (
                  <td key={h.number} className="px-0.5 py-1.5">
                    {h.parWomen ?? h.par}
                  </td>
                ))}
                <td className="px-1 py-1.5 font-semibold">{parWomenTotal}</td>
                {summaryFormat === "stroke" ? <td className="px-1 py-1.5" /> : null}
                {summaryFormat === "match" ? <td className="px-1 py-1.5" /> : null}
              </tr>
            ) : null}
            <tr className="border-b border-sand-hunter/40 bg-white/30">
              <td className="sticky left-0 z-10 bg-white px-1 py-1.5 text-left text-[10px] font-semibold uppercase text-fairway-500">
                Hcp
              </td>
              {holes.map((h) => (
                <td key={h.number} className="px-0.5 py-1.5 text-fairway-500">
                  {h.handicapIndex}
                </td>
              ))}
              <td className="px-1 py-1.5" />
              {summaryFormat === "stroke" ? <td className="px-1 py-1.5" /> : null}
              {summaryFormat === "match" ? <td className="px-1 py-1.5" /> : null}
            </tr>
            {players.map((player) => {
              const scores = scoresForPlayer(player.id) ?? [];
              const label = labels.get(player.id) ?? player.name;
              const ch = casualStrokeNet?.courseHandicapForPlayer(player.id);
              const totals =
                casualStrokeNet && ch != null
                  ? grossAndNetTotals(
                      scores,
                      holes,
                      ch,
                      casualStrokeNet.holeCount,
                    )
                  : null;
              const leagueLine =
                summaryFormat === "stroke" && course && league
                  ? playerNetLine(player, scores, holes, course, league)
                  : null;
              const opponent = matchOpponentForPlayer(player.id, players);
              const matchResult =
                summaryFormat === "match" && opponent
                  ? computeHeadToHeadMatch(
                      player,
                      opponent,
                      holes,
                      scores,
                      scoresForPlayer(opponent.id) ?? [],
                      { applyHandicapStrokes: true },
                    )
                  : null;
              return (
                <tr
                  key={player.id}
                  className="border-b border-sand-hunter/20 last:border-0"
                >
                  <td className="sticky left-0 z-10 max-w-[4.5rem] truncate bg-white px-1 py-2 text-left text-[11px] font-semibold text-sand-hunter">
                    {label}
                  </td>
                  {holes.map((h, idx) => {
                    const opponentScores =
                      opponent != null
                        ? (scoresForPlayer(opponent.id) ?? [])
                        : [];
                    const wonHole =
                      summaryFormat === "match" &&
                      opponent != null &&
                      playerWonMatchHole(
                        player,
                        opponent,
                        h,
                        scores[idx],
                        opponentScores[idx],
                      );
                    return (
                    <td
                      key={h.number}
                      className={`px-0.5 py-1.5 font-medium ${
                        wonHole ? "league-scorecard-hole-won" : ""
                      }`}
                    >
                      {casualMatchNet ? (
                        <MatchNetScoreCell
                          score={scores[idx]}
                          hole={h}
                          player={player}
                          players={players}
                        />
                      ) : casualStrokeNet && ch != null ? (
                        strokeCellNet(
                          scores[idx],
                          h,
                          ch,
                          casualStrokeNet.holeCount,
                        )
                      ) : decoratedScores ? (
                        <DecoratedScore
                          size="sm"
                          strokes={
                            scores[idx] && isHolePlayed(scores[idx]!)
                              ? scores[idx]!.strokes
                              : null
                          }
                          par={h.par}
                        />
                      ) : (
                        strokeCell(scores[idx])
                      )}
                    </td>
                  );
                  })}
                  <td className="px-1 py-2 font-semibold">
                    {leagueLine != null
                      ? leagueLine.gross
                      : totals?.gross != null && totals.net != null
                        ? `${totals.gross} (${totals.net})`
                        : (totalStrokes(scores) ?? "—")}
                  </td>
                  {summaryFormat === "stroke" ? (
                    <td className="px-1 py-2 font-semibold">
                      {leagueLine?.net ?? "—"}
                    </td>
                  ) : null}
                  {summaryFormat === "match" && matchResult ? (
                    <td className="px-1 py-2 font-semibold">
                      {matchResult.playerAId === player.id
                        ? matchResult.holesWonA
                        : matchResult.holesWonB}
                    </td>
                  ) : null}
                  {summaryFormat === "match" && !matchResult ? (
                    <td className="px-1 py-2">—</td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
