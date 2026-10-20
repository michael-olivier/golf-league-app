import { useEffect, useState } from "react";
import { getSplashBranding } from "../utils/splashLogo";
import { useLeague } from "../store/LeagueContext";

const MIN_DISPLAY_MS = 1800;
const FADE_MS = 400;

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

  return (
    <button
      type="button"
      onClick={finish}
      aria-label="Continue to Fairway League"
      className={`absolute inset-0 z-50 flex flex-1 flex-col items-center justify-center bg-fairway-950 px-8 transition-opacity duration-[400ms] ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`flex max-w-xs flex-col items-center text-center transition-all duration-500 ease-out ${
          phase === "show" && imageReady
            ? "scale-100 opacity-100"
            : "scale-[0.92] opacity-0"
        }`}
      >
        <img
          src={branding.imageUrl}
          alt={`${branding.title} logo`}
          width={160}
          height={160}
          className="h-40 w-40 rounded-3xl object-contain shadow-2xl shadow-black/40"
          onLoad={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-fairway-200">
          {branding.title}
        </h1>
        {branding.subtitle && (
          <p className="mt-2 text-sm text-fairway-400">{branding.subtitle}</p>
        )}
      </div>

      <p className="absolute bottom-10 text-xs text-fairway-600 animate-pulse">
        Tap to continue
      </p>
    </button>
  );
}
