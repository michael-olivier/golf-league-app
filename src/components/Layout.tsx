import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  NavHomeIcon,
  NavLeagueIcon,
  NavRulesIcon,
  NavScoreIcon,
  NavSettingsIcon,
} from "./nav/NavIcons";

const navItems = [
  { to: "/", label: "Home", Icon: NavHomeIcon },
  { to: "/league", label: "League", Icon: NavLeagueIcon },
  { to: "/scores", label: "Score", Icon: NavScoreIcon },
  { to: "/rules", label: "Rules", Icon: NavRulesIcon },
  { to: "/settings", label: "Settings", Icon: NavSettingsIcon },
] as const;

function isNavItemActive(pathname: string, to: string): boolean {
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

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent px-4 pb-0">
        <div className="page-scroll flex min-w-0 flex-col">
          <Outlet />
        </div>
      </main>

      <nav className="z-20 shrink-0 border-t border-sand-hunter bg-fairway-900/95 backdrop-blur">
        <div className="flex justify-around px-3 pt-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={() => {
                const active = isNavItemActive(pathname, item.to);
                return `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium transition ${
                  active
                    ? "bg-fairway-100 text-fairway-200"
                    : "text-fairway-400 hover:text-fairway-200"
                }`;
              }}
            >
              <item.Icon />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
