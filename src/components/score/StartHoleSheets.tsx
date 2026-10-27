import { BottomSheet } from "../BottomSheet";

interface StartHoleSheetsProps {
  presetsOpen: boolean;
  allHolesOpen: boolean;
  onClosePresets: () => void;
  onCloseAllHoles: () => void;
  onSelectHole: (hole: number) => void;
  onChooseOther: () => void;
}

export function StartHoleSheets({
  presetsOpen,
  allHolesOpen,
  onClosePresets,
  onCloseAllHoles,
  onSelectHole,
  onChooseOther,
}: StartHoleSheetsProps) {
  return (
    <>
      <BottomSheet
        open={presetsOpen}
        onClose={onClosePresets}
        title="Start hole"
        tone="white"
        compact
        contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <ul className="divide-y divide-fairway-800/15">
          {[1, 10].map((hole) => (
            <li key={hole}>
              <button
                type="button"
                className="w-full py-3.5 text-left text-base font-medium text-[#373737]"
                onClick={() => onSelectHole(hole)}
              >
                Hole {hole}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="w-full py-3.5 text-left text-base font-medium text-sand-hunter underline"
              onClick={onChooseOther}
            >
              Other
            </button>
          </li>
        </ul>
      </BottomSheet>

      <BottomSheet
        open={allHolesOpen}
        onClose={onCloseAllHoles}
        title="Start hole"
        tone="white"
        expanded
        contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <ul className="max-h-[min(50dvh,360px)] overflow-y-auto overscroll-contain divide-y divide-fairway-800/15">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => (
            <li key={hole}>
              <button
                type="button"
                className="w-full py-3 text-left text-base font-medium text-[#373737]"
                onClick={() => onSelectHole(hole)}
              >
                Hole {hole}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
