import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Daytime (local) uses light theme; evening and night use dark. */
export function themeFromLocalTime(date = new Date()): ThemeMode {
  const hour = date.getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => themeFromLocalTime());

  useEffect(() => {
    const sync = () => setMode(themeFromLocalTime());
    sync();
    const interval = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const value = useMemo(() => ({ mode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
