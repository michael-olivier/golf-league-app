import type { DirectionalResult } from "../../types";

const directionLabels: Record<DirectionalResult, string> = {
  forward: "Forward",
  left: "Left",
  center: "Center",
  right: "Right",
  back: "Back",
};

function Icon({
  direction,
  className,
}: {
  direction: DirectionalResult;
  className: string;
}) {
  switch (direction) {
    case "forward":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5v14M12 5l-5 5M12 5l5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "back":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 19V5M12 19l-5-5M12 19l5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "left":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19 12H5M5 12l5-5M5 12l5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "right":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14M19 12l-5-5M19 12l-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "center":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 12.5l3.5 3.5L18 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

interface DirectionalPickerProps {
  label: string;
  value: DirectionalResult | null;
  onChange: (value: DirectionalResult | null) => void;
  className?: string;
  compact?: boolean;
}

export function DirectionalPicker({
  label,
  value,
  onChange,
  className = "",
  compact = false,
}: DirectionalPickerProps) {
  const buttonSize = compact ? "h-9 w-9" : "h-11 w-11";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  const renderButton = (id: DirectionalResult) => {
    const selected = value === id;
    return (
      <button
        type="button"
        role="radio"
        aria-label={directionLabels[id]}
        aria-checked={selected}
        onClick={() => onChange(selected ? null : id)}
        className={`flex ${buttonSize} shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected
            ? "border-sand-hunter bg-sand-hunter text-white"
            : "border-sand-hunter bg-white text-sand-sage"
        }`}
      >
        <Icon direction={id} className={iconSize} />
      </button>
    );
  };

  return (
    <div className={className} role="radiogroup" aria-label={label}>
      <p
        className="mb-2 text-center text-sm font-bold uppercase tracking-wider text-[#373737]"
      >
        {label}
      </p>
      <div className="mx-auto flex w-fit flex-col items-center gap-2">
        {renderButton("forward")}
        <div className="flex items-center gap-2">
          {renderButton("left")}
          {renderButton("center")}
          {renderButton("right")}
        </div>
        {renderButton("back")}
      </div>
    </div>
  );
}
