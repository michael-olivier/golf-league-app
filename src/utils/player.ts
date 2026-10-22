import type { Player } from "../types";

export function playerFirstName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? name;
}

/** Tab label: first name, or first name + last initial when first names collide. */
export function playerTabLabels(players: Player[]): Map<string, string> {
  const firstNames = players.map((p) => playerFirstName(p.name));
  const duplicateFirst = new Set<string>();
  const seen = new Map<string, number>();
  for (const first of firstNames) {
    seen.set(first, (seen.get(first) ?? 0) + 1);
    if ((seen.get(first) ?? 0) > 1) duplicateFirst.add(first);
  }

  return new Map(
    players.map((p) => {
      const parts = p.name.trim().split(/\s+/).filter(Boolean);
      const first = parts[0] ?? p.name;
      if (!duplicateFirst.has(first)) {
        return [p.id, first] as const;
      }
      const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";
      return [p.id, lastInitial ? `${first} ${lastInitial}.` : first] as const;
    }),
  );
}

export function leagueNineLabel(nineSide: "front" | "back"): string {
  return nineSide === "front" ? "Front 9" : "Back 9";
}

export function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}
