import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  fetchOpenGolfCoursesBulk,
  formatCourseLocation,
  formatCourseSubtitle,
  searchOpenGolfCourses,
  type OpenGolfCourseCompact,
} from "../../api/openGolfApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFavoriteCourses } from "../../hooks/useFavoriteCourses";
import { useLeague } from "../../store/LeagueContext";
import {
  getSearchLocationLabel,
  useLocationPreferences,
} from "../../store/LocationPreferencesContext";
import {
  MAX_RECENT,
  readRecentCourses,
  rememberCourse,
} from "../../utils/recentCourses";
import { cachedJsonSnapshot } from "../../utils/snapshotCache";
import { BottomSheet } from "../BottomSheet";
import { CourseFavoriteStar } from "../CourseFavoriteStar";

type CourseTab = "nearby" | "recent" | "favorites";

function subscribeRecent(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("fairway-recent-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("fairway-recent-changed", handler);
  };
}

function readRecentSnapshot(): ReturnType<typeof readRecentCourses> {
  return cachedJsonSnapshot("recent-courses", readRecentCourses);
}

function CourseRow({
  course,
  onSelect,
}: {
  course: OpenGolfCourseCompact;
  onSelect: () => void;
}) {
  const subtitle = formatCourseSubtitle(course);
  return (
    <div className="flex items-center gap-1 rounded-xl border border-sand-score-border bg-white pr-2">
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 px-4 py-3 text-left"
      >
        <p className="text-sm font-medium text-fairway-200">
          {course.course_name}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-fairway-500">{subtitle}</p>
        ) : null}
      </button>
      <CourseFavoriteStar
        courseId={course.id}
        courseName={course.course_name}
      />
    </div>
  );
}

interface CourseSearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectCourse: (courseId: string, courseName: string) => void;
}

