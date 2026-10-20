import { NavLink, Outlet } from "react-router-dom";
import { useLeague } from "../store/LeagueContext";

const navItems = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/scores", label: "Score", icon: "✎" },
  { to: "/handicaps", label: "GHIN", icon: "◎" },
  { to: "/rules", label: "Rules", icon: "§" },
];

export function Layout() {
  const { state, currentPlayer } = useLeague();
  const showAdmin = state.role === "admin";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 shrink-0 border-b border-fairway-800/80 bg-fairway-900/95 px-4 pb-3 pt-10 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <NavLink
              to="/"
              className="text-xs font-medium uppercase tracking-wider text-fairway-400 transition hover:text-fairway-200"
            >
              {state.league.name}
            </NavLink>
            <h1 className="text-lg font-semibold text-fairway-200">
              {currentPlayer.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {showAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-fairway-600 text-white"
                      : "border border-fairway-800 bg-fairway-950 text-fairway-300 hover:border-fairway-600"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <Outlet />
      </main>

      <nav className="z-20 shrink-0 border-t border-fairway-800/80 bg-fairway-900/95 backdrop-blur">
        <div className="flex justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition ${
                  isActive
                    ? "bg-fairway-100 text-fairway-200"
                    : "text-fairway-400 hover:text-fairway-200"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
