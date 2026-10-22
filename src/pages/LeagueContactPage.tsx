import { Link, Navigate, useParams } from "react-router-dom";
import { PageTitleSection } from "../components/PageTitleSection";
import { useLeague } from "../store/LeagueContext";

export function LeagueContactPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const { state } = useLeague();

  const contact =
    state.league.director?.id === contactId ? state.league.director : undefined;

  if (!contactId || !contact) {
    return <Navigate to="/roster" replace />;
  }

  return (
    <div className="space-y-5 pb-4">
      <Link
        to="/roster"
        className="-ml-1 inline-flex items-center gap-1 py-1 text-sm font-medium text-fairway-400 transition hover:text-fairway-200"
      >
        <span aria-hidden>←</span> Roster
      </Link>

      <PageTitleSection title={contact.name} uppercase={false}>
        <p className="text-sm text-fairway-500">{contact.role}</p>
      </PageTitleSection>

      <section className="space-y-3 rounded-[8px] border border-sand-hunter bg-white p-4">
        {contact.email ? (
          <div>
            <p className="card-title">
              Email
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-1 block text-sm font-medium text-sand-hunter underline-offset-2 hover:underline"
            >
              {contact.email}
            </a>
          </div>
        ) : null}
        {contact.phone ? (
          <div>
            <p className="card-title">
              Phone
            </p>
            <a
              href={`tel:${contact.phone.replace(/\D/g, "")}`}
              className="mt-1 block text-sm font-medium text-sand-hunter underline-offset-2 hover:underline"
            >
              {contact.phone}
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}
