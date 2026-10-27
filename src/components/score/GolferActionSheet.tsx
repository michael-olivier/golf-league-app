import { BottomSheet } from "../BottomSheet";

interface GolferActionSheetProps {
  open: boolean;
  golferName: string;
  onClose: () => void;
  onRemove: () => void;
  onChange: () => void;
}

export function GolferActionSheet({
  open,
  golferName,
  onClose,
  onRemove,
  onChange,
}: GolferActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={golferName}
      tone="white"
      compact
      contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
    >
      <ul className="divide-y divide-fairway-800/15">
        <li>
          <button
            type="button"
            onClick={() => {
              onRemove();
              onClose();
            }}
            className="w-full py-3.5 text-left text-base font-medium text-sand-brick"
          >
            Remove golfer
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              onChange();
              onClose();
            }}
            className="w-full py-3.5 text-left text-base font-medium text-[#373737]"
          >
            Change golfer
          </button>
        </li>
      </ul>
    </BottomSheet>
  );
}
