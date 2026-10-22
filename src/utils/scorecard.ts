import type { HoleScore } from "../types";
import { isDetailedScore } from "../types";

export function formatToPar(toPar: number | null): string {
  if (toPar === null) return "—";
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

/** GIR when strokes to reach the green (total strokes − putts) ≤ par − 2. */
export function greenInRegulationHit(
  par: number,
  strokes: number | null,
  putts: number | null,
): boolean | null {
  if (strokes === null || putts === null) return null;
  if (putts < 0 || putts > strokes) return false;
  return strokes - putts <= par - 2;
}

export function holeToPar(strokes: number | null, par: number): string {
  if (strokes === null) return "—";
  const diff = strokes - par;
  if (diff === 0) return "Par";
  if (diff === -1) return "Birdie";
  if (diff === -2) return "Eagle";
  if (diff <= -3) return `${diff}`;
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Dbl";
  return `+${diff}`;
}

export function statsSummary(scores: HoleScore[], pars: number[]) {
  let gir = 0;
  let fir = 0;
  let putts = 0;
  let puttHoles = 0;
  let penalties = 0;

  scores.forEach((s, i) => {
    if (!isDetailedScore(s)) return;
    const par = pars[i] ?? 4;
    if (greenInRegulationHit(par, s.strokes, s.putts) === true) gir++;
    if (s.fairwayHit === "center") fir++;
    if (s.putts !== null) {
      putts += s.putts;
      puttHoles++;
    }
    penalties += s.penalties;
  });

  return {
    gir,
    fir,
    avgPutts: puttHoles > 0 ? (putts / puttHoles).toFixed(1) : "—",
    penalties,
  };
}
