import { BottomSheet } from "../BottomSheet";

export interface SetupPickerOption {
  id: string;
  label: string;
  /** Underlined link style (e.g. Other). */
  variant?: "default" | "link";
}

interface SetupPickerSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: SetupPickerOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  expanded?: boolean;
}

export function SetupPickerSheet({
  open,
  onClose,
  title,
  options,
  selectedId,
  onSelect,
  expanded = false,
}: SetupPickerSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      tone="white"
      expanded={expanded}
      compact={!expanded}
      contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
    >
      <ul className="divide-y divide-fairway-800/15">
        {options.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full py-3.5 text-left text-base ${
                opt.variant === "link"
                  ? "font-medium text-sand-hunter underline"
                  : selectedId === opt.id
                    ? "font-semibold text-[#373737]"
                    : "font-medium text-[#373737]"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
