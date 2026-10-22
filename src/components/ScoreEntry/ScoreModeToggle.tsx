import { Switch } from "../Switch";

interface ScoreModeToggleProps {
  statsEnabled: boolean;
  onChange: (statsEnabled: boolean) => void;
  disabled?: boolean;
}

export function ScoreModeToggle({
  statsEnabled,
  onChange,
  disabled = false,
}: ScoreModeToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-[#373737]">
        Include detailed stats
      </span>
      <Switch
        checked={statsEnabled}
        onChange={onChange}
        disabled={disabled}
        aria-label="Include detailed stats"
      />
    </div>
  );
}
