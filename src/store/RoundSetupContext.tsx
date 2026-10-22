import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RoundSetup } from "../types";

interface RoundSetupContextValue {
  setup: RoundSetup | null;
  setSetup: (setup: RoundSetup | null) => void;
}

const RoundSetupContext = createContext<RoundSetupContextValue | null>(null);

export function RoundSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetupState] = useState<RoundSetup | null>(null);
  const setSetup = useCallback((next: RoundSetup | null) => {
    setSetupState(next);
  }, []);

  const value = useMemo(
    () => ({ setup, setSetup }),
    [setup, setSetup],
  );

  return (
    <RoundSetupContext.Provider value={value}>
      {children}
    </RoundSetupContext.Provider>
  );
}

export function useRoundSetup() {
  const ctx = useContext(RoundSetupContext);
  if (!ctx) {
    throw new Error("useRoundSetup must be used within RoundSetupProvider");
  }
  return ctx;
}
