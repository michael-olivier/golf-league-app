import { Link } from "react-router-dom";
import { PageTitleSection } from "../components/PageTitleSection";
import { Switch } from "../components/Switch";
import { useLeague } from "../store/LeagueContext";
import {
  describeLocationForUser,
  useLocationPreferences,
  type GeolocationStatus,
} from "../store/LocationPreferencesContext";
import { formatCoordsLabel } from "../utils/userLocationLabel";

function locationStatusLabel(
  enabled: boolean,
  geoStatus: GeolocationStatus,
  description: string | null,
): string {
  if (!enabled) return "Off";
  if (description) return description;
  switch (geoStatus) {
    case "ready":
      return "On — using your location";
    case "loading":
      return "On — checking device GPS…";
    default:
      return "On";
  }
}

export function SettingsPage() {
  const { state, currentPlayer } = useLeague();
  const locationPrefs = useLocationPreferences();
  const {
    locationServicesEnabled,
    setLocationServicesEnabled,
    geoStatus,
    coords,
    requestLocation,
  } = locationPrefs;
  const locationDescription = describeLocationForUser(locationPrefs);
  const showAdmin = state.role === "admin";

  const links = [
    {
      to: "/handicaps",
      label: "GHIN handicaps",
      description: "View indexes for you and your group",
    },
    {
      to: "/roster",
      label: "League roster",
      description: "Teams and players",
    },
    {
      to: "/makeup",
      label: "Makeup dates",
      description: "Reschedule postponed matches",
    },
    ...(showAdmin
      ? [{ to: "/admin", label: "Admin", description: "Matches and foursomes" }]
      : []),
  ];

  return (
    <div className="space-y-4 pb-4">
      <PageTitleSection title="Settings">
        <p className="text-sm text-fairway-400">
          Signed in as{" "}
          <span className="text-fairway-200">{currentPlayer.name}</span>
        </p>
      </PageTitleSection>

      <section className="rounded-xl border border-fairway-800 bg-fairway-900/40 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-fairway-200">Location services</p>
            <p className="mt-0.5 text-xs text-fairway-500">
              Sort course search results nearest to you first on the Score tab.
            </p>
            <p className="mt-2 text-xs text-fairway-400">
              {locationStatusLabel(
                locationServicesEnabled,
                geoStatus,
                locationServicesEnabled ? locationDescription : null,
              )}
            </p>
            {locationServicesEnabled && coords && (
              <p className="mt-1 font-mono text-[10px] text-fairway-600">
                {formatCoordsLabel(coords)}
              </p>
            )}
            {locationServicesEnabled && (
              <button
                type="button"
                onClick={() => requestLocation({ force: true })}
                className="mt-2 text-xs font-medium text-fairway-400 underline"
              >
                Update location
              </button>
            )}
          </div>
          <Switch
            checked={locationServicesEnabled}
            aria-label="Location services"
            onChange={setLocationServicesEnabled}
          />
        </div>
      </section>

      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block rounded-xl border border-fairway-800 bg-fairway-900/40 px-4 py-3 transition hover:border-fairway-600"
            >
              <span className="font-medium text-fairway-200">{item.label}</span>
              <span className="mt-0.5 block text-xs text-fairway-500">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
