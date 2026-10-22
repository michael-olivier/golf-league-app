import {
  Birdhouse,
  LandPlot,
  Pencil,
  ScrollText,
  Settings,
} from "lucide-react";

const navIconClass = "h-6 w-6 shrink-0";

const lucideNavProps = {
  strokeWidth: 0.5,
  "aria-hidden": true as const,
};

export function NavHomeIcon({ className = navIconClass }: { className?: string }) {
  return <Birdhouse className={className} {...lucideNavProps} />;
}

export function NavLeagueIcon({ className = navIconClass }: { className?: string }) {
  return <LandPlot className={className} {...lucideNavProps} />;
}

export function NavScoreIcon({ className = navIconClass }: { className?: string }) {
  return <Pencil className={className} {...lucideNavProps} />;
}

export function NavRulesIcon({ className = navIconClass }: { className?: string }) {
  return <ScrollText className={className} {...lucideNavProps} />;
}

export function NavSettingsIcon({ className = navIconClass }: { className?: string }) {
  return <Settings className={className} {...lucideNavProps} />;
}
