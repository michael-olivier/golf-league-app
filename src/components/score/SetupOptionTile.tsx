interface SetupOptionTileProps {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
}

/** Round setup grid cell — tap opens picker sheet. */
export function SetupOptionTile({
  label,
  value,
  onClick,
  disabled = false,
}: SetupOptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex min-h-[5rem] w-full flex-col items-center justify-center rounded-2xl border border-sand-score-border bg-white px-2 py-3 text-center ${
        disabled ? "opacity-55" : ""
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-fairway-400">
        {label}
      </span>
      <span className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-[#575757]">
        {value}
      </span>
    </button>
  );
}
