export function teamNameWords(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

interface TeamNameMultilineProps {
  name: string;
  uppercase?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  lineClassName?: string;
}

/** One line per word when the team name has multiple words; single word unchanged. */
export function TeamNameMultiline({
  name,
  uppercase = false,
  align = "left",
  className = "",
  lineClassName,
}: TeamNameMultilineProps) {
  const words = teamNameWords(name);
  const lines = uppercase ? words.map((w) => w.toUpperCase()) : words;

  if (lines.length <= 1) {
    const single =
      uppercase && words[0] ? words[0].toUpperCase() : name.trim() || name;
    return <span className={className}>{single}</span>;
  }

  const alignClass =
    align === "right"
      ? "items-end text-right"
      : align === "center"
        ? "items-center text-center"
        : "items-start text-left";

  return (
    <span
      className={`inline-flex flex-col gap-0 leading-none ${alignClass} ${className}`.trim()}
    >
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className={lineClassName}>
          {line}
        </span>
      ))}
    </span>
  );
}

interface LeagueStackedTeamNameProps {
  name: string;
  suffix?: string;
  align?: "left" | "right";
}

export function LeagueStackedTeamName({
  name,
  suffix,
  align = "left",
}: LeagueStackedTeamNameProps) {
  const words = teamNameWords(name).map((w) => w.toUpperCase());

  return (
    <div
      className={`league-stacked-team ${align === "right" ? "text-right" : "text-left"}`}
    >
      {words.length <= 1 ? (
        <span className="league-stacked-team__line">{words[0] ?? name}</span>
      ) : (
        words.map((word, index) => (
          <span key={`${word}-${index}`} className="league-stacked-team__line">
            {word}
          </span>
        ))
      )}
      {suffix ? (
        <span className="league-stacked-team__suffix">{suffix}</span>
      ) : null}
    </div>
  );
}
