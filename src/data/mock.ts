import type {
  Course,
  League,
  LeagueState,
  MakeupRequest,
  Player,
  Team,
  WeeklyMatch,
} from "../types";
import { roundKey } from "../types";
import { buildSimpleRound } from "../utils/matchScorecard";
import { playerPortraitPath } from "../utils/playerAvatarUrl";

export const league: League = {
  id: "league-sandbagger",
  name: "Sandbagger",
  logoUrl: "/logos/sandbagger.png",
  homeLogoUrl: "/logos/sandbagger-horizontal.png",
  homeCourseId: "course-oakmont",
  sameHomeCourseEachWeek: true,
  holesPerRound: 9,
  nineSide: "front",
  defaultTeeBoxId: "oakmont-blue",
  director: {
    id: "courtney-houska",
    name: "Courtney Houska",
    role: "League Director",
    email: "courtney.houska@oakmontvalley.example",
    phone: "(303) 555-0142",
  },
};

const teamColors = [
  "#6b7280",
  "#94a3b8",
  "#78716c",
  "#71717a",
  "#64748b",
  "#a8a29e",
  "#52525b",
  "#737373",
  "#475569",
  "#9ca3af",
];

const roster = {
  A: [
    { team: "Aces", players: ["Michael Olivier", "Sarah Chen"] },
    { team: "Birdie Hunters", players: ["Tom Bradley", "Anna Reyes"] },
    { team: "Pin Seekers", players: ["James Park", "Lisa Morgan"] },
    { team: "Green Jackets", players: ["Dave Wilson", "Kate Nguyen"] },
    { team: "Fairway Finders", players: ["Carlos Rivera", "Megan Brooks"] },
    { team: "Eagle Point", players: ["Ben Carter", "Priya Patel"] },
    { team: "Flag Hunters", players: ["Ryan Murphy", "Olivia Grant"] },
    { team: "Short Grass", players: ["Nate Collins", "Emily Foster"] },
    { team: "Back Nine", players: ["Chris Bennett", "Lauren Hayes"] },
    { team: "Draw Bias", players: ["Evan Scott", "Rachel Kim"] },
    { team: "Tempo Kings", players: ["Marcus Reed", "Tara Singh"] },
    { team: "Sand Savers", players: ["Noah Phillips", "Julia Adams"] },
    { team: "Cup Cutters", players: ["Owen Hughes", "Grace Turner"] },
    { team: "Pure Roll", players: ["Alex Romero", "Hannah Price"] },
    { team: "Tee Box Two", players: ["Dylan Cooper", "Sofia Martinez"] },
    { team: "Stinger Squad", players: ["Jack Thompson", "Maya Lewis"] },
    { team: "Lag Putts", players: ["Tyler Evans", "Claire Fisher"] },
    { team: "Up and Downs", players: ["Sam Walker", "Alyssa Ward"] },
    { team: "Range Rats", players: ["Kevin Ross", "Nina Barnes"] },
    { team: "Net Winners", players: ["Eric James", "Paige Howard"] },
  ],
  B: [
    { team: "Bogey Brigade", players: ["Matt Ellis", "Dana Fox"] },
    { team: "Mulligan Crew", players: ["Brian Stone", "Kelly Watts"] },
    { team: "Cart Path Only", players: ["Sean Walsh", "Erin Doyle"] },
    { team: "Breakfast Balls", players: ["Patrick Lane", "Molly Quinn"] },
    { team: "Rough Riders", players: ["Jason Miller", "Lindsey Hart"] },
    { team: "Double Bogey", players: ["Adam Cox", "Tina Bell"] },
    { team: "Wedge Works", players: ["Greg Allen", "Monica Gray"] },
    { team: "Bunker Buddies", players: ["Ian Brooks", "Leah Kelly"] },
    { team: "Three Putts", players: ["Trevor Young", "Amy Peterson"] },
    { team: "Wide Rights", players: ["Colin Reed", "Jenna Miles"] },
    { team: "The Scramblers", players: ["Peter Shaw", "Laura Bishop"] },
    { team: "High Handicaps", players: ["Victor Cruz", "Beth Morris"] },
    { team: "Club Twirlers", players: ["Frank Diaz", "Mia Simmons"] },
    { team: "Pace Setters", players: ["Gavin Nelson", "Brooke Perry"] },
    { team: "Hazard Pay", players: ["Luke Sanders", "Chloe Russell"] },
    { team: "Fore Friends", players: ["Neil Bryant", "Riley Coleman"] },
    { team: "Dimpled Dreams", players: ["Oscar Jenkins", "Zoe Powell"] },
    { team: "Par Patrol", players: ["Wes Morgan", "Natalie Griffin"] },
    { team: "Grip It", players: ["Henry Long", "Kara Simmons"] },
    { team: "Tin Cup", players: ["Cole Bennett", "Sienna Flores"] },
  ],
} as const;

