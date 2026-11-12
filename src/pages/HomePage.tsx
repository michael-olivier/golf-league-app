import { useEffect, useMemo, useRef, useState } from "react";
import { LandPlot, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomeRiseIn } from "../components/home/HomeRiseIn";
import { HomeLeagueFeaturedCard } from "../components/home/HomeLeagueFeaturedCard";
import { HomeScoringAverageCard } from "../components/home/HomeScoringAverageCard";
import { LeagueMatchDetailModal } from "../components/league/LeagueMatchDetailModal";
import {
  HomeHeroBackdrop,
  HomeHeroLogo,
} from "../components/home/HomeHeroHeader";
import { RecentRoundDetailModal } from "../components/recentRound/RecentRoundDetailModal";
import {
  markHomeEntrancePlayed,
  shouldPlayHomeEntrance,
} from "../components/home/homeMotion";
import { useLeague } from "../store/LeagueContext";
import { assetUrl } from "../utils/assetUrl";
import { upcomingMatchForPlayer } from "../utils/leagueMatch";
import { recentCourseHeroUrl } from "../utils/recentCourseHero";
import { homeLeagueStackMatches, recentRoundsForPlayer } from "../utils/homeStacks";
import type { PlayerRecentRound } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const { currentPlayer, getCourse, getTeam, state } = useLeague();

  const [leagueMatchDetailId, setLeagueMatchDetailId] = useState<string | null>(
    null,
  );
  const [recentRoundOpen, setRecentRoundOpen] = useState(false);
  const [selectedRecent, setSelectedRecent] =
    useState<PlayerRecentRound | null>(null);

  const recentRounds = useMemo(
    () => recentRoundsForPlayer(currentPlayer),
    [currentPlayer],
  );

  const upcomingMatch = useMemo(
    () => upcomingMatchForPlayer(currentPlayer, state.matches),
    [currentPlayer, state.matches],
  );

  const recentLeagueMatches = useMemo(() => {
    return homeLeagueStackMatches(currentPlayer, state.matches)
      .filter((m) => m.status === "completed")
      .slice(0, 3);
  }, [currentPlayer, state.matches]);

  const leagueMatchDetail = useMemo(
    () =>
      leagueMatchDetailId
        ? state.matches.find((m) => m.id === leagueMatchDetailId)
        : undefined,
    [leagueMatchDetailId, state.matches],
  );
  const leagueMatchDetailCourse = leagueMatchDetail
    ? getCourse(leagueMatchDetail.courseId)
    : undefined;

  const homeLogoUrl = state.league.homeLogoUrl
    ? assetUrl(state.league.homeLogoUrl)
    : null;
  const heroImageUrl = recentCourseHeroUrl(currentPlayer, getCourse);

  const playEntrance = useRef(shouldPlayHomeEntrance()).current;

  useEffect(() => {
    if (playEntrance) markHomeEntrancePlayed();
  }, [playEntrance]);

  const modalRecent = selectedRecent ?? recentRounds[0];
  const modalRecentCourse = modalRecent
    ? getCourse(modalRecent.courseId)
    : undefined;

  return (
    <div className="home-wallet-page relative -mx-4 flex min-h-0 flex-1 flex-col overflow-hidden">
      <HomeHeroBackdrop imageUrl={heroImageUrl} />

      <div className="home-figma-stack relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        <div className="home-figma-logo-wrap">
          <HomeRiseIn index={0} animate={playEntrance}>
            <HomeHeroLogo logoUrl={homeLogoUrl} animateLogo={playEntrance} />
          </HomeRiseIn>
        </div>

        {recentRounds.length > 0 ? (
          <HomeRiseIn index={1} animate={playEntrance}>
            <div className="home-pass-section">
              <LandPlot
                aria-hidden
                className="home-pass-section-icon"
                strokeWidth={1.5}
              />
              <span className="home-pass-section-label">Scoring average</span>
            </div>
            <HomeScoringAverageCard
              player={currentPlayer}
              league={state.league}
              recentRounds={recentRounds}
              getCourse={getCourse}
              playEntrance={playEntrance}
              riseIndex={1}
              onOpenRound={(round) => {
                setSelectedRecent(round);
                setRecentRoundOpen(true);
              }}
            />
          </HomeRiseIn>
        ) : null}

        {upcomingMatch ? (
          <HomeRiseIn index={2} animate={playEntrance}>
            <div className="home-pass-section mt-6">
              <Trophy
                aria-hidden
                className="home-pass-section-icon"
                strokeWidth={1.5}
              />
              <span className="home-pass-section-label">Sandbagger league</span>
            </div>
            <HomeLeagueFeaturedCard
              match={upcomingMatch}
              league={state.league}
              players={state.players}
              viewer={currentPlayer}
              rounds={state.rounds}
              recentMatches={recentLeagueMatches}
              getCourse={getCourse}
              getTeam={getTeam}
              onStartRound={() => navigate("/scores/league")}
              onOpenMatch={(m) => setLeagueMatchDetailId(m.id)}
            />
          </HomeRiseIn>
        ) : null}
      </div>

      {modalRecent && modalRecentCourse ? (
        <RecentRoundDetailModal
          open={recentRoundOpen}
          onClose={() => {
            setRecentRoundOpen(false);
            setSelectedRecent(null);
          }}
          player={currentPlayer}
          course={modalRecentCourse}
          recent={modalRecent}
          league={state.league}
        />
      ) : null}

      {leagueMatchDetail && leagueMatchDetailCourse ? (
        <LeagueMatchDetailModal
          open={!!leagueMatchDetailId}
          onClose={() => setLeagueMatchDetailId(null)}
          match={leagueMatchDetail}
          course={leagueMatchDetailCourse}
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
