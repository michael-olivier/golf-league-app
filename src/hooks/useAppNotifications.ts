import { useMakeupAttention } from "./useMakeupAttention";
import { useLeague } from "../store/LeagueContext";

export type AppNotificationItem = {
  id: string;
  message: string;
  to: string;
};

export function useAppNotifications(): {
  hasNotifications: boolean;
  items: AppNotificationItem[];
} {
  const { getPostponedMatchesForTeam } = useLeague();
  const { openMakeupCount, attentionCount } = useMakeupAttention();
  const postponedCount = getPostponedMatchesForTeam().length;

  const items: AppNotificationItem[] = [];

  if (openMakeupCount > 0) {
    items.push({
      id: "makeup-coordinate",
      message: `${openMakeupCount} makeup date${openMakeupCount === 1 ? "" : "s"} to coordinate`,
      to: "/makeup",
    });
  }

  if (postponedCount > 0) {
    items.push({
      id: "makeup-postponed",
      message:
        postponedCount === 1
          ? "Schedule a postponed match"
          : `${postponedCount} postponed matches need scheduling`,
      to: "/makeup",
    });
  }

  return {
    hasNotifications: attentionCount > 0,
    items,
  };
}
