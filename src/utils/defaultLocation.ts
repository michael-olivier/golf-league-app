import type { GeoCoords } from "./userLocationLabel";

/** Downtown Denver — used when GPS is unavailable (demo / testing). */
export const DENVER_FALLBACK_COORDS: GeoCoords = {
  lat: 39.7392,
  lng: -104.9903,
};

export const DENVER_FALLBACK_LABEL = "Denver, CO";

export const BROWSER_LOCATION_HELP = [
  "Use https:// or localhost — location does not work on insecure pages.",
  "Chrome / Edge: lock or tune icon in the address bar → Site settings → Location → Allow, then reload.",
  "Safari (Mac): Safari → Settings → Websites → Location → allow this site.",
  "iPhone/iPad: Settings → Safari → Location (or Settings → Privacy → Location Services).",
  "If you previously chose Don't Allow, reset permission for this site in browser settings, then tap Update on the Score tab.",
  "Some in-app preview browsers never expose GPS — open the app in Safari or Chrome to test real location.",
] as const;