function teamId(leagueLevel: "A" | "B", index: number): string {
  return `team-${leagueLevel.toLowerCase()}-${String(index + 1).padStart(2, "0")}`;
}

function playerId(leagueLevel: "A" | "B", teamIndex: number, playerIndex: number): string {
  return `player-${leagueLevel.toLowerCase()}-${String(teamIndex + 1).padStart(2, "0")}-${playerIndex + 1}`;
}

/** Spread indexes so head-to-head match play allocates visible strokes (pops). */
function mockHandicapIndex(
  leagueLevel: "A" | "B",
  teamIndex: number,
  playerIndex: number,
): number {
  const base = leagueLevel === "A" ? 4.0 : 15.0;
  const teamOffset = leagueLevel === "A" ? 5.0 : 4.5;
  const partnerGap = leagueLevel === "A" ? 7.0 : 6.0;
  // Alternate team strength so foursome pairs (0 vs 2, 1 vs 3) get stroke gaps
  const teamScratch =
    base + (teamIndex % 2) * teamOffset + Math.floor(teamIndex / 2) * 0.4;
  return Number((teamScratch + playerIndex * partnerGap).toFixed(1));
}

export const teams: Team[] = (["A", "B"] as const).flatMap((leagueLevel) =>
  roster[leagueLevel].map((entry, index) => ({
    id: teamId(leagueLevel, index),
    name: entry.team,
    color: teamColors[index % teamColors.length],
    leagueLevel,
  })),
);

export const players: Player[] = (["A", "B"] as const).flatMap((leagueLevel) =>
  roster[leagueLevel].flatMap((entry, teamIndex) =>
    entry.players.map((name, playerIndex) => {
      const id = playerId(leagueLevel, teamIndex, playerIndex);
      return {
        id,
        name,
        avatarUrl: playerPortraitPath(leagueLevel, teamIndex, playerIndex),
        ghinNumber: `${leagueLevel === "A" ? "1" : "2"}${String(teamIndex + 1).padStart(2, "0")}${playerIndex + 1}00${teamIndex + playerIndex + 7}`,
        handicapIndex: mockHandicapIndex(leagueLevel, teamIndex, playerIndex),
        teamId: teamId(leagueLevel, teamIndex),
        ...(id === "player-a-01-1"
          ? {
              recentRound: {
                courseId: "course-oakmont",
                playedOn: "2026-05-24",
                holeCount: 9,
                strokes: 42,
              },
              recentScoreToParTrend: [8, 7, 6, 5, 6],
            }
          : {}),
        seasonStats: {
          roundsPlayed: 2 + (teamIndex % 4),
          averageScore: Math.round(39 + playerIndex + teamIndex * 0.6),
          matchWins: 1 + (teamIndex % 3),
          matchLosses: teamIndex % 2,
        },
      };
    }),
  ),
);

const standardPars = [4, 5, 4, 3, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4];
const standardHandicaps = [7, 3, 11, 15, 1, 9, 17, 5, 13, 8, 16, 2, 12, 4, 18, 6, 10, 14];

const oakmontHoles = standardPars.map((par, i) => {
  const number = i + 1;
  return {
    number,
    par,
    ...(par === 5 && (number === 2 || number === 8 || number === 12 || number === 17)
      ? { parWomen: 4 }
      : {}),
    handicapIndex: standardHandicaps[i],
  };
});

export const courses: Course[] = [
  {
    id: "course-oakmont",
    name: "Oakmont Valley Golf Club",
    logoUrl: "/logos/oakmont-valley.svg",
    holes: oakmontHoles,
    tees: [
      {
        id: "oakmont-blue",
        name: "Blue",
        yardage: 6520,
        courseRating: 71.2,
        slopeRating: 132,
      },
      {
        id: "oakmont-white",
        name: "White",
        yardage: 6048,
        courseRating: 68.9,
        slopeRating: 126,
      },
      {
        id: "oakmont-gold",
        name: "Gold",
        yardage: 5580,
        courseRating: 66.1,
        slopeRating: 118,
      },
    ],
  },
  {
    id: "course-pinehurst",
    name: "Pinehurst Links",
    holes: oakmontHoles,
    tees: [
      {
        id: "pine-blue",
        name: "Blue",
        yardage: 6310,
        courseRating: 70.4,
        slopeRating: 128,
      },
      {
        id: "pine-white",
        name: "White",
        yardage: 5890,
        courseRating: 67.8,
        slopeRating: 121,
      },
    ],
  },
];

