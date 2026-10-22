import { assetUrl } from "./assetUrl";

/** Roster order is one male + one female per team; index 1 is the female slot. */
export function playerPortraitPath(
  leagueLevel: "A" | "B",
  teamIndex: number,
  playerIndex: number,
): string {
  const portraitNum = (leagueLevel === "A" ? 0 : 20) + teamIndex;
  const folder = playerIndex === 1 ? "women" : "men";
  return assetUrl(`/avatars/${folder}-${portraitNum}.jpg`);
}
