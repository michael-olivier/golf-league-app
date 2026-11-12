import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitleSection } from "../components/PageTitleSection";
import { LeagueRecentMatchPreviewCard } from "../components/league/LeagueRecentMatchPreviewCard";
import { LeagueMatchDetailModal } from "../components/league/LeagueMatchDetailModal";
import { useLeague } from "../store/LeagueContext";
import { previousCompletedTeamMatches } from "../utils/leagueMatch";

export function LeaguePreviousMatchesPage() {
  const navigate = useNavigate();
  const { state, currentPlayer, getCourse, getTeam } = useLeague();
  const [matchDetailId, setMatchDetailId] = useState<string | null>(null);

  const matches = useMemo(
    () =>
      previousCompletedTeamMatches(
        currentPlayer,
        state.matches,
        Number.MAX_SAFE_INTEGER,
      ),
    [currentPlayer, state.matches],
  );

  const matchDetail = matchDetailId
    ? state.matches.find((m) => m.id === matchDetailId)
    : undefined;
  const matchDetailCourse = matchDetail
    ? getCourse(matchDetail.courseId)
    : undefined;

  return (
    <div className="space-y-5 pb-4">
      <PageTitleSection
        title="Previous matches"
        onBack={() => navigate("/league")}
        backAriaLabel="Back to league"
      />

      {matches.length === 0 ? (
        <div className="page-title-gutter rounded-xl border border-sand-hunter bg-white/60 px-4 py-8 text-center text-sm text-fairway-500">
          No completed matches yet.
        </div>
      ) : (
        <ul className="page-title-gutter space-y-3">
          {matches.map((match) => {
            const course = getCourse(match.courseId);
            if (!course) return null;
            return (
              <li key={match.id}>
                <LeagueRecentMatchPreviewCard
                  match={match}
                  course={course}
                  league={state.league}
                  viewer={currentPlayer}
                  players={state.players}
                  rounds={state.rounds}
                  homeTeam={getTeam(match.teamPairing.homeTeamId)}
                  awayTeam={getTeam(match.teamPairing.awayTeamId)}
                  onOpen={() => setMatchDetailId(match.id)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {matchDetail && matchDetailCourse ? (
        <LeagueMatchDetailModal
          open={matchDetailId != null}
          onClose={() => setMatchDetailId(null)}
          match={matchDetail}
          course={matchDetailCourse}
          league={state.league}
          viewer={currentPlayer}
          players={state.players}
          rounds={state.rounds}
          getTeam={getTeam}
        />
      ) : null}
    </div>
  );
}
