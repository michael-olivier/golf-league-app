export type UserRole = "player" | "admin";
export type LeagueLevel = "A" | "B";

export interface Player {
  id: string;
  name: string;
  ghinNumber: string;
  handicapIndex: number;
  teamId: string;
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
  handicapIndex: number;
}

export interface League {
  id: string;
  name: string;
  /** Shown on splash when set; otherwise the home course logo is used. */
  logoUrl?: string;
  homeCourseId: string;
  /** When true, the home card shows the weekly game type instead of the course name. */
  sameHomeCourseEachWeek?: boolean;
}

export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  logoUrl?: string;
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
}

export interface MakeupProposal {
  id: string;
  proposedByPlayerId: string;
  proposedByTeamId: string;
  date: string;
  teeTime: string;
  notes: string;
  createdAt: string;
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
