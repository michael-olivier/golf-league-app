import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useMakeupAttention } from "../../hooks/useMakeupAttention";

type MakeupUrgentBannerProps = {
  /** Home uses hunter green; league tab uses light sand background. */
  surface: "hunter" | "light";
};

export function MakeupUrgentBanner({ surface }: MakeupUrgentBannerProps) {
  const { openMakeupCount, attentionCount } = useMakeupAttention();

  if (attentionCount === 0) return null;

  const surfaceClass =
    surface === "hunter"
      ? "border-2 border-sand-brick bg-sand-champagne text-sand-brick shadow-[0_2px_12px_rgb(0_0_0_/0.12)]"
      : "border border-sand-brick/35 bg-sand-brick/10 text-sand-brick";

  return (
    <Link
      to="/makeup"
      className={`flex items-center rounded-[8px] px-4 py-3.5 text-sm font-semibold ${surfaceClass}`}
    >
      <TriangleAlert
        aria-hidden
        className="h-4 w-4 shrink-0 text-sand-brick"
        strokeWidth={1}
      />
      <span className="min-w-0 pl-2.5">
        {openMakeupCount > 0
          ? `${openMakeupCount} makeup date${openMakeupCount === 1 ? "" : "s"} to coordinate`
          : "Schedule a postponed match"}
      </span>
    </Link>
  );
}
