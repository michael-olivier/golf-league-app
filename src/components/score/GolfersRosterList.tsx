import type { ReactNode } from "react";
import type { ScoringGolfer } from "../../types";
import type { TeamSide } from "../../utils/balancedTeams";
import { golfersByTeam } from "../../utils/balancedTeams";
import { GolferRosterRow } from "./GolferRosterRow";

interface GolfersRosterListProps {
  roster: ScoringGolfer[];
  teamsEnabled: boolean;
  teamByGolferId: Record<string, TeamSide>;
  onMoveToTeam: (golferId: string, team: TeamSide) => void;
  currentUserId: string;
  teeLabelFor: (golferId: string) => string;
  onTeeClick: (golferId: string) => void;
  onRemoveGolfer: (golferId: string) => void;
  onNameMenu: (golfer: ScoringGolfer) => void;
  openAddSlot?: ReactNode;
}

function TeamDropZone({
  team,
  onMoveToTeam,
  children,
}: {
  team: TeamSide;
  onMoveToTeam: (golferId: string, team: TeamSide) => void;
  children: ReactNode;
}) {
  return (
    <div
      className="space-y-2"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("application/golfer-id");
        if (id) onMoveToTeam(id, team);
      }}
    >
      {children}
    </div>
  );
}

function GolferRosterRowDragWrapper({
  golfer,
  teamsEnabled,
  rosterLength,
  currentUserId,
  teeLabelFor,
  onTeeClick,
  onRemoveGolfer,
  onNameMenu,
}: {
  golfer: ScoringGolfer;
  teamsEnabled: boolean;
  rosterLength: number;
  currentUserId: string;
  teeLabelFor: (id: string) => string;
  onTeeClick: (id: string) => void;
  onRemoveGolfer: (id: string) => void;
  onNameMenu: (golfer: ScoringGolfer) => void;
}) {
  const isYou = golfer.id === currentUserId;
  const row = (
    <GolferRosterRow
      name={golfer.name}
      handicapIndex={golfer.handicapIndex}
      teeLabel={teeLabelFor(golfer.id)}
      onTeeClick={() => onTeeClick(golfer.id)}
      removable={!isYou}
      onRemove={isYou ? undefined : () => onRemoveGolfer(golfer.id)}
      onNameMenu={isYou ? undefined : () => onNameMenu(golfer)}
    />
  );

  if (!teamsEnabled || rosterLength < 3) {
    return row;
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/golfer-id", golfer.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      {row}
    </div>
  );
}

export function GolfersRosterList({
  roster,
  teamsEnabled,
  teamByGolferId,
  onMoveToTeam,
  currentUserId,
  teeLabelFor,
  onTeeClick,
  onRemoveGolfer,
  onNameMenu,
  openAddSlot,
}: GolfersRosterListProps) {
  const rowProps = {
    teamsEnabled,
    rosterLength: roster.length,
    currentUserId,
    teeLabelFor,
    onTeeClick,
    onRemoveGolfer,
    onNameMenu,
  };

  if (!teamsEnabled || roster.length < 3) {
    return (
      <ul className="space-y-2">
        {roster.map((g) => (
          <li key={g.id}>
            <GolferRosterRowDragWrapper golfer={g} {...rowProps} />
          </li>
        ))}
        {openAddSlot}
      </ul>
    );
  }

  const { teamA, teamB } = golfersByTeam(roster, teamByGolferId);

  return (
    <ul className="space-y-2">
      <li>
        <TeamDropZone team={0} onMoveToTeam={onMoveToTeam}>
          {teamA.map((g) => (
            <GolferRosterRowDragWrapper key={g.id} golfer={g} {...rowProps} />
          ))}
        </TeamDropZone>
      </li>
      <li aria-hidden className="py-1">
        <div className="border-t border-sand-score-border" />
      </li>
      <li>
        <TeamDropZone team={1} onMoveToTeam={onMoveToTeam}>
          {teamB.map((g) => (
            <GolferRosterRowDragWrapper key={g.id} golfer={g} {...rowProps} />
          ))}
        </TeamDropZone>
      </li>
      {openAddSlot}
    </ul>
  );
}
