import { Outlet, useLocation } from "react-router-dom";
import { useIsMobileNative } from "../hooks/useShowDeviceFrame";
import {
  isImmersiveScorePath,
  isLeagueHeroPath,
  pageBackgroundClass,
} from "../utils/pageBackground";
import { AppChromeLayer } from "./AppChromeLayer";
import { AppNotificationBell } from "./notifications/AppNotificationBell";
import { AppBottomNav } from "./nav/AppBottomNav";
import { MobileAppNav } from "./nav/MobileAppNav";
import {
  hideBottomNavForPath,
  navMenuUsesLightIcon,
} from "./nav/navConfig";

export function Layout() {
  const { pathname } = useLocation();
  const isMobileNative = useIsMobileNative();
  const pageBg = pageBackgroundClass(pathname);
  const homePage = pathname === "/";
  const settingsPage =
    pathname === "/settings" || pathname.startsWith("/settings/");
  const leagueHeroPage = isLeagueHeroPath(pathname);
  const immersiveScorePage = isImmersiveScorePath(pathname);
  const scoreSetupPage =
    pathname === "/scores" || pathname.startsWith("/scores/setup");
  const hideBottomNav = hideBottomNavForPath(pathname);

  const useLightChrome = navMenuUsesLightIcon(pathname);

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col ${hideBottomNav ? "" : "has-app-bottom-nav"}`}
    >
      <AppChromeLayer>
        <AppNotificationBell
          useLightIcon={useLightChrome}
          reserveMenuSpace={isMobileNative}
        />
        {isMobileNative && hideBottomNav ? (
          <MobileAppNav pathname={pathname} useLightIcon={useLightChrome} />
        ) : null}
      </AppChromeLayer>

      <main
        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 ${pageBg}`}
      >
        <div
          className={`page-scroll relative z-10 flex min-h-0 min-w-0 flex-1 flex-col ${immersiveScorePage ? "overflow-hidden px-0 !pb-0" : scoreSetupPage ? "overflow-hidden px-4 !pb-0" : "px-4"} ${homePage ? "!overflow-hidden !pt-0 !pb-0 bg-sand-hunter" : settingsPage || leagueHeroPage ? "!pt-0 bg-sand-hunter" : pageBg}`}
        >
          <Outlet />
        </div>
      </main>

      {!hideBottomNav ? <AppBottomNav pathname={pathname} /> : null}
    </div>
  );
}
