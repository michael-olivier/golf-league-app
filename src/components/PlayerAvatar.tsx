import type { Player } from "../types";
import { playerInitials } from "../utils/player";

interface PlayerAvatarProps {
  player: Player;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = {
  xs: "h-8 w-8 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-[72px] w-[72px] text-base",
} as const;

export function PlayerAvatar({
  player,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const dim = sizeClass[size];

  if (player.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt=""
        className={`${dim} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-sand-hunter/15 font-semibold text-sand-hunter ${className}`}
      aria-hidden
    >
      {playerInitials(player.name)}
    </span>
  );
}
