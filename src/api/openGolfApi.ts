import type { Course, Hole, TeeBox } from "../types";
import { haversineDistanceMi } from "../utils/geoDistance";

const BASE_URL =
  import.meta.env.VITE_OPENGOLF_API_URL?.replace(/\/$/, "") ??
  "https://api.opengolfapi.org";

export interface OpenGolfCourseCompact {
  id: string;
  course_name: string;
  city?: string | null;
  state?: string | null;
  lat?: number | null;
  lng?: number | null;
  par?: number;
  holes?: number;
  total_yardage?: number;
  distance_mi?: number;
}

interface CourseListResponse {
  courses?: OpenGolfCourseCompact[];
  total?: number;
}

interface OpenGolfTee {
  tee_key: string;
  tee_name: string;
  course_rating?: number;
  slope?: number;
  yardage?: number;
  par?: number;
  gender?: string;
}

interface OpenGolfHole {
  number: number;
  par: number;
  handicap_index?: number;
}

export interface OpenGolfCourseDetail {
  id: string;
  course_name: string;
  par?: number;
  holes?: number;
  tees?: OpenGolfTee[];
  holes_data?: OpenGolfHole[];
}

export function formatCourseLocation(c: OpenGolfCourseCompact): string {
  const parts = [c.city, c.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

export function formatCourseSubtitle(c: OpenGolfCourseCompact): string {
  const location = formatCourseLocation(c);
  if (c.distance_mi == null || Number.isNaN(c.distance_mi)) {
    return location;
  }
  const dist =
    c.distance_mi < 10
      ? c.distance_mi.toFixed(1)
      : String(Math.round(c.distance_mi));
  const distanceLabel = `${dist} mi away`;
  return location ? `${location} · ${distanceLabel}` : distanceLabel;
}

function enrichWithDistance(
  courses: OpenGolfCourseCompact[],
  userLat: number,
  userLng: number,
): OpenGolfCourseCompact[] {
  return courses.map((course) => {
    if (course.distance_mi != null && !Number.isNaN(course.distance_mi)) {
      return course;
    }
    if (course.lat == null || course.lng == null) return course;
    return {
      ...course,
      distance_mi: haversineDistanceMi(userLat, userLng, course.lat, course.lng),
    };
  });
}

function sortCoursesByDistance(
  courses: OpenGolfCourseCompact[],
): OpenGolfCourseCompact[] {
  return [...courses].sort((a, b) => {
    const da = a.distance_mi ?? Number.POSITIVE_INFINITY;
    const db = b.distance_mi ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return a.course_name.localeCompare(b.course_name);
  });
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function searchOpenGolfCourses(
  query: string,
  options?: {
    limit?: number;
    signal?: AbortSignal;
    lat?: number;
    lng?: number;
    /** Miles from lat/lng; only used when coordinates are set. */
    radiusMi?: number;
  },
): Promise<{ courses: OpenGolfCourseCompact[]; total: number }> {
  const q = query.trim();
  if (!q) return { courses: [], total: 0 };

  const params = new URLSearchParams({ q, limit: String(options?.limit ?? 25) });
  if (options?.lat != null && options?.lng != null) {
    params.set("lat", String(options.lat));
    params.set("lng", String(options.lng));
    params.set("radius_mi", String(options?.radiusMi ?? 250));
  }

  const res = await fetch(`${BASE_URL}/api/v1/courses/search?${params}`, {
    signal: options?.signal,
  });
  const data = await parseJson<CourseListResponse>(res);
  let courses = data.courses ?? [];

  if (options?.lat != null && options?.lng != null) {
    courses = enrichWithDistance(courses, options.lat, options.lng);
    courses = sortCoursesByDistance(courses);
  }

  return {
    courses,
    total: data.total ?? courses.length,
  };
}

export async function fetchOpenGolfCoursesBulk(
  ids: string[],
  signal?: AbortSignal,
): Promise<OpenGolfCourseCompact[]> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return [];

  const params = new URLSearchParams({ ids: unique.slice(0, 100).join(",") });
  const res = await fetch(`${BASE_URL}/api/v1/courses/bulk?${params}`, {
    signal,
  });
  const data = await parseJson<CourseListResponse>(res);
  return data.courses ?? [];
}

export async function fetchOpenGolfCourseDetail(
  id: string,
  signal?: AbortSignal,
): Promise<Course> {
  const res = await fetch(`${BASE_URL}/api/v1/courses/${encodeURIComponent(id)}`, {
    signal,
  });
  const detail = await parseJson<OpenGolfCourseDetail>(res);
  return mapOpenGolfDetailToCourse(detail);
}

function mapOpenGolfDetailToCourse(detail: OpenGolfCourseDetail): Course {
  const parTotal = detail.par ?? 72;
  const holes = mapHoles(detail.holes_data, detail.holes ?? 18, parTotal);
  const tees = mapTees(detail.tees, parTotal);

  return {
    id: detail.id,
    name: detail.course_name,
    holes,
    tees: tees.length > 0 ? tees : [fallbackTee(parTotal)],
  };
}

function mapHoles(
  holesData: OpenGolfHole[] | undefined,
  holeCount: number,
  parTotal: number,
): Hole[] {
  if (holesData && holesData.length > 0) {
    return holesData.map((h) => ({
      number: h.number,
      par: h.par,
      handicapIndex: h.handicap_index ?? h.number,
    }));
  }

  const count = holeCount > 0 ? holeCount : 18;
  const defaultPar = Math.max(3, Math.round(parTotal / count));
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    par: defaultPar,
    handicapIndex: i + 1,
  }));
}

function mapTees(tees: OpenGolfTee[] | undefined, parTotal: number): TeeBox[] {
  if (!tees?.length) return [];

  const preferred =
    tees.filter((t) => (t.gender ?? "").toLowerCase() === "male").length > 0
      ? tees.filter((t) => (t.gender ?? "").toLowerCase() === "male")
      : tees;

  return preferred.map((t) => ({
    id: t.tee_key,
    name: t.tee_name,
    yardage: t.yardage ?? 0,
    courseRating: t.course_rating ?? parTotal,
    slopeRating: t.slope ?? 113,
  }));
}

function fallbackTee(parTotal: number): TeeBox {
  return {
    id: "default",
    name: "Default",
    yardage: 6000,
    courseRating: parTotal,
    slopeRating: 113,
  };
}
