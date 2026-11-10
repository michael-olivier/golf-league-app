import { Bell, BellDot } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppNotifications } from "../../hooks/useAppNotifications";

interface AppNotificationBellProps {
  useLightIcon: boolean;
  /** Room for the mobile menu button to the right of the bell. */
  reserveMenuSpace: boolean;
}

export function AppNotificationBell({
  useLightIcon,
  reserveMenuSpace,
}: AppNotificationBellProps) {
  const { pathname } = useLocation();
  const { hasNotifications, items } = useAppNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const anchorStyle = {
    top: "max(10px, env(safe-area-inset-top))",
    right: reserveMenuSpace
      ? "max(4.25rem, calc(0.75rem + 3.5rem))"
      : "max(12px, env(safe-area-inset-right))",
  } as const;

  const iconClass = useLightIcon
    ? "text-white drop-shadow-[0_1px_3px_rgb(0_0_0_/0.5)] hover:bg-white/10 active:bg-white/10"
    : "text-sand-hunter hover:bg-fairway-950/5 active:bg-fairway-950/5";

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close notifications"
          className="absolute inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="absolute z-40" style={anchorStyle}>
        <button
          type="button"
          onClick={() => setOpen((was) => !was)}
          aria-label={
            hasNotifications
              ? `${items.length} notification${items.length === 1 ? "" : "s"}`
              : "Notifications"
          }
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`flex h-14 w-14 items-center justify-center rounded-full transition ${iconClass}`}
        >
          {hasNotifications ? (
            <BellDot
              aria-hidden
              className="h-6 w-6 [&_circle]:fill-sand-brick [&_circle]:stroke-sand-brick"
              strokeWidth={1.5}
            />
          ) : (
            <Bell aria-hidden className="h-6 w-6" strokeWidth={1.5} />
          )}
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full mt-1 w-[min(17rem,calc(100vw-2rem))] rounded-[8px] border border-sand-hunter bg-white p-3 shadow-[0_8px_24px_rgb(0_0_0_/0.12)]"
          >
            <p className="card-title mb-2">Notifications</p>
            {items.length === 0 ? (
              <p className="text-sm text-fairway-500">You&apos;re all caught up.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg border border-sand-hunter/40 bg-fairway-950/[0.02] px-3 py-2.5 text-sm font-medium text-fairway-300 transition hover:bg-sand-hunter/5"
                    >
                      {item.message}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
