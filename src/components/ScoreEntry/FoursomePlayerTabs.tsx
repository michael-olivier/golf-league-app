import { useMemo } from "react";
import type { Player } from "../../types";
import { PlayerAvatar } from "../PlayerAvatar";
import { playerTabLabels } from "../../utils/player";

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
  const labels = useMemo(() => playerTabLabels(players), [players]);

  return (
    <div
      className="grid w-full min-w-0 grid-cols-4 gap-1"
      role="tablist"
      aria-label="Foursome players"
    >
      {players.map((player) => {
        const active = player.id === activePlayerId;
        const label = labels.get(player.id) ?? player.name;
        return (
          <button
            key={player.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={player.name}
            onClick={() => onSelect(player.id)}
            className={`flex min-w-0 w-full flex-col items-center gap-1 rounded-[8px] px-0.5 py-1.5 transition ${
              active
                ? "border border-sand-hunter bg-sand-hunter/10"
                : "border border-transparent opacity-85 hover:opacity-100"
            }`}
          >
            <PlayerAvatar player={player} size="xs" />
            <span
              className={`w-full truncate text-center text-[11px] font-medium leading-tight ${
                active ? "text-sand-hunter" : "text-fairway-500"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
