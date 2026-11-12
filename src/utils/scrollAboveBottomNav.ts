const EXTRA_GAP_PX = 12;
const EXPAND_DURATION_MS = 320;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Top edge of the floating home bottom nav in viewport coordinates. */
export function homeBottomNavTop(): number {
  const nav = document.querySelector(".app-bottom-nav");
  if (nav instanceof HTMLElement) {
    const top = nav.getBoundingClientRect().top;
    if (Number.isFinite(top) && top > 0) return top;
  }

  const scroller = document.querySelector(".home-figma-stack");
  if (scroller instanceof HTMLElement) {
    const pad = parseFloat(getComputedStyle(scroller).paddingBottom);
    if (Number.isFinite(pad) && pad > 0) {
      return scroller.getBoundingClientRect().bottom - pad;
    }
  }

  return window.innerHeight - 92;
}

/** Match `.home-pass-expand` grid row easing. */
function expandEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}

function resolveExpandEl(
  blockEl: HTMLElement,
  expandSelector?: string,
): HTMLElement | null {
  if (expandSelector) {
    const byId = document.querySelector(expandSelector);
    if (byId instanceof HTMLElement) return byId;
  }
  const closest = blockEl.querySelector(".home-pass-expand");
  return closest instanceof HTMLElement ? closest : null;
}

/** Scroll in parallel with the pass-card expand animation (same 320ms ease). */
function scrollWithHomePassExpand(
  blockEl: HTMLElement,
  expandEl: HTMLElement,
): void {
  const scroller = blockEl.closest(".home-figma-stack");
  if (!(scroller instanceof HTMLElement)) return;

  const safeBottom = homeBottomNavTop() - EXTRA_GAP_PX;
  const startBottom = blockEl.getBoundingClientRect().bottom;
  const inner = expandEl.querySelector(".home-pass-expand__inner");
  const grow = inner instanceof HTMLElement ? inner.scrollHeight : 0;
  const scrollDelta = Math.max(0, startBottom + grow - safeBottom);

  if (scrollDelta <= 1) return;

  const startScroll = scroller.scrollTop;
  const targetScroll = startScroll + scrollDelta;

  if (prefersReducedMotion()) {
    scroller.scrollTop = targetScroll;
    return;
  }

  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / EXPAND_DURATION_MS);
    scroller.scrollTop = startScroll + scrollDelta * expandEase(t);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function scrollBlockBottomAboveNav(
  blockEl: HTMLElement,
  behavior: ScrollBehavior,
): void {
  const scroller = blockEl.closest(".home-figma-stack");
  if (!(scroller instanceof HTMLElement)) {
    blockEl.scrollIntoView({ behavior, block: "end" });
    return;
  }

  const safeBottom = homeBottomNavTop() - EXTRA_GAP_PX;
  const blockBottom = blockEl.getBoundingClientRect().bottom;
  const delta = blockBottom - safeBottom;

  if (delta > 1) {
    scroller.scrollBy({ top: delta, behavior });
  }
}

/**
 * Scroll so an expanded home pass card stays above the bottom nav.
 * When `expandSelector` is set, scroll runs in sync with the expand animation.
 */
export function scrollEndAboveBottomNav(
  blockEl: HTMLElement,
  options?: { expandSelector?: string },
): void {
  const expandEl = resolveExpandEl(blockEl, options?.expandSelector);

  requestAnimationFrame(() => {
    if (expandEl) {
      scrollWithHomePassExpand(blockEl, expandEl);
      return;
    }
    scrollBlockBottomAboveNav(
      blockEl,
      prefersReducedMotion() ? "auto" : "smooth",
    );
  });
}
