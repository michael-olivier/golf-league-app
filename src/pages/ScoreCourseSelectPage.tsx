import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchOpenGolfCourseDetail,
  fetchOpenGolfCoursesBulk,
  searchOpenGolfCourses,
  type OpenGolfCourseCompact,
} from "../api/openGolfApi";
import { AddPlayersSheet } from "../components/score/AddPlayersSheet";
import { GolferActionSheet } from "../components/score/GolferActionSheet";
import { GolfersRosterList } from "../components/score/GolfersRosterList";
import {
  CourseSearchDrawer,
  formatCourseLocationLine,
} from "../components/score/CourseSearchDrawer";
import { SetupOptionTile } from "../components/score/SetupOptionTile";
import { SetupPickerSheet } from "../components/score/SetupPickerSheet";
import { StartHoleSheets } from "../components/score/StartHoleSheets";
import { CourseFavoriteStar } from "../components/CourseFavoriteStar";
import {
  GHIN_HOME_COURSE_ID,
  GHIN_HOME_COURSE_NAME,
} from "../data/ghinMock";
import {
  getSearchLocationLabel,
  useLocationPreferences,
} from "../store/LocationPreferencesContext";
import { useLeague } from "../store/LeagueContext";
import { useRoundSetup } from "../store/RoundSetupContext";
import type {
  CasualScoringMode,
  HolesChoice,
  ScoreType,
  ScoringGolfer,
  TeeBox,
} from "../types";
import {
  readCourseRoundPrefs,
  saveCourseRoundPrefs,
} from "../utils/courseRoundHistory";
import { courseHandicapFromIndex, coursePar } from "../utils/handicap";
import {
  balancedTeamAssignment,
  type TeamSide,
} from "../utils/balancedTeams";
import { normalizeCasualScoringMode } from "../utils/casualScoring";
import { pickDefaultScoreCourseId } from "../utils/pickDefaultScoreCourse";
import { holeCountFromChoice } from "../utils/scoringGolfer";
import { readRecentCourses, rememberCourse } from "../utils/recentCourses";
import { cachedJsonSnapshot } from "../utils/snapshotCache";
import {
  pickDefaultTeeBox,
  recordTeeUsage,
  formatTeeColorLabel,
  sortTeesLongestFirst,
} from "../utils/teePreference";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const SCORING_LABELS: Record<CasualScoringMode, string> = {
  match_net: "Match (Net)",
  match_gross: "Match (Gross)",
  stroke: "Stroke",
};

function holesTileDisplay(choice: HolesChoice): string {
  if (choice === "not_sure") return "Not Sure";
  return choice;
}

type SetupSheet =
  | "holes"
  | "tee"
  | "roundType"
  | "scoring"
  | "teams"
  | null;

function subscribeRecent(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("fairway-recent-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("fairway-recent-changed", handler);
  };
}

