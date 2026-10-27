import type { ComponentType } from "react";
import {
  NavHomeIcon,
  NavLeagueIcon,
  NavRulesIcon,
  NavScoreIcon,
  NavSettingsIcon,
} from "./NavIcons";

export const navItems = [
  { to: "/", label: "Home", Icon: NavHomeIcon },
  { to: "/league", label: "League", Icon: NavLeagueIcon },
  { to: "/scores", label: "Score", Icon: NavScoreIcon },
  { to: "/rules", label: "Rules", Icon: NavRulesIcon },
  { to: "/settings", label: "Settings", Icon: NavSettingsIcon },
] as const satisfies ReadonlyArray<{
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}>;

/** Full-screen score entry (no bottom tab bar). */
export function hideBottomNavForPath(pathname: string): boolean {
  return (
    pathname === "/scores/league" || pathname.startsWith("/scores/entry")
  );
}

export function isNavItemActive(pathname: string, to: string): boolean {
  if (to === "/") {
    return pathname === "/";
  }
  if (to === "/scores") {
    if (pathname === "/scores/league") return false;
    return (
      pathname === "/scores" ||
      pathname.startsWith("/scores/setup") ||
      pathname.startsWith("/scores/entry")
    );
  }
  if (to === "/league") {
    return (
      pathname === "/league" ||
      pathname.startsWith("/league/") ||
      pathname === "/scores/league"
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export { navMenuUsesLightIcon } from "../../utils/pageBackground";
