import { Link } from "react-router-dom";
import { HomeHeroBackdrop } from "../components/home/HomeHeroHeader";
import { PageTitleSection } from "../components/PageTitleSection";
import { assetUrl } from "../utils/assetUrl";
import { Switch } from "../components/Switch";
import { useLeague } from "../store/LeagueContext";
import {
  describeLocationForUser,
  useLocationPreferences,
  type GeolocationStatus,
} from "../store/LocationPreferencesContext";
import { formatCoordsLabel } from "../utils/userLocationLabel";

const settingsCardClass =
  "app-glass-card rounded-xl border border-white/60 px-4 py-3";

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

  const settingsHeroUrl = assetUrl("photos/settings-golf-aerial.jpg");

  return (
    <div className="relative -mx-4 flex min-h-0 flex-1 flex-col">
      <HomeHeroBackdrop imageUrl={settingsHeroUrl} />

      <div className="relative z-10 space-y-4 px-4 pb-4 pt-[var(--page-top-inset)]">
        <PageTitleSection title="Settings">
          <p className="text-sm">
            Signed in as{" "}
            <span className="font-medium text-white">{currentPlayer.name}</span>
          </p>
        </PageTitleSection>

        <section className={settingsCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="app-glass-card__title">Location services</p>
              <p className="app-glass-card__body mt-0.5">
                Sort course search results nearest to you first on the Score tab.
              </p>
              <p className="app-glass-card__body mt-2">
                {locationStatusLabel(
                  locationServicesEnabled,
                  geoStatus,
                  locationServicesEnabled ? locationDescription : null,
                )}
              </p>
              {locationServicesEnabled && coords && (
                <p className="app-glass-card__mono mt-1">
                  {formatCoordsLabel(coords)}
                </p>
              )}
              {locationServicesEnabled && (
                <button
                  type="button"
                  onClick={() => requestLocation({ force: true })}
                  className="app-glass-card__action mt-2"
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
              <Link to={item.to} className={settingsCardClass}>
                <span className="app-glass-card__title">{item.label}</span>
                <span className="app-glass-card__body mt-0.5 block">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
