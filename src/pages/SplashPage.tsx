import { useEffect, useState } from "react";
import { getSplashBranding } from "../utils/splashLogo";
import { useLeague } from "../store/LeagueContext";

const MIN_DISPLAY_MS = 2800;
const FADE_MS = 400;
const SPLASH_BG = "var(--sand-hunter)";

interface SplashPageProps {
  onComplete: () => void;
}

export function SplashPage({ onComplete }: SplashPageProps) {
  const { state, getCourse } = useLeague();
  const homeCourse = getCourse(state.league.homeCourseId);
  const branding = getSplashBranding(state.league, homeCourse);

  const [phase, setPhase] = useState<"show" | "exit">("show");
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!imageReady) return;

    const showTimer = window.setTimeout(() => setPhase("exit"), MIN_DISPLAY_MS);
    return () => window.clearTimeout(showTimer);
  }, [imageReady]);

  useEffect(() => {
    if (phase !== "exit") return;

    const exitTimer = window.setTimeout(onComplete, FADE_MS);
    return () => window.clearTimeout(exitTimer);
  }, [phase, onComplete]);

  const finish = () => {
    if (phase === "exit") return;
    setPhase("exit");
  };

  useEffect(() => {
    if (!branding) onComplete();
  }, [branding, onComplete]);

  if (!branding) return null;

  const leagueMark = branding.source === "league";

  return (
    <button
      type="button"
      onClick={finish}
      aria-label="Continue to Sandbagger"
      style={{ backgroundColor: SPLASH_BG }}
      className={`absolute inset-0 z-50 flex flex-1 flex-col items-center justify-center px-8 transition-opacity duration-[400ms] ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`flex max-w-[min(100%,280px)] flex-col items-center text-center transition-all duration-500 ease-out ${
          phase === "show" && imageReady
            ? "scale-100 opacity-100"
            : "scale-[0.92] opacity-0"
        }`}
      >
        <img
          src={branding.imageUrl}
          alt={`${branding.title} logo`}
          width={280}
          height={280}
          className={`w-full object-contain ${leagueMark ? "max-h-64" : "h-40 w-40 rounded-3xl shadow-2xl shadow-black/40"}`}
          onLoad={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
        {!leagueMark && (
          <>
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-sand-champagne">
              {branding.title}
            </h1>
            {branding.subtitle && (
              <p className="mt-2 text-sm text-sand-champagne/80">{branding.subtitle}</p>
            )}
          </>
        )}
      </div>

      <p className="absolute bottom-10 animate-pulse text-xs text-sand-champagne/70">
        Tap to continue
      </p>
    </button>
  );
}
