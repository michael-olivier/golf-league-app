export type UserRole = "player" | "admin";
export type LeagueLevel = "A" | "B";

export interface PlayerRecentRound {
  courseId: string;
  playedOn: string;
  holeCount: number;
  strokes: number;
}

export interface PlayerSeasonStats {
  roundsPlayed: number;
  averageScore: number;
  matchWins: number;
  matchLosses: number;
}

export interface Player {
  id: string;
  name: string;
  ghinNumber: string;
  handicapIndex: number;
  teamId: string;
  avatarUrl?: string;
  recentRound?: PlayerRecentRound;
  /** Score-to-par by round (oldest → newest) for the home sparkline. */
  recentScoreToParTrend?: number[];
  seasonStats?: PlayerSeasonStats;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  leagueLevel: LeagueLevel;
}

export interface Hole {
  number: number;
  par: number;
  /** When set and different from `par`, shown as women’s par on the scorecard. */
  parWomen?: number;
  handicapIndex: number;
}

export interface LeagueContact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface League {
  id: string;
  name: string;
  director?: LeagueContact;
  /** Full splash mark; otherwise the home course logo is used. */
  logoUrl?: string;
  /** Header mark on home (e.g. horizontal wordmark). */
  homeLogoUrl?: string;
  homeCourseId: string;
  /** When true, the home card shows the weekly game type instead of the course name. */
  sameHomeCourseEachWeek?: boolean;
  /** Holes played each league week (typically 9). */
  holesPerRound: 9 | 18;
  /** Which nine at the home course (holes 1–9 or 10–18). */
  nineSide: "front" | "back";
  /** Default tee set for league rounds at the home course. */
  defaultTeeBoxId: string;
}

export interface TeeBox {
  id: string;
  name: string;
  yardage: number;
  courseRating: number;
  slopeRating: number;
}

export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  tees: TeeBox[];
  logoUrl?: string;
}

/** Casual round vs tournament round (GHIN posting category). */
export type ScoreType = "casual" | "tournament";

/** Derived from GHIN home course vs selected course — not user-selected. */
export type ScorePostingSide = "home" | "away";

export type HolesChoice = "9" | "18" | "not_sure";

export type CasualScoringMode = "match_net" | "match_gross" | "stroke";

export interface ScoringGolfer {
  id: string;
  name: string;
  handicapIndex: number;
  homeCourseName: string;
  ghinNumber?: string;
  ratedTees?: "male" | "female";
  /** Per-golfer tee when different from the round default. */
  teeBoxId?: string;
  avatarUrl?: string;
}

export interface RoundSetup {
  sessionId: string;
  courseId: string;
  playDate: string;
  holesChoice: HolesChoice;
  holeCount: 9 | 18;
  teeBoxId: string;
  startHole: number;
  scoreType: ScoreType;
  scorePostingSide: ScorePostingSide;
  scoringMode: CasualScoringMode;
  playerCount: 1 | 2 | 3 | 4;
  courseHandicap: number;
  /** Golfers in this casual round (1–4), including the current user. */
  scoringGolfers: ScoringGolfer[];
  teamsEnabled?: boolean;
  /** Team index (0 or 1) when `teamsEnabled` and 3–4 players. */
  teamByGolferId?: Record<string, 0 | 1>;
  /** Course handicap per golfer for stroke / net scoring. */
  golferCourseHandicaps?: Record<string, number>;
}

export type DirectionalResult =
  | "forward"
  | "right"
  | "back"
  | "left"
  | "center";

export interface SimpleHoleScore {
  strokes: number | null;
}

export interface DetailedHoleScore extends SimpleHoleScore {
  fairwayHit: DirectionalResult | null;
  greenInRegulation: DirectionalResult | null;
  putts: number | null;
  penalties: number;
  sandSave: boolean | null;
  notes: string;
}

export type HoleScore = SimpleHoleScore | DetailedHoleScore;

export interface PlayerRound {
  playerId: string;
  scores: HoleScore[];
  scoreEntryMode: "simple" | "detailed";
}

export interface Foursome {
  id: string;
  matchId: string;
  playerIds: string[];
  designatedScorerId: string | null;
}

export type MatchStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "postponed";

export interface WeeklyMatch {
  id: string;
  weekNumber: number;
  date: string;
  courseId: string;
  /** e.g. Skins, Closest to the Pin — shown when the league uses one home course. */
  gameType?: string;
  status: MatchStatus;
  foursomes: Foursome[];
  teamPairing: { homeTeamId: string; awayTeamId: string };
  /** Short outcome for home “previous weeks” list, e.g. "Won 5–4". */
  resultLabel?: string;
}

export interface MakeupProposal {
  id: string;
  proposedByPlayerId: string;
  proposedByTeamId: string;
  date: string;
  teeTime: string;
  notes: string;
  createdAt: string;
  /** Players in the match who have confirmed this proposed date. */
  confirmedByPlayerIds: string[];
}

export type MakeupStatus = "open" | "confirmed" | "cancelled";

export interface MakeupRequest {
  id: string;
  matchId: string;
  status: MakeupStatus;
  proposals: MakeupProposal[];
  confirmedProposalId: string | null;
  createdByPlayerId: string;
  createdAt: string;
}

export interface LeagueState {
  league: League;
  currentUserId: string;
  role: UserRole;
  teams: Team[];
  players: Player[];
  courses: Course[];
  matches: WeeklyMatch[];
  makeupRequests: MakeupRequest[];
  rounds: Record<string, PlayerRound>;
}

export function isDetailedScore(score: HoleScore): score is DetailedHoleScore {
  return "putts" in score;
}

export function emptySimpleScore(): SimpleHoleScore {
  return { strokes: null };
}

export function initialHoleScore(mode: "simple" | "detailed"): HoleScore {
  if (mode === "detailed") {
    return emptyDetailedScore();
  }
  return emptySimpleScore();
}

export function isHolePlayed(score: HoleScore | undefined): boolean {
  return score?.strokes !== null && score?.strokes !== undefined;
}

export function emptyDetailedScore(): DetailedHoleScore {
  return {
    strokes: null,
    fairwayHit: null,
    greenInRegulation: null,
    putts: null,
    penalties: 0,
    sandSave: null,
    notes: "",
  };
}

export function roundKey(matchId: string, playerId: string): string {
  return `${matchId}:${playerId}`;
}
