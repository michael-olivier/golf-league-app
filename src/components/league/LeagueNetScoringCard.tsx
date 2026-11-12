import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Hole, Player, Team, WeeklyMatch } from "../../types";
import type { LeagueScoringFormat } from "../../utils/leaguePoints";
import {
  foursomeMatchPairs,
  formatPopHoleList,
  handicapStrokesVsOpponent,
  popHoleNumbersForMatch,
} from "../../utils/matchPlay";
import { rosterSlots } from "./MatchFoursomeRoster";
import { LeagueStackedTeamName } from "./leagueTeamStack";
import { LeagueSummarySection } from "./LeagueSummarySection";

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

interface LeagueNetScoringCardProps {
  match: WeeklyMatch;
  players: Player[];
  viewerTeamId: string;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  holes: Hole[];
  scoringFormat: LeagueScoringFormat;
}

function pairingMiddleLabel(
  playerLeft: Player,
  playerRight: Player,
  holes: Hole[],
  scoringFormat: LeagueScoringFormat,
): { label: string; receiverOnRight: boolean } {
  const receiver =
    playerLeft.handicapIndex > playerRight.handicapIndex
      ? playerLeft
      : playerRight;
  const giver = receiver.id === playerLeft.id ? playerRight : playerLeft;
  const receiverOnRight = receiver.id === playerRight.id;

  if (scoringFormat === "match") {
    const popHoles = popHoleNumbersForMatch(receiver, giver, holes);
    return {
      label: popHoles.length > 0 ? formatPopHoleList(popHoles) : "Even",
      receiverOnRight,
    };
  }

  const strokes = handicapStrokesVsOpponent(
    receiver.handicapIndex,
    giver.handicapIndex,
    holes,
  );
  return {
    label:
      strokes === 0
        ? "Even"
        : `${strokes} stroke${strokes === 1 ? "" : "s"}`,
    receiverOnRight,
  };
}

export function LeagueNetScoringCard({
  match,
  players,
  viewerTeamId,
  homeTeam,
  awayTeam,
  holes,
  scoringFormat,
}: LeagueNetScoringCardProps) {
  const slots = rosterSlots(
    match,
    players,
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  );
  const viewerIsHome = viewerTeamId === match.teamPairing.homeTeamId;
  const leftTeam = viewerIsHome ? homeTeam : awayTeam;
  const rightTeam = viewerIsHome ? awayTeam : homeTeam;
  const leftA = viewerIsHome ? slots.homeA : slots.awayA;
  const leftB = viewerIsHome ? slots.homeB : slots.awayB;
  const rightA = viewerIsHome ? slots.awayA : slots.homeA;
  const rightB = viewerIsHome ? slots.awayB : slots.homeB;

  const pairRows: { left: Player; right: Player }[] = [];
  const foursomeIds = match.foursomes[0]?.playerIds ?? [];

  if (foursomeIds.length >= 4) {
    for (const [idA, idB] of foursomeMatchPairs(foursomeIds)) {
      const playerA = players.find((p) => p.id === idA);
      const playerB = players.find((p) => p.id === idB);
      if (!playerA || !playerB) continue;
      const leftPlayer = playerA.teamId === viewerTeamId ? playerA : playerB;
      const rightPlayer = leftPlayer.id === playerA.id ? playerB : playerA;
      pairRows.push({ left: leftPlayer, right: rightPlayer });
    }
  } else {
    if (leftA && rightA) pairRows.push({ left: leftA, right: rightA });
    if (leftB && rightB) pairRows.push({ left: leftB, right: rightB });
  }

  if (pairRows.length === 0) return null;

  return (
    <LeagueSummarySection title="Net scoring">
      <div className="grid grid-cols-2 items-end gap-2">
        <LeagueStackedTeamName
          name={leftTeam?.name ?? "Your team"}
          align="left"
        />
        <LeagueStackedTeamName
          name={rightTeam?.name ?? "Opponent"}
          align="right"
        />
      </div>
      <div className="mt-3 space-y-3">
        {pairRows.map((row) => {
          const middle = pairingMiddleLabel(
            row.left,
            row.right,
            holes,
            scoringFormat,
          );
          const Arrow = middle.receiverOnRight ? ArrowRight : ArrowLeft;
          return (
            <div
              key={`${row.left.id}-${row.right.id}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              <p className="league-net-scoring-player truncate">
                {firstName(row.left.name)}
                <span className="league-net-scoring-player-index">
                  {" "}
                  ({row.left.handicapIndex.toFixed(1)})
                </span>
              </p>
              <span className="league-net-scoring-mid inline-flex max-w-[8.5rem] items-center gap-1 whitespace-normal text-center">
                {middle.label}
                <Arrow aria-hidden className="h-3 w-3 shrink-0" strokeWidth={1} />
              </span>
              <p className="league-net-scoring-player truncate text-right">
                {firstName(row.right.name)}
                <span className="league-net-scoring-player-index">
                  {" "}
                  ({row.right.handicapIndex.toFixed(1)})
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </LeagueSummarySection>
  );
}
