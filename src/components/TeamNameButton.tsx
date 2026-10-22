import type { Team } from "../types";

interface TeamNameButtonProps {
  team: Team;
  onOpen: (teamId: string) => void;
}

export function TeamNameButton({ team, onOpen }: TeamNameButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(team.id)}
      className="font-semibold underline-offset-2 hover:underline"
      style={{ color: team.color }}
    >
      {team.name}
    </button>
  );
}