export const matches: WeeklyMatch[] = [
  {
    id: "match-week-1",
    weekNumber: 1,
    date: "2026-05-17",
    courseId: "course-oakmont",
    gameType: "Stroke play",
    status: "completed",
    teamPairing: {
      homeTeamId: "team-a-01",
      awayTeamId: "team-a-05",
    },
    foursomes: [
      {
        id: "foursome-week-1",
        matchId: "match-week-1",
        playerIds: [
          "player-a-01-1",
          "player-a-01-2",
          "player-a-05-1",
          "player-a-05-2",
        ],
        designatedScorerId: "player-a-01-1",
      },
    ],
    resultLabel: "Won 5–4",
  },
  {
    id: "match-week-2",
    weekNumber: 2,
    date: "2026-05-24",
    courseId: "course-oakmont",
    gameType: "Best ball",
    status: "completed",
    teamPairing: {
      homeTeamId: "team-a-03",
      awayTeamId: "team-a-04",
    },
    foursomes: [],
  },
  {
    id: "match-week-3",
    weekNumber: 3,
    date: "2026-05-31",
    courseId: "course-oakmont",
    status: "postponed",
    teamPairing: {
      homeTeamId: "team-a-02",
      awayTeamId: "team-a-01",
    },
    foursomes: [],
  },
  {
    id: "match-week-4",
    weekNumber: 4,
    date: "2026-06-07",
    courseId: "course-oakmont",
    gameType: "Skins",
    status: "in_progress",
    teamPairing: {
      homeTeamId: "team-a-01",
      awayTeamId: "team-a-02",
    },
    foursomes: [
      {
        id: "foursome-1",
        matchId: "match-week-4",
        playerIds: [
          "player-a-01-1",
          "player-a-01-2",
          "player-a-02-1",
          "player-a-02-2",
        ],
        designatedScorerId: "player-a-01-1",
      },
    ],
  },
  {
    id: "match-week-5",
    weekNumber: 5,
    date: "2026-06-14",
    courseId: "course-oakmont",
    status: "scheduled",
    teamPairing: {
      homeTeamId: "team-a-03",
      awayTeamId: "team-a-04",
    },
    foursomes: [],
  },
];

export const makeupRequests: MakeupRequest[] = [
  {
    id: "makeup-week-3",
    matchId: "match-week-3",
    status: "open",
    createdByPlayerId: "player-a-02-1",
    createdAt: "2026-06-01T10:00:00",
    confirmedProposalId: null,
    proposals: [
      {
        id: "proposal-1",
        proposedByPlayerId: "player-a-02-1",
        proposedByTeamId: "team-a-02",
        date: "2026-06-10",
        teeTime: "17:30",
        notes: "Twilight rates — can we do late afternoon?",
        createdAt: "2026-06-01T10:15:00",
        confirmedByPlayerIds: ["player-a-02-1", "player-a-02-2"],
      },
      {
        id: "proposal-2",
        proposedByPlayerId: "player-a-01-2",
        proposedByTeamId: "team-a-01",
        date: "2026-06-12",
        teeTime: "16:00",
        notes: "Works better for our side after work.",
        createdAt: "2026-06-02T08:30:00",
        confirmedByPlayerIds: ["player-a-01-2", "player-a-01-1"],
      },
    ],
  },
];

const week1StrokeLines: Record<string, number[]> = {
  "player-a-01-1": [5, 5, 4, 3, 5, 4, 3, 5, 4],
  "player-a-01-2": [4, 6, 4, 4, 4, 5, 3, 6, 4],
  "player-a-05-1": [5, 6, 5, 4, 5, 5, 4, 6, 5],
  "player-a-05-2": [6, 5, 5, 3, 5, 5, 4, 7, 5],
};

const week1Rounds = Object.fromEntries(
  Object.entries(week1StrokeLines).map(([playerId, strokes]) => [
    roundKey("match-week-1", playerId),
    buildSimpleRound(playerId, strokes),
  ]),
);

export const initialLeagueState: LeagueState = {
  league,
  currentUserId: "player-a-01-1",
  role: "admin",
  teams,
  players,
  courses,
  matches,
  makeupRequests,
  rounds: week1Rounds,
};
