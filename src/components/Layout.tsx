import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useIsMobileNative } from "../hooks/useShowDeviceFrame";
import {
  isImmersiveScorePath,
  pageBackgroundClass,
} from "../utils/pageBackground";
import { AppChromeLayer } from "./AppChromeLayer";
import { AppNotificationBell } from "./notifications/AppNotificationBell";
import { MobileAppNav } from "./nav/MobileAppNav";
import {
  hideBottomNavForPath,
  isNavItemActive,
  navItems,
  navMenuUsesLightIcon,
} from "./nav/navConfig";

export function Layout() {
  const { pathname } = useLocation();
  const isMobileNative = useIsMobileNative();
  const pageBg = pageBackgroundClass(pathname);
  const homePage = pathname === "/";
  const immersiveScorePage = isImmersiveScorePath(pathname);
  const scoreSetupPage =
    pathname === "/scores" || pathname.startsWith("/scores/setup");
  const hideBottomNav = hideBottomNavForPath(pathname);

  const useLightChrome = navMenuUsesLightIcon(pathname);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <AppChromeLayer>
        <AppNotificationBell
          useLightIcon={useLightChrome}
          reserveMenuSpace={isMobileNative}
        />
        {isMobileNative ? (
          <MobileAppNav pathname={pathname} useLightIcon={useLightChrome} />
        ) : null}
      </AppChromeLayer>

      <main
        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 ${pageBg}`}
      >
        <div
          className={`page-scroll relative z-10 flex min-h-0 min-w-0 flex-1 flex-col ${immersiveScorePage ? "overflow-hidden px-0 !pb-0" : scoreSetupPage ? "overflow-hidden px-4 !pb-0" : "px-4"} ${homePage ? "!overflow-hidden !pt-0 !pb-0 bg-sand-hunter" : pageBg}`}
        >
          <Outlet />
        </div>
      </main>

      {!isMobileNative && !hideBottomNav ? (
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
      ) : null}
    </div>
  );
}