export function ScoreCourseSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get("courseId");
  const { currentPlayer, getCourse, upsertCourse } = useLeague();
  const { setSetup } = useRoundSetup();
  const locationPrefs = useLocationPreferences();
  const { coords, locationServicesEnabled, geoStatus } = locationPrefs;
  const locationLabel = getSearchLocationLabel(locationPrefs);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseMeta, setCourseMeta] = useState<OpenGolfCourseCompact | null>(
    null,
  );
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const defaultPickDone = useRef(false);

  const course = selectedCourseId ? getCourse(selectedCourseId) : undefined;

  const [playDate] = useState(todayIso);
  const [holesChoice, setHolesChoice] = useState<HolesChoice>("18");
  const [teeBoxId, setTeeBoxId] = useState("");
  const [startHole, setStartHole] = useState(1);
  const [scoreType, setScoreType] = useState<ScoreType>("casual");
  const [scoringMode, setScoringMode] =
    useState<CasualScoringMode>("stroke");
  const [addedPlayers, setAddedPlayers] = useState<ScoringGolfer[]>([]);
  const [teamsEnabled, setTeamsEnabled] = useState(false);
  const [teamByGolferId, setTeamByGolferId] = useState<
    Record<string, TeamSide>
  >({});
  const [golferTeeById, setGolferTeeById] = useState<Record<string, string>>(
    {},
  );
  const [addPlayersOpen, setAddPlayersOpen] = useState(false);
  const [replacingPartnerId, setReplacingPartnerId] = useState<string | null>(
    null,
  );
  const [actionGolfer, setActionGolfer] = useState<ScoringGolfer | null>(null);
  const [teePickerGolferId, setTeePickerGolferId] = useState<string | null>(
    null,
  );
  const [setupSheet, setSetupSheet] = useState<SetupSheet>(null);
  const [startHolePresetsOpen, setStartHolePresetsOpen] = useState(false);
  const [startHoleAllOpen, setStartHoleAllOpen] = useState(false);

  const recentSnapshot = useSyncExternalStore(
    subscribeRecent,
    () => cachedJsonSnapshot("recent-courses", readRecentCourses),
    () => cachedJsonSnapshot("recent-courses", readRecentCourses),
  );

  const useCoords =
    locationServicesEnabled && coords != null && geoStatus !== "loading";

  const currentUserGolfer = useMemo(
    (): ScoringGolfer => ({
      id: currentPlayer.id,
      name: currentPlayer.name,
      handicapIndex: currentPlayer.handicapIndex,
      homeCourseName: GHIN_HOME_COURSE_NAME,
      ghinNumber: currentPlayer.ghinNumber,
      avatarUrl: currentPlayer.avatarUrl,
    }),
    [currentPlayer],
  );

  useEffect(() => {
    if (courseIdFromUrl) {
      setSelectedCourseId(courseIdFromUrl);
      defaultPickDone.current = true;
      return;
    }
    if (defaultPickDone.current || selectedCourseId) return;

    if (!useCoords) {
      const id = pickDefaultScoreCourseId(recentSnapshot, []);
      if (id) setSelectedCourseId(id);
      defaultPickDone.current = true;
      return;
    }

    const controller = new AbortController();
    const cityTerm = locationLabel.split(",")[0]?.trim() || "golf";
    searchOpenGolfCourses(cityTerm, {
      limit: 40,
      signal: controller.signal,
      lat: coords!.lat,
      lng: coords!.lng,
      radiusMi: 80,
    })
      .then(({ courses: nearby }) => {
        const id = pickDefaultScoreCourseId(recentSnapshot, nearby);
        if (id) setSelectedCourseId(id);
        defaultPickDone.current = true;
      })
      .catch(() => {
        const id = pickDefaultScoreCourseId(recentSnapshot, []);
        if (id) setSelectedCourseId(id);
        defaultPickDone.current = true;
      });
    return () => controller.abort();
  }, [
    courseIdFromUrl,
    useCoords,
    coords,
    locationLabel,
    recentSnapshot,
    selectedCourseId,
  ]);

  useEffect(() => {
    if (!selectedCourseId) return;
    if (course) {
      fetchOpenGolfCoursesBulk([selectedCourseId])
        .then((list) => setCourseMeta(list[0] ?? null))
        .catch(() => {});
      return;
    }
    const controller = new AbortController();
    setLoadingCourse(true);
    fetchOpenGolfCourseDetail(selectedCourseId, controller.signal)
      .then((fetched) => {
        upsertCourse(fetched);
        return fetchOpenGolfCoursesBulk([selectedCourseId], controller.signal);
      })
      .then((list) => setCourseMeta(list[0] ?? null))
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCourse(false);
      });
    return () => controller.abort();
  }, [selectedCourseId, course, upsertCourse]);

  const applyCourseDefaults = (courseId: string, tees: TeeBox[]) => {
    const prefs = readCourseRoundPrefs(courseId);
    if (prefs) {
      setHolesChoice(prefs.holesChoice);
      setStartHole(prefs.startHole);
      setScoreType(prefs.scoreType);
      setScoringMode(normalizeCasualScoringMode(prefs.scoringMode));
      setTeamsEnabled(Boolean(prefs.teamsEnabled));
      const teeOk = tees.some((t) => t.id === prefs.teeBoxId);
      setTeeBoxId(teeOk ? prefs.teeBoxId : pickDefaultTeeBox(tees)?.id ?? "");
      return;
    }
    setHolesChoice("18");
    setStartHole(1);
    setScoreType("casual");
    setScoringMode("stroke");
    setTeamsEnabled(false);
    const picked = pickDefaultTeeBox(tees);
    if (picked) setTeeBoxId(picked.id);
  };

  useEffect(() => {
    if (!course?.tees.length) return;
    applyCourseDefaults(course.id, course.tees);
    setAddedPlayers([]);
    setTeamByGolferId({});
    setGolferTeeById({});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when course id changes
  }, [course?.id]);

  const holeCount = holeCountFromChoice(holesChoice);
  const sortedTees = useMemo(
    () => (course ? sortTeesLongestFirst(course.tees) : []),
    [course],
  );
  const selectedTee =
    course?.tees.find((t) => t.id === teeBoxId) ?? sortedTees[0];
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

  const roster = useMemo(
    () => [currentUserGolfer, ...addedPlayers].slice(0, 4),
    [currentUserGolfer, addedPlayers],
  );

  const playerCount = roster.length as 1 | 2 | 3 | 4;
  const teamsSelectable = roster.length >= 3;
  const teamsTileValue = teamsEnabled ? "Yes" : "No";

  const rosterKey = roster.map((g) => g.id).join(",");

  useEffect(() => {
    if (!teamsSelectable && teamsEnabled) setTeamsEnabled(false);
  }, [teamsSelectable, teamsEnabled]);

  useEffect(() => {
    if (!teamsEnabled || roster.length < 3) {
      if (!teamsEnabled) setTeamByGolferId({});
      return;
    }
    setTeamByGolferId(balancedTeamAssignment(roster));
  }, [teamsEnabled, rosterKey, roster.length]);

  const handleSelectCourse = (courseId: string, courseName: string) => {
    rememberCourse(courseId, courseName);
    setSelectedCourseId(courseId);
  };

  const handleSelectStartHole = (hole: number) => {
    setStartHole(hole);
    setStartHolePresetsOpen(false);
    setStartHoleAllOpen(false);
  };

  const teeLabelFor = (golferId: string) => {
    const tid = golferTeeById[golferId] ?? teeBoxId;
    const tee = course?.tees.find((t) => t.id === tid);
    return tee ? formatTeeColorLabel(tee.name) : "—";
  };

  const beginRound = () => {
    if (!selectedTee || !course) return;
    const fullPar = coursePar(course.holes);
    const scoringGolfers = roster.map((g) => {
      const tid = golferTeeById[g.id] ?? selectedTee.id;
      return { ...g, teeBoxId: tid };
    });
    const golferCourseHandicaps: Record<string, number> = {};
    for (const g of scoringGolfers) {
      const tee =
        course.tees.find((t) => t.id === (g.teeBoxId ?? selectedTee.id)) ??
        selectedTee;
      let ch = courseHandicapFromIndex(
        g.handicapIndex,
        tee.slopeRating,
        tee.courseRating,
        fullPar,
      );
      if (holeCount === 9) ch = Math.round(ch / 2);
      golferCourseHandicaps[g.id] = ch;
    }
    recordTeeUsage(selectedTee);
    saveCourseRoundPrefs(course.id, {
      holesChoice,
      teeBoxId: selectedTee.id,
      startHole,
      scoreType,
      scoringMode,
      playerCount,
      teamsEnabled: teamsEnabled && teamsSelectable,
    });
    const scorePostingSide =
      course.id === GHIN_HOME_COURSE_ID ? "home" : "away";
    setSetup({
      sessionId: `casual-${course.id}-${playDate}-${Date.now()}`,
      courseId: course.id,
      playDate,
      holesChoice,
      holeCount,
      teeBoxId: selectedTee.id,
      startHole,
      scoreType,
      scorePostingSide,
      scoringMode,
      playerCount,
      courseHandicap,
      scoringGolfers,
      teamsEnabled: teamsEnabled && teamsSelectable,
      teamByGolferId:
        teamsEnabled && teamsSelectable ? teamByGolferId : undefined,
      golferCourseHandicaps,
    });
    navigate("/scores/entry");
  };

  const removePartner = (golferId: string) => {
    setAddedPlayers((list) => list.filter((p) => p.id !== golferId));
    setGolferTeeById((prev) => {
      const next = { ...prev };
      delete next[golferId];
      return next;
    });
  };

  const canAddGolfer = roster.length < 4;

  const locationLine = formatCourseLocationLine(
    courseMeta ?? undefined,
  );
  const teeDisplay = selectedTee
    ? formatTeeColorLabel(selectedTee.name)
    : "—";
  if (!selectedCourseId) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-center text-sm text-fairway-500">
          Choose a course to start scoring.
        </p>
        <button
          type="button"
          onClick={() => setCourseSearchOpen(true)}
          className="w-full rounded-2xl bg-fairway-600 py-4 text-center font-semibold text-white"
        >
          Search courses
        </button>
        <CourseSearchDrawer
          open={courseSearchOpen}
          onClose={() => setCourseSearchOpen(false)}
          onSelectCourse={handleSelectCourse}
        />
      </div>
    );
  }

  if (loadingCourse && !course) {
    return (
      <p className="py-8 text-center text-sm text-fairway-500">
        Loading your course…
      </p>
    );
  }

  if (!course) {
    return (
      <p className="py-8 text-center text-sm text-sand-brick">
        Could not load this course.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => setCourseSearchOpen(true)}
        >
          Choose another
        </button>
      </p>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="space-y-3 pb-4">
          <header className="text-left text-[#000]">
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold leading-snug text-[#000]">
                  {course.name}
                </h1>
                <p className="mt-1 text-sm text-[#000]">
                  {locationLine ? `${locationLine} | ` : ""}
                  Course Handicap: {courseHandicap}
                </p>
              </div>
              <CourseFavoriteStar
                courseId={course.id}
                courseName={course.name}
              />
            </div>
          </header>

          <button
            type="button"
            onClick={() => setCourseSearchOpen(true)}
            className="w-full rounded-xl border border-sand-score-border bg-white px-4 py-3 text-left text-sm text-fairway-400"
          >
            Search courses
          </button>

          <div>
            <p className="score-section-title mb-2">Round setup</p>
            <div className="grid grid-cols-3 gap-2">
              <SetupOptionTile
                label="Holes"
                value={holesTileDisplay(holesChoice)}
                onClick={() => setSetupSheet("holes")}
              />
              <SetupOptionTile
                label="Tee box"
                value={teeDisplay}
                onClick={() => setSetupSheet("tee")}
              />
              <SetupOptionTile
                label="Start hole"
                value={`#${startHole}`}
                onClick={() => setStartHolePresetsOpen(true)}
              />
              <SetupOptionTile
                label="Round type"
                value={scoreType === "tournament" ? "Tournament" : "Casual"}
                onClick={() => setSetupSheet("roundType")}
              />
              <SetupOptionTile
                label="Scoring"
                value={SCORING_LABELS[scoringMode]}
                onClick={() => setSetupSheet("scoring")}
              />
              <SetupOptionTile
                label="Teams"
                value={teamsTileValue}
                disabled={!teamsSelectable}
                onClick={
                  teamsSelectable
                    ? () => setSetupSheet("teams")
                    : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="score-section-title">Golfers</p>
            <GolfersRosterList
              roster={roster}
              teamsEnabled={teamsEnabled && teamsSelectable}
              teamByGolferId={teamByGolferId}
              onMoveToTeam={(golferId, team) =>
                setTeamByGolferId((prev) => ({ ...prev, [golferId]: team }))
              }
              currentUserId={currentUserGolfer.id}
              teeLabelFor={teeLabelFor}
              onTeeClick={(id) => setTeePickerGolferId(id)}
              onRemoveGolfer={removePartner}
              onNameMenu={(g) => setActionGolfer(g)}
              openAddSlot={
                canAddGolfer ? (
                  <li key="add-slot">
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPartnerId(null);
                        setAddPlayersOpen(true);
                      }}
                      className="flex w-full items-center justify-center rounded-xl border border-dashed border-sand-score-border bg-white/50 px-3 py-2.5 text-xs font-semibold text-sand-hunter underline"
                    >
                      Add golfer
                    </button>
                  </li>
                ) : null
              }
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-sand-score-mist pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={beginRound}
          className="w-full rounded-2xl bg-fairway-600 py-4 text-center font-semibold text-white"
        >
          Start Round
        </button>
      </div>

      <CourseSearchDrawer
        open={courseSearchOpen}
        onClose={() => setCourseSearchOpen(false)}
        onSelectCourse={handleSelectCourse}
      />

      <SetupPickerSheet
        open={setupSheet === "holes"}
        onClose={() => setSetupSheet(null)}
        title="Holes"
        selectedId={holesChoice}
        onSelect={(id) => {
          setHolesChoice(id as HolesChoice);
          setSetupSheet(null);
        }}
        options={[
          { id: "9", label: "9 Holes" },
          { id: "18", label: "18 Holes" },
          { id: "not_sure", label: "Not Sure" },
        ]}
      />

      <SetupPickerSheet
        open={setupSheet === "tee"}
        onClose={() => setSetupSheet(null)}
        title="Tee box"
        selectedId={teeBoxId}
        expanded
        onSelect={(id) => {
          setTeeBoxId(id);
          setSetupSheet(null);
        }}
        options={sortedTees.map((tee) => ({
          id: tee.id,
          label: formatTeeColorLabel(tee.name),
        }))}
      />

      <SetupPickerSheet
        open={setupSheet === "roundType"}
        onClose={() => setSetupSheet(null)}
        title="Round type"
        selectedId={scoreType}
        onSelect={(id) => {
          setScoreType(id as ScoreType);
          setSetupSheet(null);
        }}
        options={[
          { id: "casual", label: "Casual" },
          { id: "tournament", label: "Tournament" },
        ]}
      />

      <SetupPickerSheet
        open={setupSheet === "scoring"}
        onClose={() => setSetupSheet(null)}
        title="Scoring"
        selectedId={scoringMode}
        onSelect={(id) => {
          setScoringMode(id as CasualScoringMode);
          setSetupSheet(null);
        }}
        options={[
          { id: "match_net", label: "Match (Net)" },
          { id: "match_gross", label: "Match (Gross)" },
          { id: "stroke", label: "Stroke" },
        ]}
      />

      <SetupPickerSheet
        open={setupSheet === "teams"}
        onClose={() => setSetupSheet(null)}
        title="Teams"
        selectedId={teamsEnabled ? "yes" : "no"}
        onSelect={(id) => {
          const yes = id === "yes";
          setTeamsEnabled(yes);
          if (yes) {
            setTeamByGolferId(balancedTeamAssignment(roster));
          }
          setSetupSheet(null);
        }}
        options={[
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ]}
      />

      <SetupPickerSheet
        open={teePickerGolferId != null}
        onClose={() => setTeePickerGolferId(null)}
        title="Tee box"
        selectedId={
          teePickerGolferId
            ? (golferTeeById[teePickerGolferId] ?? teeBoxId)
            : teeBoxId
        }
        expanded
        onSelect={(id) => {
          if (!teePickerGolferId) return;
          if (id === teeBoxId) {
            setGolferTeeById((prev) => {
              const next = { ...prev };
              delete next[teePickerGolferId];
              return next;
            });
          } else {
            setGolferTeeById((prev) => ({
              ...prev,
              [teePickerGolferId]: id,
            }));
          }
          setTeePickerGolferId(null);
        }}
        options={sortedTees.map((tee) => ({
          id: tee.id,
          label: formatTeeColorLabel(tee.name),
        }))}
      />

      <GolferActionSheet
        open={actionGolfer != null}
        golferName={actionGolfer?.name ?? ""}
        onClose={() => setActionGolfer(null)}
        onRemove={() => {
          if (actionGolfer) removePartner(actionGolfer.id);
        }}
        onChange={() => {
          if (actionGolfer) {
            setReplacingPartnerId(actionGolfer.id);
            setAddPlayersOpen(true);
          }
        }}
      />

      <StartHoleSheets
        presetsOpen={startHolePresetsOpen}
        allHolesOpen={startHoleAllOpen}
        onClosePresets={() => setStartHolePresetsOpen(false)}
        onCloseAllHoles={() => setStartHoleAllOpen(false)}
        onSelectHole={handleSelectStartHole}
        onChooseOther={() => {
          setStartHolePresetsOpen(false);
          setStartHoleAllOpen(true);
        }}
      />

      <AddPlayersSheet
        open={addPlayersOpen}
        onClose={() => {
          setAddPlayersOpen(false);
          setReplacingPartnerId(null);
        }}
        selected={[currentUserGolfer, ...addedPlayers]}
        onChangeSelected={(next) =>
          setAddedPlayers(
            next.filter((g) => g.id !== currentUserGolfer.id).slice(0, 3),
          )
        }
        currentUserGolfer={currentUserGolfer}
        maxPlayers={4}
        replacingPartnerId={replacingPartnerId}
        onReplacePartner={(partnerId, golfer) => {
          setAddedPlayers((list) =>
            list.map((p) => (p.id === partnerId ? golfer : p)),
          );
          setGolferTeeById((prev) => {
            const next = { ...prev };
            delete next[partnerId];
            return next;
          });
        }}
      />
    </div>
  );
}
