import { useNavigate } from "react-router-dom";
import { PageTitleSection } from "../components/PageTitleSection";

export function FindLeaguesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-4">
      <PageTitleSection
        title="Find leagues"
        onBack={() => navigate("/league")}
        backAriaLabel="Back to league"
      />
      <p className="page-title-gutter text-sm text-fairway-500">
        League search near you is coming soon.
      </p>
    </div>
  );
}
