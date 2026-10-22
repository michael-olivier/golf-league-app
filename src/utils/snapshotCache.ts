/** Stable reference for useSyncExternalStore when JSON-serializable data is unchanged. */
export function cachedJsonSnapshot<T>(key: string, read: () => T): T {
  const cache = snapshotCache.get(key) as { json: string; value: T } | undefined;
  const next = read();
  const json = JSON.stringify(next);
  if (cache && cache.json === json) {
    return cache.value;
  }
  snapshotCache.set(key, { json, value: next });
  return next;
}

const snapshotCache = new Map<string, { json: string; value: unknown }>();
