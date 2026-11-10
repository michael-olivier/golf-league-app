import type { Player, Team, WeeklyMatch } from "../../types";

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

function PlayerChip({
  player,
  align,
}: {
  player: Player;
  align: "left" | "right";
}) {
  return (
    <p
      className={`min-w-0 truncate text-sm font-medium text-fairway-300 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {firstName(player.name)}
      <span className="font-normal text-fairway-500">
        {" "}
        ({player.handicapIndex.toFixed(1)})
      </span>
    </p>
  );
}

function CrossPairRow({
  left,
  right,
}: {
  left: Player | undefined;
  right: Player | undefined;
}) {
  if (!left && !right) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="min-w-0">
        {left ? <PlayerChip player={left} align="left" /> : null}
      </div>
      <div className="min-w-0">
        {right ? <PlayerChip player={right} align="right" /> : null}
      </div>
    </div>
  );
}

export function rosterSlots(
  match: WeeklyMatch,
  players: Player[],
  homeTeamId: string,
  awayTeamId: string,
): {
  homeA: Player | undefined;
  homeB: Player | undefined;
  awayA: Player | undefined;
  awayB: Player | undefined;
} {
  const ids = match.foursomes[0]?.playerIds;
  const byId = new Map(players.map((p) => [p.id, p]));

  if (ids && ids.length >= 4) {
    return {
      homeA: byId.get(ids[0]),
      homeB: byId.get(ids[1]),
      awayA: byId.get(ids[2]),
      awayB: byId.get(ids[3]),
    };
  }

  const home = players.filter((p) => p.teamId === homeTeamId);
  const away = players.filter((p) => p.teamId === awayTeamId);
  return {
    homeA: home[0],
    homeB: home[1],
    awayA: away[0],
    awayB: away[1],
  };
}

interface MatchFoursomeRosterProps {
  match: WeeklyMatch;
  players: Player[];
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  dividerBelow?: boolean;
}

export function MatchFoursomeRoster({
  match,
  players,
  homeTeam,
  awayTeam,
  dividerBelow = false,
}: MatchFoursomeRosterProps) {
  const slots = rosterSlots(
    match,
    players,
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  );

  const hasData =
    slots.homeA || slots.homeB || slots.awayA || slots.awayB;
  if (!hasData) return null;

  return (
    <div
      className={`space-y-3 ${dividerBelow ? "border-b border-sand-hunter/40 pb-3" : ""}`}
    >
      <div className="grid grid-cols-2 gap-3">
        {homeTeam ? (
          <p
            className="truncate text-[10px] font-bold uppercase tracking-wide"
            style={{ color: homeTeam.color }}
          >
            {homeTeam.name}
          </p>
        ) : (
          <span />
        )}
        {awayTeam ? (
          <p
            className="truncate text-right text-[10px] font-bold uppercase tracking-wide"
            style={{ color: awayTeam.color }}
          >
            {awayTeam.name}
          </p>
        ) : null}
      </div>
      <CrossPairRow left={slots.homeA} right={slots.awayA} />
      <CrossPairRow left={slots.homeB} right={slots.awayB} />
    </div>
  );
}

export function matchFoursomeRosterHasData(
  match: WeeklyMatch,
  players: Player[],
): boolean {
  const slots = rosterSlots(
    match,
    players,
    match.teamPairing.homeTeamId,
    match.teamPairing.awayTeamId,
  );
  return !!(slots.homeA || slots.homeB || slots.awayA || slots.awayB);
}
