import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DENVER_FALLBACK_COORDS,
  DENVER_FALLBACK_LABEL,
} from "../utils/defaultLocation";
import {
  readLocationServicesEnabled,
  writeLocationServicesEnabled,
} from "../utils/locationPreferences";
import {
  fetchPlaceLabel,
  formatCoordsLabel,
  type GeoCoords,
} from "../utils/userLocationLabel";

export type { GeoCoords };

export type GeolocationStatus = "disabled" | "loading" | "ready";

export type GeolocationErrorKind = "denied" | "timeout" | "unsupported" | null;

interface LocationPreferencesContextValue {
  locationServicesEnabled: boolean;
  setLocationServicesEnabled: (enabled: boolean) => void;
  coords: GeoCoords | null;
  geoStatus: GeolocationStatus;
  geoError: GeolocationErrorKind;
  isFallbackLocation: boolean;
  placeLabel: string | null;
  accuracyM: number | null;
  requestLocation: (options?: { force?: boolean }) => void;
}

const LocationPreferencesContext =
  createContext<LocationPreferencesContextValue | null>(null);

function errorKindFromCode(code: number): GeolocationErrorKind {
  if (code === 1) return "denied";
  if (code === 3) return "timeout";
  return null;
}

function initialDenverEnabled(): boolean {
  return readLocationServicesEnabled();
}

export function LocationPreferencesProvider({ children }: { children: ReactNode }) {
  const [locationServicesEnabled, setEnabledState] = useState(
    readLocationServicesEnabled,
  );
  const [coords, setCoords] = useState<GeoCoords | null>(() =>
    initialDenverEnabled() ? DENVER_FALLBACK_COORDS : null,
  );
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>(() =>
    initialDenverEnabled() ? "ready" : "disabled",
  );
  const [geoError, setGeoError] = useState<GeolocationErrorKind>(null);
  const [isFallbackLocation, setIsFallbackLocation] = useState(false);
  const [placeLabel, setPlaceLabel] = useState<string | null>(() =>
    initialDenverEnabled() ? DENVER_FALLBACK_LABEL : null,
  );
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const geoStatusRef = useRef(geoStatus);
  geoStatusRef.current = geoStatus;

  const applyDenverDefault = useCallback(() => {
    setCoords(DENVER_FALLBACK_COORDS);
    setPlaceLabel(DENVER_FALLBACK_LABEL);
    setAccuracyM(null);
    setIsFallbackLocation(false);
    setGeoError(null);
    setGeoStatus("ready");
  }, []);

  const setLocationServicesEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledState(enabled);
      writeLocationServicesEnabled(enabled);
      if (!enabled) {
        setCoords(null);
        setPlaceLabel(null);
        setAccuracyM(null);
        setGeoError(null);
        setIsFallbackLocation(false);
        setGeoStatus("disabled");
      } else {
        applyDenverDefault();
      }
    },
    [applyDenverDefault],
  );

  /** Optional GPS refresh — app defaults to Denver; Update tries device location. */
  const requestLocation = useCallback(
    (options?: { force?: boolean }) => {
      if (!locationServicesEnabled) return;
      if (!options?.force) return;

      if (!navigator.geolocation) {
        setGeoError("unsupported");
        applyDenverDefault();
        return;
      }

      setGeoStatus("loading");
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(nextCoords);
          setIsFallbackLocation(false);
          setAccuracyM(
            Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
          );
          setPlaceLabel(formatCoordsLabel(nextCoords));
          setGeoStatus("ready");
          setGeoError(null);

          const controller = new AbortController();
          fetchPlaceLabel(nextCoords, controller.signal)
            .then(setPlaceLabel)
            .catch(() => {});
        },
        (error) => {
          setGeoError(errorKindFromCode(error.code));
          applyDenverDefault();
        },
        {
          enableHighAccuracy: false,
          timeout: 8_000,
          maximumAge: 60_000,
        },
      );
    },
    [locationServicesEnabled, applyDenverDefault],
  );

  const value = useMemo(
    () => ({
      locationServicesEnabled,
      setLocationServicesEnabled,
      coords,
      geoStatus,
      geoError,
      isFallbackLocation,
      placeLabel,
      accuracyM,
      requestLocation,
    }),
    [
      locationServicesEnabled,
      setLocationServicesEnabled,
      coords,
      geoStatus,
      geoError,
      isFallbackLocation,
      placeLabel,
      accuracyM,
      requestLocation,
    ],
  );

  return (
    <LocationPreferencesContext.Provider value={value}>
      {children}
    </LocationPreferencesContext.Provider>
  );
}

export function useLocationPreferences() {
  const ctx = useContext(LocationPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useLocationPreferences must be used within LocationPreferencesProvider",
    );
  }
  return ctx;
}

export function getSearchLocationLabel(
  ctx: Pick<
    LocationPreferencesContextValue,
    "locationServicesEnabled" | "geoStatus" | "placeLabel"
  >,
): string {
  if (!ctx.locationServicesEnabled) return "";
  if (ctx.geoStatus === "loading") return "Locating…";
  return ctx.placeLabel ?? DENVER_FALLBACK_LABEL;
}

export function describeLocationForUser(
  ctx: Pick<
    LocationPreferencesContextValue,
    | "coords"
    | "placeLabel"
    | "accuracyM"
    | "geoStatus"
    | "geoError"
    | "locationServicesEnabled"
  >,
): string | null {
  if (!ctx.locationServicesEnabled) return null;
  if (ctx.geoStatus === "loading") return "Checking device location…";
  if (ctx.geoStatus === "ready" && ctx.coords) {
    const place = ctx.placeLabel ?? DENVER_FALLBACK_LABEL;
    if (place === DENVER_FALLBACK_LABEL) {
      return `${DENVER_FALLBACK_LABEL} (default). Tap Update to use device GPS.`;
    }
    if (ctx.accuracyM != null && ctx.accuracyM <= 5000) {
      const miles = ctx.accuracyM / 1609.34;
      const accuracy =
        miles < 0.2
          ? " (~precise)"
          : ` (±${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi)`;
      return `${place}${accuracy}`;
    }
    return place;
  }
  if (ctx.geoError === "denied") {
    return "Device location blocked — using Denver, CO. Allow access in browser settings to update.";
  }
  return DENVER_FALLBACK_LABEL;
}
