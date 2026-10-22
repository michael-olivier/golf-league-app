import { Link } from "react-router-dom";
import { PageTitleSection } from "../components/PageTitleSection";
import { LeagueWeekSection } from "../components/league/LeagueWeekSection";
import { MakeupUrgentBanner } from "../components/league/MakeupUrgentBanner";
import { useLeague } from "../store/LeagueContext";

export function LeaguePage() {
  const { state, getCourse } = useLeague();
  const homeCourse = getCourse(state.league.homeCourseId);

  const links = [
    {
      to: "/roster",
      label: "Roster",
      description: "Teams and players",
    },
    {
      to: "/handicaps",
      label: "Handicaps",
      description: "GHIN indexes",
    },
    {
      to: "/makeup",
      label: "Makeup dates",
      description: "Reschedule postponed weeks",
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      <PageTitleSection
        title={`${state.league.name} League`}
        uppercase={false}
      >
        {homeCourse ? (
          <p className="text-sm text-fairway-500">{homeCourse.name}</p>
        ) : null}
      </PageTitleSection>

      <MakeupUrgentBanner surface="light" />

      <LeagueWeekSection />

      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block rounded-[8px] border border-sand-hunter bg-white px-4 py-3 transition hover:bg-sand-champagne/40"
            >
              <p className="font-medium text-fairway-300">{item.label}</p>
              <p className="text-xs text-fairway-500">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
