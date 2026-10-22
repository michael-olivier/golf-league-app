import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialLeagueState } from "../data/mock";
import {
  allMatchPlayersConfirmedProposal,
  isOnMatchTeam,
  makeupForMatch,
} from "../utils/makeup";
import { matchRoundHasStarted } from "../utils/matchScores";
import type {
  Course,
  Foursome,
  HoleScore,
  LeagueState,
  MakeupProposal,
  MakeupRequest,
  PlayerRound,
  WeeklyMatch,
} from "../types";
import {
  emptyDetailedScore,
  emptySimpleScore,
  initialHoleScore,
  isDetailedScore,
  roundKey,
} from "../types";

interface LeagueContextValue {
  state: LeagueState;
  currentPlayer: LeagueState["players"][0];
  activeMatch: WeeklyMatch | undefined;
  getPlayer: (id: string) => LeagueState["players"][0] | undefined;
  getTeam: (id: string) => LeagueState["teams"][0] | undefined;
  getCourse: (id: string) => LeagueState["courses"][0] | undefined;
  upsertCourse: (course: Course) => void;
  getFoursomeForUser: (matchId: string) => Foursome | undefined;
  getRound: (matchId: string, playerId: string) => PlayerRound | undefined;
  ensureRound: (
    matchId: string,
    playerId: string,
    mode: "simple" | "detailed",
    holePars: number[],
  ) => void;
  updateHoleScore: (
    matchId: string,
    playerId: string,
    holeIndex: number,
    updater: (prev: HoleScore) => HoleScore,
  ) => void;
  setRoundScoreEntryMode: (
    matchId: string,
    playerId: string,
    mode: "simple" | "detailed",
  ) => void;
  setDesignatedScorer: (
    matchId: string,
    foursomeId: string,
    playerId: string | null,
  ) => void;
  addMatch: (match: WeeklyMatch) => void;
  updateMatch: (matchId: string, patch: Partial<WeeklyMatch>) => void;
  setMatchFoursomes: (matchId: string, foursomes: Foursome[]) => void;
  getMakeupForMatch: (matchId: string) => MakeupRequest | undefined;
  getTeamMakeups: () => {
    match: WeeklyMatch;
    makeup: MakeupRequest;
  }[];
  getPostponedMatchesForTeam: () => WeeklyMatch[];
  startMakeupRequest: (matchId: string) => MakeupRequest | null;
  addMakeupProposal: (
    makeupId: string,
    input: Pick<MakeupProposal, "date" | "teeTime" | "notes">,
  ) => void;
  confirmMakeupProposal: (makeupId: string, proposalId: string) => void;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LeagueState>(initialLeagueState);

  const currentPlayer = useMemo(
    () =>
      state.players.find((p) => p.id === state.currentUserId) ??
      state.players[0],
    [state.currentUserId, state.players],
  );

  const activeMatch = useMemo(
    () =>
      state.matches.find(
        (m) => m.status === "in_progress" || m.status === "scheduled",
      ),
    [state.matches],
  );

  const getPlayer = useCallback(
    (id: string) => state.players.find((p) => p.id === id),
    [state.players],
  );

  const getTeam = useCallback(
    (id: string) => state.teams.find((t) => t.id === id),
    [state.teams],
  );

  const getCourse = useCallback(
    (id: string) => state.courses.find((c) => c.id === id),
    [state.courses],
  );

  const upsertCourse = useCallback((course: Course) => {
    setState((prev) => {
      const index = prev.courses.findIndex((c) => c.id === course.id);
      if (index >= 0) {
        const courses = [...prev.courses];
        courses[index] = course;
        return { ...prev, courses };
      }
      return { ...prev, courses: [...prev.courses, course] };
    });
  }, []);

