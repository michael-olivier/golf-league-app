import {
  CalendarClock,
  CalendarDays,
  PieChart,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const tiles = [
  {
    to: "/league/matches",
    label: "Previous matches",
    description: "View scored matches",
    icon: CalendarDays,
  },
  {
    to: "/makeup",
    label: "Makeup dates",
    description: "Reschedule matches",
    icon: CalendarClock,
  },
  {
    to: "/roster",
    label: "Rosters",
    description: "Teams and player details",
    icon: Users,
  },
  {
    to: "/handicaps",
    label: "Handicaps",
    description: "GHIN handicap indexes",
    icon: PieChart,
  },
] as const;

const tileLinkClass =
  "app-glass-card league-nav-tile border border-white/60";

export function LeagueNavTileGrid() {
  return (
    <div className="league-nav-grid grid grid-cols-2 gap-2">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Link key={tile.to} to={tile.to} className={tileLinkClass}>
            <Icon aria-hidden className="league-nav-tile__icon" strokeWidth={1} />
            <p className="league-nav-tile__label">{tile.label}</p>
            <p className="league-nav-tile__description">{tile.description}</p>
          </Link>
        );
      })}
      <Link
        to="/leagues/find"
        className={`${tileLinkClass} col-span-2`}
      >
        <Trophy aria-hidden className="league-nav-tile__icon" strokeWidth={1} />
        <p className="league-nav-tile__label">Find leagues</p>
        <p className="league-nav-tile__description">
          Find leagues in your area
        </p>
      </Link>
    </div>
  );
}
