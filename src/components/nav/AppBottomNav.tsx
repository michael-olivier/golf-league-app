import { NavLink } from "react-router-dom";
import { navMenuUsesLightIcon } from "../../utils/pageBackground";
import { isNavItemActive, navItems } from "./navConfig";

interface AppBottomNavProps {
  pathname: string;
}

export function AppBottomNav({ pathname }: AppBottomNavProps) {
  const onDark = navMenuUsesLightIcon(pathname);

  return (
    <nav
      className={`app-bottom-nav ${onDark ? "app-bottom-nav--on-dark" : ""}`}
      aria-label="Main"
    >
      <div className="glass-floating-pill app-bottom-nav-pill border border-white/30">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              aria-current={active ? "page" : undefined}
              className={`app-bottom-nav-item ${active ? "is-active" : ""}`}
            >
              <item.Icon className="app-bottom-nav-icon" />
              <span className="app-bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
