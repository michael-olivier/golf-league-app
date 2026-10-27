import type { TeeBox } from "../types";

const STORAGE_KEY = "fairway-tee-usage-v1";

interface TeeUsageEntry {
  teeName: string;
  yardage: number;
  uses: number;
}

function readUsage(): TeeUsageEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeeUsageEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsage(entries: TeeUsageEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Remember which tee the user picked so future rounds can default intelligently. */
export function recordTeeUsage(tee: TeeBox) {
  const normalized = tee.name.trim().toLowerCase();
  const entries = readUsage();
  const existing = entries.find(
    (e) => e.teeName === normalized && e.yardage === tee.yardage,
  );
  if (existing) {
    existing.uses += 1;
  } else {
    entries.push({ teeName: normalized, yardage: tee.yardage, uses: 1 });
  }
  writeUsage(entries);
}

const DEFAULT_TARGET_YARDAGE = 6000;

function preferredTargetYardage(): number {
  const entries = readUsage();
  if (!entries.length) return DEFAULT_TARGET_YARDAGE;
  let weighted = 0;
  let totalUses = 0;
  for (const e of entries) {
    weighted += e.yardage * e.uses;
    totalUses += e.uses;
  }
  return totalUses > 0 ? Math.round(weighted / totalUses) : DEFAULT_TARGET_YARDAGE;
}

export function sortTeesLongestFirst(tees: TeeBox[]): TeeBox[] {
  return [...tees].sort((a, b) => b.yardage - a.yardage);
}

/** Display label for setup tiles — color only (e.g. White, Gold/White). */
export function formatTeeColorLabel(name: string): string {
  let s = name.trim();
  s = s.replace(/\(\s*\d[\d,]*\s*(yds?|yards?)\s*\)/gi, "");
  s = s.replace(/\b\d[\d,]*\s*(yds?|yards?)\b/gi, "");
  s = s.replace(/\bregular\b/gi, "");
  s = s.replace(/\btees\b/gi, "");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\/\s*/g, "/");
  if (!s) s = name.trim();

  return s
    .split("/")
    .map((part) => {
      const t = part.trim();
      if (!t) return t;
      const lower = t.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .filter(Boolean)
    .join("/");
}

/** Pick the tee whose yardage is closest to the user's typical tee distance. */
export function pickDefaultTeeBox(tees: TeeBox[]): TeeBox | undefined {
  if (!tees.length) return undefined;
  const sorted = sortTeesLongestFirst(tees);
  const target = preferredTargetYardage();
  return sorted.reduce((best, tee) => {
    const bestDelta = Math.abs(best.yardage - target);
    const teeDelta = Math.abs(tee.yardage - target);
    return teeDelta < bestDelta ? tee : best;
  }, sorted[0]);
}
