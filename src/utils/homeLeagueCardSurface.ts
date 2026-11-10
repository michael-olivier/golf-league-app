const MIST = "#eff5e0";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable per-match wash from white into sand-score-mist. */
export function homeLeagueCardGradient(matchId: string): string {
  const seed = hashString(matchId);
  const angle = 35 + (seed % 290);
  const greenStop = 58 + (seed % 28);
  const whiteStop = 8 + ((seed >> 3) % 18);
  return `linear-gradient(${angle}deg, #ffffff ${whiteStop}%, ${MIST} ${greenStop}%, ${MIST} 100%)`;
}