export function CourseSearchDrawer({
  open,
  onClose,
  onSelectCourse,
}: CourseSearchDrawerProps) {
  const { getCourse } = useLeague();
  const locationPrefs = useLocationPreferences();
  const { coords, locationServicesEnabled, geoStatus } = locationPrefs;
  const locationLabel = getSearchLocationLabel(locationPrefs);
  const { favorites } = useFavoriteCourses();

  const [tab, setTab] = useState<CourseTab>("nearby");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const [nearbyCourses, setNearbyCourses] = useState<OpenGolfCourseCompact[]>(
    [],
);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<OpenGolfCourseCompact[]>(
    [],
);
  const [searching, setSearching] = useState(false);
  const [metaCache, setMetaCache] = useState<OpenGolfCourseCompact[]>([]);

  const recentEntries = useSyncExternalStore(
    subscribeRecent,
    readRecentSnapshot,
    readRecentSnapshot,
  );

  const useCoords =
    locationServicesEnabled && coords != null && geoStatus !== "loading";

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTab("nearby");
  }, [open]);

  useEffect(() => {
    if (!open || !useCoords) return;
    const controller = new AbortController();
    setNearbyLoading(true);
    const cityTerm = locationLabel.split(",")[0]?.trim() || "golf";
    searchOpenGolfCourses(cityTerm, {
      limit: 40,
      signal: controller.signal,
      lat: coords!.lat,
      lng: coords!.lng,
      radiusMi: 80,
    })
      .then(({ courses }) => setNearbyCourses(courses))
      .catch(() => setNearbyCourses([]))
      .finally(() => {
        if (!controller.signal.aborted) setNearbyLoading(false);
      });
    return () => controller.abort();
  }, [open, useCoords, coords, locationLabel]);

  useEffect(() => {
    if (!open || debouncedQuery.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    searchOpenGolfCourses(debouncedQuery, {
      limit: 25,
      signal: controller.signal,
      lat: useCoords ? coords!.lat : undefined,
      lng: useCoords ? coords!.lng : undefined,
    })
      .then(({ courses }) => setSearchResults(courses))
      .catch(() => setSearchResults([]))
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });
    return () => controller.abort();
  }, [open, debouncedQuery, useCoords, coords]);

  useEffect(() => {
    const ids = [
      ...recentEntries.map((e) => e.id),
      ...favorites.map((f) => f.id),
    ].filter((id) => !getCourse(id));
    const unique = [...new Set(ids)];
    if (unique.length === 0) return;
    const controller = new AbortController();
    fetchOpenGolfCoursesBulk(unique, controller.signal)
      .then((courses) =>
        setMetaCache((prev) => {
          const map = new Map(prev.map((c) => [c.id, c]));
          for (const c of courses) map.set(c.id, c);
          return [...map.values()];
        }),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [recentEntries, favorites, getCourse]);

  const recentCourses = useMemo(() => {
    return recentEntries.slice(0, MAX_RECENT).map((entry) => {
      const local = getCourse(entry.id);
      const meta = metaCache.find((c) => c.id === entry.id);
      return {
        id: entry.id,
        course_name: local?.name ?? meta?.course_name ?? entry.name,
        city: meta?.city ?? null,
        state: meta?.state ?? null,
      } satisfies OpenGolfCourseCompact;
    });
  }, [recentEntries, getCourse, metaCache]);

  const favoriteCourses = useMemo(() => {
    return favorites.map((f) => {
      const local = getCourse(f.id);
      const meta = metaCache.find((c) => c.id === f.id);
      return {
        id: f.id,
        course_name: local?.name ?? meta?.course_name ?? f.name,
        city: meta?.city ?? null,
        state: meta?.state ?? null,
      } satisfies OpenGolfCourseCompact;
    });
  }, [favorites, getCourse, metaCache]);

  const listCourses = useMemo(() => {
    if (debouncedQuery.length >= 2) return searchResults;
    if (tab === "nearby") return nearbyCourses;
    if (tab === "recent") return recentCourses;
    return favoriteCourses;
  }, [
    debouncedQuery,
    searchResults,
    tab,
    nearbyCourses,
    recentCourses,
    favoriteCourses,
  ]);

  const pick = (course: OpenGolfCourseCompact) => {
    rememberCourse(course.id, course.course_name);
    onSelectCourse(course.id, course.course_name);
    onClose();
  };

  const tabs: { id: CourseTab; label: string }[] = [
    { id: "nearby", label: "Nearby" },
    { id: "recent", label: "Recent" },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Search courses"
      tone="white"
      expanded
      contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search US courses"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-sand-score-border bg-white px-3 py-2.5 text-sm text-[#373737]"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-sm font-semibold text-sand-hunter"
          >
            Cancel
          </button>
        </div>

        {debouncedQuery.length < 2 ? (
          <div className="flex gap-4 border-b border-fairway-800/15">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`border-b-2 pb-2 text-sm font-semibold ${
                  tab === t.id
                    ? "border-sand-hunter text-sand-hunter"
                    : "border-transparent text-fairway-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        {debouncedQuery.length < 2 && tab === "nearby" && nearbyLoading ? (
          <p className="text-sm text-fairway-500">Loading nearby courses…</p>
        ) : null}

        {debouncedQuery.length >= 2 && searching ? (
          <p className="text-sm text-fairway-500">Searching…</p>
        ) : null}

        <ul className="max-h-[min(48dvh,400px)] space-y-2 overflow-y-auto overscroll-contain">
          {listCourses.map((course) => (
            <li key={course.id}>
              <CourseRow course={course} onSelect={() => pick(course)} />
            </li>
          ))}
        </ul>

        {!nearbyLoading &&
        !searching &&
        listCourses.length === 0 &&
        debouncedQuery.length >= 2 ? (
          <p className="text-sm text-fairway-500">No courses found.</p>
        ) : null}

        {!nearbyLoading &&
        listCourses.length === 0 &&
        debouncedQuery.length < 2 &&
        tab === "favorites" ? (
          <p className="text-sm text-fairway-500">
            Tap the star on a course to save it here.
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}

export function formatCourseLocationLine(
  meta: OpenGolfCourseCompact | undefined,
): string {
  if (!meta) return "";
  return formatCourseLocation(meta);
}
