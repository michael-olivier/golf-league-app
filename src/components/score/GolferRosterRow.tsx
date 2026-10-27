import { useRef } from "react";
import { useSupportsSwipeActions } from "../../hooks/useSupportsSwipeActions";
import { useSwipeLeftAction } from "../../hooks/useSwipeLeftAction";

interface GolferRosterRowProps {
  name: string;
  handicapIndex: number;
  teeLabel: string;
  onTeeClick: () => void;
  removable: boolean;
  onRemove?: () => void;
  onNameMenu?: () => void;
}

export function GolferRosterRow({
  name,
  handicapIndex,
  teeLabel,
  onTeeClick,
  removable,
  onRemove,
  onNameMenu,
}: GolferRosterRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const swipeActions = useSupportsSwipeActions();
  const swipeEnabled = removable && swipeActions && onRemove != null;
  const nameOpensMenu =
    removable && !swipeActions && onNameMenu != null;

  const swipeHandlers = useSwipeLeftAction(
    () => onRemove?.(),
    rowRef,
    swipeEnabled,
  );

  const nameLine = (
    <>
      {name}{" "}
      <span className="font-bold tabular-nums text-[#575757]">
        ({handicapIndex.toFixed(1)})
      </span>
    </>
  );

  const nameEl = nameOpensMenu ? (
    <button
      type="button"
      onClick={onNameMenu}
      className="min-w-0 truncate text-left text-sm font-bold text-[#373737]"
    >
      {nameLine}
    </button>
  ) : (
    <p className="min-w-0 truncate text-sm font-bold text-[#373737]">
      {nameLine}
    </p>
  );

  return (
    <div
      ref={rowRef}
      className="touch-pan-y rounded-xl border border-sand-score-border bg-white px-3 py-2.5"
      {...swipeHandlers}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">{nameEl}</div>
        <button
          type="button"
          onClick={onTeeClick}
          className="shrink-0 text-sm font-medium text-sand-hunter underline"
        >
          {teeLabel}
        </button>
      </div>
    </div>
  );
}
