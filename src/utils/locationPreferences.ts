const STORAGE_KEY = "fairway-location-services";

/** Default on — used for nearby course search sorting. */
export function readLocationServicesEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

export function writeLocationServicesEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    /* ignore quota / private mode */
  }
}
