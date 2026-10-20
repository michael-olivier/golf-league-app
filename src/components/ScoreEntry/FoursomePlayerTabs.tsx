import type { Player } from "../../types";
import { playerInitials } from "../../utils/player";

interface FoursomePlayerTabsProps {
  players: Player[];
  activePlayerId: string;
  onSelect: (playerId: string) => void;
}

export function FoursomePlayerTabs({
  players,
  activePlayerId,
  onSelect,
}: FoursomePlayerTabsProps) {
  return (
    <div
      className="grid gap-1 rounded-xl bg-fairway-900/60 p-1"
      style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
      role="tablist"
      aria-label="Foursome players"
    >
      {players.map((player) => {
        const active = player.id === activePlayerId;
        const initials = playerInitials(player.name);
        return (
          <button
            key={player.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={player.name}
            title={player.name}
            onClick={() => onSelect(player.id)}
            className={`rounded-lg py-2.5 text-sm font-semibold tracking-wide transition ${
              active
                ? "bg-fairway-700 text-white"
                : "text-fairway-400 hover:text-fairway-200"
            }`}
          >
            {initials}
          </button>
        );
      })}
    </div>
  );
}
