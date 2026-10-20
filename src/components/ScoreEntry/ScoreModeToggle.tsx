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
      <span className="text-xs font-medium text-fairway-400">
        Include detailed stats
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={statsEnabled}
        aria-label="Include detailed stats"
        disabled={disabled}
        onClick={() => onChange(!statsEnabled)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 ${
          statsEnabled ? "bg-fairway-500" : "bg-fairway-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            statsEnabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
