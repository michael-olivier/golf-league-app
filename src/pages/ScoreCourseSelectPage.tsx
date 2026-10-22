import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CourseFavoriteStar } from "../components/CourseFavoriteStar";
import { PageTitleSection } from "../components/PageTitleSection";
import {
  fetchOpenGolfCoursesBulk,
  formatCourseSubtitle,
  searchOpenGolfCourses,
  type OpenGolfCourseCompact,
} from "../api/openGolfApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFavoriteCourses } from "../hooks/useFavoriteCourses";
import { useLeague } from "../store/LeagueContext";
import {
  getSearchLocationLabel,
  useLocationPreferences,
} from "../store/LocationPreferencesContext";
import {
  MAX_RECENT,
  readRecentCourses,
  rememberCourse,
} from "../utils/recentCourses";
import { cachedJsonSnapshot } from "../utils/snapshotCache";

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

function CourseListRow({
  courseId,
  courseName,
  subtitle,
  onSelect,
}: {
  courseId: string;
  courseName: string;
  subtitle?: string;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-fairway-800 bg-fairway-900/40 pr-2 hover:border-fairway-600">
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 px-4 py-3 text-left"
      >
        <p className="text-sm font-medium text-fairway-200">{courseName}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-fairway-500">{subtitle}</p>
        ) : null}
      </button>
      <CourseFavoriteStar courseId={courseId} courseName={courseName} />
    </div>
  );
}

