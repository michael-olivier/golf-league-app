import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";

const MIN_SWIPE_PX = 48;
const AXIS_LOCK_PX = 10;

type Point = { x: number; y: number };

export function useWeekSwipe(
  onPrevious: () => void,
  onNext: () => void,
  targetRef?: RefObject<HTMLElement | null>,
) {
  const start = useRef<Point | null>(null);
  const axis = useRef<"horizontal" | "vertical" | null>(null);
  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);

  onPreviousRef.current = onPrevious;
  onNextRef.current = onNext;

  const reset = useCallback(() => {
    start.current = null;
    axis.current = null;
  }, []);

  const lockAxis = useCallback((dx: number, dy: number) => {
    if (axis.current) return axis.current;
    if (
      Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX
    ) {
      return null;
    }
    axis.current =
      Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    return axis.current;
  }, []);

  const finishSwipe = useCallback((dx: number, dy: number) => {
    const wasHorizontal = axis.current === "horizontal";
    reset();
    if (!wasHorizontal) return;
    if (Math.abs(dx) < MIN_SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNextRef.current();
    else onPreviousRef.current();
  }, [reset]);

  useEffect(() => {
    const el = targetRef?.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      const locked = lockAxis(dx, dy);
      if (locked === "horizontal") e.preventDefault();
    };

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [targetRef, lockAxis]);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!start.current || !e.isPrimary) return;
      lockAxis(e.clientX - start.current.x, e.clientY - start.current.y);
    },
    [lockAxis],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      finishSwipe(dx, dy);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [finishSwipe],
  );

  const onPointerCancel = useCallback((e: ReactPointerEvent) => {
    reset();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [reset]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
