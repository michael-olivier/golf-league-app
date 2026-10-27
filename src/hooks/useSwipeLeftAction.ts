import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

const MIN_SWIPE_PX = 56;
const AXIS_LOCK_PX = 10;

type Point = { x: number; y: number };

/** Fire `onAction` when the user swipes left on `targetRef`. */
export function useSwipeLeftAction(
  onAction: () => void,
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const start = useRef<Point | null>(null);
  const axis = useRef<"horizontal" | "vertical" | null>(null);
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const reset = useCallback(() => {
    start.current = null;
    axis.current = null;
  }, []);

  const lockAxis = useCallback((dx: number, dy: number) => {
    if (axis.current) return axis.current;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return null;
    axis.current =
      Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    return axis.current;
  }, []);

  const finishSwipe = useCallback(
    (dx: number, dy: number) => {
      const wasHorizontal = axis.current === "horizontal";
      reset();
      if (!wasHorizontal) return;
      if (dx > -MIN_SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
      onActionRef.current();
    },
    [reset],
  );

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      if (lockAxis(dx, dy) === "horizontal") e.preventDefault();
    };

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [targetRef, lockAxis, enabled]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY };
      axis.current = null;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabled || !start.current || !e.isPrimary) return;
      lockAxis(e.clientX - start.current.x, e.clientY - start.current.y);
    },
    [enabled, lockAxis],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabled || !start.current) return;
      finishSwipe(e.clientX - start.current.x, e.clientY - start.current.y);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [enabled, finishSwipe],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent) => {
      reset();
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [reset],
  );

  return enabled
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
      }
    : {};
}
