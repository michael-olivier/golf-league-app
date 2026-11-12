import { SquareMenu } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { isNavItemActive, navItems } from "./navConfig";

interface MobileAppNavProps {
  pathname: string;
  useLightIcon: boolean;
}

export function MobileAppNav({ pathname, useLightIcon }: MobileAppNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const anchorStyle = {
    top: "max(10px, env(safe-area-inset-top))",
    right: "max(12px, env(safe-area-inset-right))",
  } as const;

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="absolute z-40" style={anchorStyle}>
        <button
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`flex h-14 w-14 items-center justify-center rounded-[8px] transition active:opacity-80 ${
            useLightIcon
              ? "text-white drop-shadow-[0_1px_3px_rgb(0_0_0_/0.5)] hover:bg-white/10"
              : "text-sand-hunter hover:bg-fairway-950/5"
          }`}
        >
          <SquareMenu className="h-9 w-9" strokeWidth={1} aria-hidden />
        </button>

        {open ? (
          <nav
            role="menu"
            aria-label="App menu"
            className="absolute right-0 top-full mt-1 w-[17rem] rounded-[8px] border border-sand-hunter bg-white p-2 shadow-[0_8px_24px_rgb(0_0_0_/0.12)]"
          >
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const active = isNavItemActive(pathname, item.to);
                return (
                  <li key={item.to} role="none">
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-sand-hunter/10 text-sand-hunter"
                          : "text-fairway-300 hover:bg-fairway-950/5"
                      }`}
                    >
                      <item.Icon className="h-6 w-6" />
                      <span className="tracking-wide">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </>
  );
}
