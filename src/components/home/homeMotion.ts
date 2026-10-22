/** Keep in sync with `.home-logo-in` duration in `index.css`. */
export const HOME_LOGO_ANIM_MS = 950;

/** Keep in sync with `.home-rise-in` duration in `index.css`. */
export const HOME_CARD_RISE_MS = 720;

export const HOME_CARD_STAGGER_MS = 110;

/** Cards begin after the logo animation finishes. */
export const HOME_CARD_BASE_DELAY_MS = HOME_LOGO_ANIM_MS;

/** Once per full app load (until refresh); survives tab navigation. */
let homeEntrancePlayed = false;

export function shouldPlayHomeEntrance(): boolean {
  return !homeEntrancePlayed;
}

export function markHomeEntrancePlayed(): void {
  homeEntrancePlayed = true;
}