  const getFoursomeForUser = useCallback(
    (matchId: string) => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match) return undefined;
      return match.foursomes.find((f) =>
        f.playerIds.includes(state.currentUserId),
      );
    },
    [state.currentUserId, state.matches],
  );

  const getRound = useCallback(
    (matchId: string, playerId: string) => {
      const key = roundKey(matchId, playerId);
      return state.rounds[key];
    },
    [state.rounds],
  );

  const ensureRound = useCallback(
    (
      matchId: string,
      playerId: string,
      mode: "simple" | "detailed",
      holePars: number[],
    ) => {
      const key = roundKey(matchId, playerId);
      setState((prev) => {
        if (prev.rounds[key]) return prev;
        const scores: HoleScore[] = holePars.map(() => initialHoleScore(mode));
        return {
          ...prev,
          rounds: {
            ...prev.rounds,
            [key]: { playerId, scores, scoreEntryMode: mode },
          },
        };
      });
    },
    [],
  );

  const updateHoleScore = useCallback(
    (
      matchId: string,
      playerId: string,
      holeIndex: number,
      updater: (prev: HoleScore) => HoleScore,
    ) => {
      const key = roundKey(matchId, playerId);
      setState((prev) => {
        const round = prev.rounds[key];
        if (!round) return prev;
        const scores = [...round.scores];
        scores[holeIndex] = updater(scores[holeIndex]);
        return {
          ...prev,
          rounds: { ...prev.rounds, [key]: { ...round, scores } },
        };
      });
    },
    [],
  );

  const setRoundScoreEntryMode = useCallback(
    (
      matchId: string,
      playerId: string,
      mode: "simple" | "detailed",
    ) => {
      const key = roundKey(matchId, playerId);
      setState((prev) => {
        const round = prev.rounds[key];
        if (!round) return prev;
        const scores = round.scores.map((s) => {
          const strokes = s?.strokes ?? null;
          if (mode === "detailed") {
            return isDetailedScore(s)
              ? { ...s, strokes }
              : { ...emptyDetailedScore(), strokes };
          }
          return { strokes };
        });
        return {
          ...prev,
          rounds: {
            ...prev.rounds,
            [key]: { ...round, scores, scoreEntryMode: mode },
          },
        };
      });
    },
    [],
  );

  const setDesignatedScorer = useCallback(
    (matchId: string, foursomeId: string, playerId: string | null) => {
      setState((prev) => {
        const match = prev.matches.find((m) => m.id === matchId);
        if (matchRoundHasStarted(match, prev)) {
          return prev;
        }
        return {
          ...prev,
          matches: prev.matches.map((m) =>
            m.id !== matchId
              ? m
              : {
                  ...m,
                  foursomes: m.foursomes.map((f) =>
                    f.id !== foursomeId
                      ? f
                      : { ...f, designatedScorerId: playerId },
                  ),
                },
          ),
        };
      });
    },
    [],
  );

  const addMatch = useCallback((match: WeeklyMatch) => {
    setState((prev) => ({
      ...prev,
      matches: [...prev.matches, match],
    }));
  }, []);

  const updateMatch = useCallback(
    (matchId: string, patch: Partial<WeeklyMatch>) => {
      setState((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId ? { ...m, ...patch } : m,
        ),
      }));
    },
    [],
  );

  const setMatchFoursomes = useCallback(
    (matchId: string, foursomes: Foursome[]) => {
      setState((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId ? { ...m, foursomes } : m,
        ),
      }));
    },
    [],
  );

  const getMakeupForMatch = useCallback(
    (matchId: string) => makeupForMatch(state.makeupRequests, matchId),
    [state.makeupRequests],
  );

  const getTeamMakeups = useCallback(() => {
    const teamId = currentPlayer.teamId;
    return state.makeupRequests
      .filter((m) => m.status !== "cancelled")
      .map((makeup) => {
        const match = state.matches.find((m) => m.id === makeup.matchId);
        return match && isOnMatchTeam(match, teamId) ? { match, makeup } : null;
      })
      .filter((x): x is { match: WeeklyMatch; makeup: MakeupRequest } => !!x);
  }, [state.makeupRequests, state.matches, currentPlayer.teamId]);

  const getPostponedMatchesForTeam = useCallback(() => {
    const teamId = currentPlayer.teamId;
    return state.matches.filter(
      (m) =>
        m.status === "postponed" &&
        isOnMatchTeam(m, teamId) &&
        !makeupForMatch(state.makeupRequests, m.id),
    );
  }, [state.matches, state.makeupRequests, currentPlayer.teamId]);

  const startMakeupRequest = useCallback(
    (matchId: string): MakeupRequest | null => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match || match.status !== "postponed") return null;
      if (!isOnMatchTeam(match, currentPlayer.teamId)) return null;
      if (makeupForMatch(state.makeupRequests, matchId)) return null;

      const request: MakeupRequest = {
        id: `makeup-${matchId}-${Date.now()}`,
        matchId,
        status: "open",
        proposals: [],
        confirmedProposalId: null,
        createdByPlayerId: state.currentUserId,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        makeupRequests: [...prev.makeupRequests, request],
      }));
      return request;
    },
    [state.matches, state.makeupRequests, state.currentUserId, currentPlayer.teamId],
  );

  const addMakeupProposal = useCallback(
    (
      makeupId: string,
      input: Pick<MakeupProposal, "date" | "teeTime" | "notes">,
    ) => {
      setState((prev) => {
        const makeup = prev.makeupRequests.find((m) => m.id === makeupId);
        if (!makeup || makeup.status !== "open") return prev;

        const match = prev.matches.find((m) => m.id === makeup.matchId);
        if (!match || !isOnMatchTeam(match, currentPlayer.teamId)) return prev;

        const proposal: MakeupProposal = {
          id: `proposal-${Date.now()}`,
          proposedByPlayerId: prev.currentUserId,
          proposedByTeamId: currentPlayer.teamId,
          date: input.date,
          teeTime: input.teeTime,
          notes: input.notes.trim(),
          createdAt: new Date().toISOString(),
          confirmedByPlayerIds: [prev.currentUserId],
        };

        return {
          ...prev,
          makeupRequests: prev.makeupRequests.map((m) =>
            m.id !== makeupId
              ? m
              : { ...m, proposals: [...m.proposals, proposal] },
          ),
        };
      });
    },
    [currentPlayer.teamId],
  );

  const confirmMakeupProposal = useCallback(
    (makeupId: string, proposalId: string) => {
      setState((prev) => {
        const makeup = prev.makeupRequests.find((m) => m.id === makeupId);
        if (!makeup || makeup.status !== "open") return prev;

        const proposal = makeup.proposals.find((p) => p.id === proposalId);
        if (!proposal) return prev;

        const match = prev.matches.find((m) => m.id === makeup.matchId);
        if (!match || !isOnMatchTeam(match, currentPlayer.teamId)) return prev;

        if (proposal.confirmedByPlayerIds.includes(prev.currentUserId)) {
          return prev;
        }

        const updatedProposal: MakeupProposal = {
          ...proposal,
          confirmedByPlayerIds: [
            ...proposal.confirmedByPlayerIds,
            prev.currentUserId,
          ],
        };

        const lockIn = allMatchPlayersConfirmedProposal(
          updatedProposal,
          match,
          prev.players,
        );

        const makeupRequests = prev.makeupRequests.map((m) => {
          if (m.id !== makeupId) return m;
          return {
            ...m,
            proposals: lockIn
              ? [updatedProposal]
              : m.proposals.map((p) =>
                  p.id === proposalId ? updatedProposal : p,
                ),
            ...(lockIn
              ? {
                  status: "confirmed" as const,
                  confirmedProposalId: proposalId,
                }
              : {}),
          };
        });

        if (!lockIn) {
          return { ...prev, makeupRequests };
        }

        return {
          ...prev,
          matches: prev.matches.map((m) =>
            m.id !== makeup.matchId
              ? m
              : {
                  ...m,
                  date: updatedProposal.date,
                  status: "scheduled" as const,
                },
          ),
          makeupRequests,
        };
      });
    },
    [currentPlayer.teamId],
  );

  const value = useMemo(
    () => ({
      state,
      currentPlayer,
      activeMatch,
      getPlayer,
      getTeam,
      getCourse,
      upsertCourse,
      getFoursomeForUser,
      getRound,
      ensureRound,
      updateHoleScore,
      setRoundScoreEntryMode,
      setDesignatedScorer,
      addMatch,
      updateMatch,
      setMatchFoursomes,
      getMakeupForMatch,
      getTeamMakeups,
      getPostponedMatchesForTeam,
      startMakeupRequest,
      addMakeupProposal,
      confirmMakeupProposal,
    }),
    [
      state,
      currentPlayer,
      activeMatch,
      getPlayer,
      getTeam,
      getCourse,
      upsertCourse,
      getFoursomeForUser,
      getRound,
      ensureRound,
      updateHoleScore,
      setRoundScoreEntryMode,
      setDesignatedScorer,
      addMatch,
      updateMatch,
      setMatchFoursomes,
      getMakeupForMatch,
      getTeamMakeups,
      getPostponedMatchesForTeam,
      startMakeupRequest,
      addMakeupProposal,
      confirmMakeupProposal,
    ],
  );

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague must be used within LeagueProvider");
  return ctx;
}

export function totalStrokes(scores: HoleScore[]): number | null {
  if (scores.some((s) => s.strokes === null)) return null;
  return scores.reduce((sum, s) => sum + (s.strokes ?? 0), 0);
}

export function toPar(scores: HoleScore[], pars: number[]): number | null {
  const total = totalStrokes(scores);
  if (total === null) return null;
  return total - pars.reduce((a, b) => a + b, 0);
}

/** Strokes and to-par counting only holes the player has entered. */
export function playedTotalStrokes(scores: HoleScore[]): number {
  return scores.reduce(
    (sum, s) => sum + (s.strokes !== null ? s.strokes : 0),
    0,
  );
}

export function playedToPar(scores: HoleScore[], pars: number[]): number {
  let strokes = 0;
  let par = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i]?.strokes !== null) {
      strokes += scores[i].strokes ?? 0;
      par += pars[i] ?? 0;
    }
  }
  return strokes - par;
}

export {
  isDetailedScore,
  emptyDetailedScore,
  emptySimpleScore,
  initialHoleScore,
};
