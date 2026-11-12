import { HomeHeroBackdrop } from "../components/home/HomeHeroHeader";
import { PageTitleSection } from "../components/PageTitleSection";
import { LeagueWeekSection } from "../components/league/LeagueWeekSection";
import { MakeupUrgentBanner } from "../components/league/MakeupUrgentBanner";
import { LeagueNavTileGrid } from "../components/league/LeagueNavTileGrid";
import { useLeague } from "../store/LeagueContext";
import { assetUrl } from "../utils/assetUrl";

export function LeaguePage() {
  const { state, getCourse } = useLeague();
  const homeCourse = getCourse(state.league.homeCourseId);
  const leagueHeroUrl = assetUrl("photos/league-golf-swing.jpg");

  return (
    <div className="relative -mx-4 flex min-h-0 flex-1 flex-col">
      <HomeHeroBackdrop imageUrl={leagueHeroUrl} />

      <div className="relative z-10 px-4 pb-2 pt-[var(--page-top-inset)]">
        <PageTitleSection title={`${state.league.name} League`} uppercase>
          {homeCourse ? (
            <p className="text-sm font-medium text-white/90">{homeCourse.name}</p>
          ) : null}
        </PageTitleSection>

        <div className="flex flex-col gap-2">
          <MakeupUrgentBanner surface="hero" className="mt-4" />
          <LeagueWeekSection />
          <LeagueNavTileGrid />
        </div>
      </div>
    </div>
  );
}