export function ScoreCourseSelectPage() {
  const { getCourse } = useLeague();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const [apiResults, setApiResults] = useState<OpenGolfCourseCompact[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentMeta, setRecentMeta] = useState<OpenGolfCourseCompact[]>([]);
  const locationPrefs = useLocationPreferences();
  const {
    locationServicesEnabled,
    coords,
    geoStatus,
    requestLocation,
  } = locationPrefs;
  const locationLabel = getSearchLocationLabel(locationPrefs);
  const { favorites } = useFavoriteCourses();

  const waitingForLocation =
    locationServicesEnabled && geoStatus === "loading";

  const useCoordsForSearch =
    locationServicesEnabled && coords != null && geoStatus !== "loading";

  const recentEntries = useSyncExternalStore(
    subscribeRecent,
    readRecentSnapshot,
    readRecentSnapshot,
  );
  const recentIdsKey = recentEntries.map((c) => c.id).join("|");
  const favoriteIdsKey = favorites.map((f) => f.id).join("|");

  const recentCourses = useMemo(() => {
    return recentEntries.slice(0, MAX_RECENT).map((entry) => {
      const local = getCourse(entry.id);
      const meta = recentMeta.find((c) => c.id === entry.id);
      return {
        id: entry.id,
        course_name: local?.name ?? meta?.course_name ?? entry.name,
        city: meta?.city ?? null,
        state: meta?.state ?? null,
      } satisfies OpenGolfCourseCompact;
    });
  }, [recentEntries, getCourse, recentMeta]);

  const favoriteCourses = useMemo(() => {
    return favorites.map((f) => {
      const local = getCourse(f.id);
      return {
        id: f.id,
        course_name: local?.name ?? f.name,
        city: null,
        state: null,
      } satisfies OpenGolfCourseCompact;
    });
  }, [favorites, getCourse]);

  useEffect(() => {
    const ids = [
      ...recentEntries
        .filter((e) => !getCourse(e.id))
        .map((e) => e.id),
      ...favorites.filter((f) => !getCourse(f.id)).map((f) => f.id),
    ];
    const missing = [...new Set(ids)];
    if (missing.length === 0) return;

    const controller = new AbortController();
    fetchOpenGolfCoursesBulk(missing, controller.signal)
      .then((courses) => setRecentMeta((prev) => mergeCompact(prev, courses)))
      .catch(() => {});

    return () => controller.abort();
  }, [recentIdsKey, favoriteIdsKey, favorites, getCourse]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setApiResults([]);
      setApiTotal(0);
      setSearchError(null);
      setSearching(false);
      return;
    }

    if (waitingForLocation) {
      setSearching(true);
      setSearchError(null);
      setApiResults([]);
      setApiTotal(0);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchError(null);

    searchOpenGolfCourses(debouncedQuery, {
      limit: 25,
      signal: controller.signal,
      lat: useCoordsForSearch ? coords!.lat : undefined,
      lng: useCoordsForSearch ? coords!.lng : undefined,
    })
      .then(({ courses, total }) => {
        setApiResults(courses);
        setApiTotal(total);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setApiResults([]);
        setApiTotal(0);
        setSearchError(
          err instanceof Error ? err.message : "Could not search courses.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, waitingForLocation, useCoordsForSearch, coords]);

  const selectCourse = (courseId: string, courseName: string) => {
    rememberCourse(courseId, courseName);
    navigate(`/scores/setup?courseId=${encodeURIComponent(courseId)}`);
  };

  const isSearchActive = query.trim().length >= 2;

  return (
    <div className="space-y-4 pb-4">
      <PageTitleSection title="Score">
        <h2 className="text-lg font-semibold text-fairway-300">
          Where are you playing?
        </h2>
      </PageTitleSection>

      {locationServicesEnabled && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-fairway-400">
            Location:{" "}
            <span className="text-fairway-200">{locationLabel}</span>
          </p>
          <button
            type="button"
            onClick={() => requestLocation({ force: true })}
            title="Try device GPS (defaults to Denver, CO)"
            className="shrink-0 font-medium text-fairway-400 underline-offset-2 hover:text-fairway-200 hover:underline"
          >
            Update
          </button>
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search US courses by name"
        autoComplete="off"
        className="w-full rounded-xl border border-fairway-800 bg-fairway-950 px-4 py-3 text-sm text-fairway-200 placeholder:text-fairway-500"
      />

      {!isSearchActive && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Recently played
          </h3>
          {recentCourses.length === 0 ? null : (
            <ul className="space-y-2">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <CourseListRow
                    courseId={course.id}
                    courseName={course.course_name}
                    subtitle={formatCourseSubtitle(course) || undefined}
                    onSelect={() => selectCourse(course.id, course.course_name)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!isSearchActive && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Favorite courses
          </h3>
          {favoriteCourses.length === 0 ? (
            <p className="text-sm text-fairway-500">
              Tap the star on a course to save it here.
            </p>
          ) : (
            <ul className="space-y-2">
              {favoriteCourses.map((course) => (
                <li key={course.id}>
                  <CourseListRow
                    courseId={course.id}
                    courseName={course.course_name}
                    onSelect={() => selectCourse(course.id, course.course_name)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isSearchActive && (
        <section>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-fairway-500">
              Results
              {apiTotal > 0 && !searching ? (
                <span className="ml-1 font-normal normal-case text-fairway-600">
                  ({apiTotal.toLocaleString()})
                </span>
              ) : null}
            </h3>
            {useCoordsForSearch && (
              <span className="text-[10px] text-fairway-600">Nearest first</span>
            )}
            {!locationServicesEnabled && (
              <Link
                to="/settings"
                className="text-[10px] text-fairway-500 underline"
              >
                Turn on location in Settings
              </Link>
            )}
          </div>
          {waitingForLocation && (
            <p className="text-sm text-fairway-500">
              Getting your location to sort nearest first…
            </p>
          )}
          {!waitingForLocation && searching && apiResults.length === 0 && (
            <p className="text-sm text-fairway-500">Searching…</p>
          )}
          {searchError && (
            <p className="text-sm text-sand-brick">{searchError}</p>
          )}
          <ul className="space-y-2">
            {apiResults.map((course) => (
              <li key={course.id}>
                <CourseListRow
                  courseId={course.id}
                  courseName={course.course_name}
                  subtitle={formatCourseSubtitle(course) || undefined}
                  onSelect={() => selectCourse(course.id, course.course_name)}
                />
              </li>
            ))}
          </ul>
          {!searching && !searchError && apiResults.length === 0 && (
            <p className="text-sm text-fairway-500">No courses match your search.</p>
          )}
          <p className="pt-2 text-[10px] leading-snug text-fairway-600">
            Course search powered by{" "}
            <a
              href="https://opengolfapi.org"
              className="underline hover:text-fairway-500"
              target="_blank"
              rel="noreferrer"
            >
              OpenGolfAPI
            </a>{" "}
            (ODbL).
          </p>
        </section>
      )}

      {query.trim().length === 1 && (
        <p className="text-sm text-fairway-500">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}

function mergeCompact(
  prev: OpenGolfCourseCompact[],
  next: OpenGolfCourseCompact[],
): OpenGolfCourseCompact[] {
  const byId = new Map(prev.map((c) => [c.id, c]));
  for (const c of next) byId.set(c.id, c);
  return [...byId.values()];
}
