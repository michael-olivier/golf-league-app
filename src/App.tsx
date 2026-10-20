import { useCallback, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { IphoneFrame } from "./components/IphoneFrame";
import { Layout } from "./components/Layout";
import { AdminPage } from "./pages/AdminPage";
import { HandicapsPage } from "./pages/HandicapsPage";
import { HomePage } from "./pages/HomePage";
import { RulesPage } from "./pages/RulesPage";
import { MakeupPage } from "./pages/MakeupPage";
import { RosterPage } from "./pages/RosterPage";
import { ScoresPage } from "./pages/ScoresPage";
import { SplashPage } from "./pages/SplashPage";
import { LeagueProvider, useLeague } from "./store/LeagueContext";
import { ThemeProvider } from "./store/ThemeContext";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { state } = useLeague();
  if (state.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
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
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="scores" element={<ScoresPage />} />
                  <Route path="handicaps" element={<HandicapsPage />} />
                  <Route path="makeup" element={<MakeupPage />} />
                  <Route path="roster" element={<RosterPage />} />
                  <Route path="rules" element={<RulesPage />} />
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
    <ThemeProvider>
      <LeagueProvider>
        <AppRoutes />
      </LeagueProvider>
    </ThemeProvider>
  );
}
