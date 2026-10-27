import type { CasualScoringMode, Hole, HoleScore } from "../types";
import { isHolePlayed } from "../types";
export function scoringModeLabel(mode: CasualScoringMode): string {
  switch (mode) {
    case "match_net":
      return "Match (Net)";
    case "match_gross":
      return "Match (Gross)";
    case "stroke":
      return "Stroke";
  }
}

export function normalizeCasualScoringMode(
  value: string | undefined,
): CasualScoringMode {
  if (value === "match_net" || value === "match_gross" || value === "stroke") {
    return value;
  }
  if (value === "match_play") return "match_net";
  if (value === "stroke_play") return "stroke";
  return "stroke";
}

/** Strokes received on a hole from course handicap (WHS stroke allocation). */
export function courseStrokesOnHole(
  courseHandicap: number,
  holeStrokeIndex: number,
  numHoles: 9 | 18,
): number {
  const ch = Math.max(0, Math.round(courseHandicap));
  if (ch <= 0) return 0;
  const base = Math.floor(ch / numHoles);
  const extra = ch % numHoles;
  return base + (holeStrokeIndex <= extra ? 1 : 0);
}

export function grossAndNetTotals(
  scores: HoleScore[],
  holes: Hole[],
  courseHandicap: number,
  holeCount: 9 | 18,
): { gross: number | null; net: number | null } {
  let gross = 0;
  let net = 0;
  let any = false;
  for (let i = 0; i < holes.length; i++) {
    const score = scores[i];
    if (!isHolePlayed(score)) continue;
    any = true;
    const strokes = score.strokes!;
    const pop = courseStrokesOnHole(
      courseHandicap,
      holes[i].handicapIndex,
      holeCount,
    );
    gross += strokes;
    net += strokes - pop;
  }
  if (!any) return { gross: null, net: null };
  return { gross, net };
}

export function netStrokeDisplay(
  scores: HoleScore[],
  holes: Hole[],
  courseHandicap: number,
  holeCount: 9 | 18,
): string {
  const { gross, net } = grossAndNetTotals(
    scores,
    holes,
    courseHandicap,
    holeCount,
  );
  if (gross == null || net == null) return "—";
  return `${gross} (${net} net)`;
}

export function isMatchScoringMode(mode: CasualScoringMode): boolean {
  return mode === "match_net" || mode === "match_gross";
}
