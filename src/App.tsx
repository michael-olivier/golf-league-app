import { useCallback, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { IphoneFrame } from "./components/IphoneFrame";
import { Layout } from "./components/Layout";
import { AdminPage } from "./pages/AdminPage";
import { HandicapsPage } from "./pages/HandicapsPage";
import { HomePage } from "./pages/HomePage";
import { LeaguePage } from "./pages/LeaguePage";
import { RulesPage } from "./pages/RulesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MakeupPage } from "./pages/MakeupPage";
import { LeagueContactPage } from "./pages/LeagueContactPage";
import { RosterPage } from "./pages/RosterPage";
import { ScoreCourseSelectPage } from "./pages/ScoreCourseSelectPage";
import { ScoreSetupPage } from "./pages/ScoreSetupPage";
import { ScoresPage } from "./pages/ScoresPage";
import { SplashPage } from "./pages/SplashPage";
import { LeagueProvider, useLeague } from "./store/LeagueContext";
import { RoundSetupProvider } from "./store/RoundSetupContext";
import { LocationPreferencesProvider } from "./store/LocationPreferencesContext";
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { state } = useLeague();
  if (state.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

/** GitHub Pages used to host the app at /golf-league-app/app/; 404.html still serves there. */
function LegacyAppPathRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/app/, "") || "/";
  const target = `${suffix}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}

const routerBasename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  return (
    <IphoneFrame>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!splashDone && <SplashPage onComplete={finishSplash} />}
        {splashDone && (
          <div className="flex min-h-0 flex-1 flex-col">
            <BrowserRouter basename={routerBasename}>
              <Routes>
                <Route path="app/*" element={<LegacyAppPathRedirect />} />
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="league" element={<LeaguePage />} />
                  <Route path="scores" element={<ScoreCourseSelectPage />} />
                  <Route path="scores/setup" element={<ScoreSetupPage />} />
                  <Route path="scores/league" element={<ScoresPage variant="league" />} />
                  <Route path="scores/entry" element={<ScoresPage variant="casual" />} />
                  <Route path="handicaps" element={<HandicapsPage />} />
                  <Route path="makeup" element={<MakeupPage />} />
                  <Route path="roster" element={<RosterPage />} />
                  <Route path="contact/:contactId" element={<LeagueContactPage />} />
                  <Route path="rules" element={<RulesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route
                    path="admin"
                    element={
                      <AdminGuard>
                        <AdminPage />
                      </AdminGuard>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </div>
        )}
      </div>
    </IphoneFrame>
  );
}

export default function App() {
  return (
    <LocationPreferencesProvider>
      <LeagueProvider>
        <RoundSetupProvider>
          <AppRoutes />
        </RoundSetupProvider>
      </LeagueProvider>
    </LocationPreferencesProvider>
  );
}
