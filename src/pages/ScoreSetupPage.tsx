import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { fetchOpenGolfCourseDetail } from "../api/openGolfApi";
import { CourseHandicapFooter } from "../components/CourseHandicapFooter";
import { CourseNameWithFavorite } from "../components/CourseNameWithFavorite";
import { PageTitleSection } from "../components/PageTitleSection";
import { useLeague } from "../store/LeagueContext";
import { useRoundSetup } from "../store/RoundSetupContext";
import type { ScoreType } from "../types";
import { courseHandicapFromIndex, coursePar } from "../utils/handicap";
import { rememberCourse } from "../utils/recentCourses";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const scoreTypes: { id: ScoreType; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "away", label: "Away" },
  { id: "competition", label: "Competition" },
];

export function ScoreSetupPage() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");
  const { currentPlayer, getCourse, upsertCourse } = useLeague();
  const { setSetup } = useRoundSetup();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const course = courseId ? getCourse(courseId) : undefined;
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || course) return;

    const controller = new AbortController();
    setLoadingCourse(true);
    setLoadError(null);

    fetchOpenGolfCourseDetail(courseId, controller.signal)
      .then((fetched) => upsertCourse(fetched))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          err instanceof Error ? err.message : "Could not load this course.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCourse(false);
      });

    return () => controller.abort();
  }, [courseId, course, upsertCourse]);

  const [playDate, setPlayDate] = useState(todayIso);
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [teeBoxId, setTeeBoxId] = useState("");
  const [startHole, setStartHole] = useState(1);
  const [scoreType, setScoreType] = useState<ScoreType>("home");

  useEffect(() => {
    if (course?.tees[0]) {
      setTeeBoxId(course.tees[0].id);
    }
  }, [course]);

  const selectedTee = course?.tees.find((t) => t.id === teeBoxId) ?? course?.tees[0];
  const par = course ? coursePar(course.holes) : 72;

  const courseHandicap = useMemo(() => {
    if (!selectedTee || !course) return 0;
    const ch = courseHandicapFromIndex(
      currentPlayer.handicapIndex,
      selectedTee.slopeRating,
      selectedTee.courseRating,
      par,
    );
    return holeCount === 9 ? Math.round(ch / 2) : ch;
  }, [selectedTee, course, currentPlayer.handicapIndex, par, holeCount]);

  const maxStartHole = holeCount === 9 ? 10 : 1;

  if (!courseId) {
    return <Navigate to="/scores" replace />;
  }

  if (loadingCourse && !course) {
    return (
      <p className="py-8 text-center text-sm text-fairway-500">Loading course…</p>
    );
  }

  if (!course) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-sm text-sand-brick">
          {loadError ?? "Course not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/scores")}
          className="text-sm font-medium text-fairway-400 underline"
        >
          Back to search
        </button>
      </div>
    );
  }

  const beginRound = () => {
    if (!selectedTee) return;
    const sessionId = `casual-${course.id}-${playDate}-${Date.now()}`;
    setSetup({
      sessionId,
      courseId: course.id,
      playDate,
      holeCount,
      teeBoxId: selectedTee.id,
      startHole: holeCount === 18 ? 1 : startHole,
      scoreType,
      courseHandicap,
    });
    rememberCourse(course.id, course.name);
    navigate("/scores/entry");
  };

  return (
    <div className="flex min-w-0 flex-col pb-4">
      <div className="space-y-5">
        <PageTitleSection title="Score">
          <button
            type="button"
            onClick={() => navigate("/scores")}
            aria-label="Back to course search"
            className="-ml-1 flex items-center gap-1 py-1 text-sm font-medium text-fairway-400 transition hover:text-fairway-200"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>

          <CourseNameWithFavorite courseId={course.id} courseName={course.name}>
          <button
            type="button"
            onClick={() =>
              dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()
            }
            className="mt-1 text-left text-sm text-fairway-400"
          >
            {formatDisplayDate(playDate)}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
            className="sr-only"
          />
        </CourseNameWithFavorite>
        </PageTitleSection>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Holes
          </p>
          <div className="flex gap-2 rounded-xl bg-fairway-900/60 p-1">
            {([9, 18] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setHoleCount(n);
                  if (n === 18) setStartHole(1);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  holeCount === n
                    ? "bg-fairway-700 text-white"
                    : "text-fairway-400"
                }`}
              >
                {n} holes
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Tee box
          </p>
          <ul className="space-y-2">
            {course.tees.map((tee) => {
              const teeCh = courseHandicapFromIndex(
                currentPlayer.handicapIndex,
                tee.slopeRating,
                tee.courseRating,
                par,
              );
              const displayCh = holeCount === 9 ? Math.round(teeCh / 2) : teeCh;
              const active = tee.id === selectedTee?.id;
              return (
                <li key={tee.id}>
                  <button
                    type="button"
                    onClick={() => setTeeBoxId(tee.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                      active
                        ? "border-fairway-600 bg-fairway-900/60"
                        : "border-fairway-800 bg-fairway-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-fairway-200">{tee.name}</span>
                      <span className="text-fairway-400">{tee.yardage} yds</span>
                    </div>
                    <p className="mt-1 text-xs text-fairway-500">
                      CH {displayCh} · {tee.courseRating}/{tee.slopeRating}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {holeCount === 9 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
              Starting hole
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={startHole <= 1}
                onClick={() => setStartHole((h) => Math.max(1, h - 1))}
                className="h-10 w-10 rounded-lg bg-fairway-800 font-bold disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-xl font-bold tabular-nums">
                {startHole}
              </span>
              <button
                type="button"
                disabled={startHole >= maxStartHole}
                onClick={() => setStartHole((h) => Math.min(maxStartHole, h + 1))}
                className="h-10 w-10 rounded-lg bg-fairway-600 font-bold text-white disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-center text-xs text-fairway-500">
              Play 9 holes starting on hole {startHole}
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Score type
          </p>
          <div className="flex gap-2 rounded-xl bg-fairway-900/60 p-1">
            {scoreTypes.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setScoreType(opt.id)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                  scoreType === opt.id
                    ? "bg-fairway-700 text-white"
                    : "text-fairway-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={beginRound}
          className="w-full rounded-2xl bg-fairway-600 py-4 text-center font-semibold text-white"
        >
          Start scoring
        </button>
      </div>

      <CourseHandicapFooter courseHandicap={courseHandicap} docked />
    </div>
  );
}
