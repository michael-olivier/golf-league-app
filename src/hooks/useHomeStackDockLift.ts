import { useLayoutEffect, useMemo, useState } from "react";
import { estimateLeagueDockLiftPx } from "../components/home/homeStackMetrics";

function readHostHeight(dockRef: React.RefObject<HTMLElement | null>): number {
  return dockRef.current?.parentElement?.clientHeight ?? 0;
}

export function useHomeStackDockLift(
  expandedStack: "recent" | "league" | null,
  leagueItemCount: number,
  dockRef: React.RefObject<HTMLElement | null>,
): number {
  const [hostHeightPx, setHostHeightPx] = useState(0);

  useLayoutEffect(() => {
    const host = dockRef.current?.parentElement;
    if (!host) {
      setHostHeightPx(0);
      return;
    }

    const sync = () => setHostHeightPx(host.clientHeight);
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(host);
    return () => ro.disconnect();
  }, [dockRef]);

  return useMemo(() => {
    if (expandedStack !== "league") return 0;
    const height = readHostHeight(dockRef) || hostHeightPx;
    if (height === 0) return 0;
    return estimateLeagueDockLiftPx(height, leagueItemCount);
  }, [expandedStack, hostHeightPx, leagueItemCount, dockRef]);
}
