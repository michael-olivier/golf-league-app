export type PageBackgroundTone =
  | "home"
  | "league"
  | "casual-score"
  | "rules"
  | "settings";

function isCasualScorePath(pathname: string): boolean {
  return (
    pathname === "/scores" ||
    pathname.startsWith("/scores/setup") ||
    pathname.startsWith("/scores/entry")
  );
}

/** League or casual hole-by-hole scoring (full-height layout). */
export function isImmersiveScorePath(pathname: string): boolean {
  return (
    pathname === "/scores/league" || pathname.startsWith("/scores/entry")
  );
}

function isLeaguePath(pathname: string): boolean {
  if (pathname === "/league" || pathname.startsWith("/league/")) return true;
  if (pathname === "/scores/league") return true;
  if (pathname === "/makeup") return true;
  if (pathname === "/handicaps") return true;
  if (pathname === "/roster") return true;
  if (pathname.startsWith("/contact/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return false;
}

export function pageBackgroundTone(
  pathname: string,
): PageBackgroundTone | null {
  if (pathname === "/") return "home";
  if (isLeaguePath(pathname)) return "league";
  if (isCasualScorePath(pathname)) return "casual-score";
  if (pathname === "/rules" || pathname.startsWith("/rules/")) return "rules";
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return "settings";
  }
  return null;
}

const toneBgClass: Record<PageBackgroundTone, string> = {
  home: "bg-sand-hunter",
  league: "bg-sand-sage",
  "casual-score": "bg-sand-score-mist",
  rules: "bg-sand-vanilla-custard",
  settings: "bg-sand-champagne",
};

export function pageBackgroundClass(pathname: string): string {
  const tone = pageBackgroundTone(pathname);
  return tone ? toneBgClass[tone] : "bg-sand-bg";
}

/** White menu icon on darker page backgrounds. */
export function navMenuUsesLightIcon(pathname: string): boolean {
  const tone = pageBackgroundTone(pathname);
  return tone === "home" || tone === "league";
}

