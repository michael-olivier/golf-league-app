import { HandicapBadge } from "./HandicapBadge";

interface PlayerChipProps {
  name: string;
  handicapIndex: number;
  ghinNumber?: string;
  teamColor?: string;
  active?: boolean;
  onClick?: () => void;
}

export function PlayerChip({
  name,
  handicapIndex,
  ghinNumber,
  teamColor,
  active,
  onClick,
}: PlayerChipProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? "border-fairway-600 bg-fairway-100"
          : "border-fairway-800 bg-fairway-900/50 hover:border-fairway-700"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {teamColor && (
          <span
            className="h-8 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: teamColor }}
          />
        )}
        <span className="truncate font-medium text-fairway-200">{name}</span>
      </div>
      <HandicapBadge index={handicapIndex} ghinNumber={ghinNumber} size="sm" />
    </Tag>
  );
}
