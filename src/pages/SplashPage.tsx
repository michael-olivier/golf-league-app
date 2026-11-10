import { useEffect, useState } from "react";
import {
  SPLASH_HOLD_MS,
  SPLASH_LOGO_IN_MS,
  SPLASH_LOGO_OUT_MS,
} from "../constants/bootMotion";
import { getSplashBranding } from "../utils/splashLogo";
import { useLeague } from "../store/LeagueContext";

const SPLASH_BG = "var(--sand-hunter)";

type SplashPhase = "enter" | "hold" | "exit";

interface SplashPageProps {
  onComplete: () => void;
}

export function SplashPage({ onComplete }: SplashPageProps) {
  const { state, getCourse } = useLeague();
  const homeCourse = getCourse(state.league.homeCourseId);
  const branding = getSplashBranding(state.league, homeCourse);

  const [phase, setPhase] = useState<SplashPhase>("enter");
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!imageReady) return;
    const t = window.setTimeout(() => setPhase("hold"), SPLASH_LOGO_IN_MS);
    return () => window.clearTimeout(t);
  }, [imageReady]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => setPhase("exit"), SPLASH_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = window.setTimeout(onComplete, SPLASH_LOGO_OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase, onComplete]);

  const skipToExit = () => {
    if (phase === "exit") return;
    setPhase("exit");
  };

  useEffect(() => {
    if (!branding) onComplete();
  }, [branding, onComplete]);

  if (!branding) return null;

  const leagueMark = branding.source === "league";

  const logoAnimClass = !leagueMark
    ? ""
    : phase === "exit"
      ? "splash-logo-out"
      : phase === "enter" && imageReady
        ? "splash-logo-in"
        : phase === "hold"
          ? "opacity-100"
          : "opacity-0";

  return (
    <button
      type="button"
      onClick={skipToExit}
      aria-label="Continue to Sandbagger"
      style={{ backgroundColor: SPLASH_BG }}
      className={`absolute inset-0 z-50 flex flex-1 flex-col items-center justify-center px-8 ${
        phase === "exit" ? "pointer-events-none" : ""
      }`}
    >
      <div className="flex max-w-[min(100%,280px)] flex-col items-center text-center">
        <img
          src={branding.imageUrl}
          alt={`${branding.title} logo`}
          width={280}
          height={280}
          className={`w-full object-contain ${leagueMark ? "max-h-64" : "h-40 w-40 rounded-3xl shadow-2xl shadow-black/40"} ${
            logoAnimClass
          } ${
            !leagueMark && imageReady && phase !== "exit"
              ? "opacity-100 transition-opacity duration-500"
              : ""
          } ${!leagueMark && !imageReady ? "opacity-0" : ""} ${
            !leagueMark && phase === "exit" ? "opacity-0 transition-opacity duration-[680ms]" : ""
          }`}
          onLoad={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
        {!leagueMark ? (
          <>
            <h1
              className={`mt-8 text-2xl font-bold tracking-tight text-sand-champagne transition-opacity duration-500 ${
                imageReady && phase !== "exit" ? "opacity-100" : "opacity-0"
              }`}
            >
              {branding.title}
            </h1>
            {branding.subtitle ? (
              <p
                className={`mt-2 text-sm text-sand-champagne/80 transition-opacity duration-500 ${
                  imageReady && phase !== "exit" ? "opacity-100" : "opacity-0"
                }`}
              >
                {branding.subtitle}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <p
        className={`absolute bottom-10 text-xs text-sand-champagne/70 transition-opacity duration-300 ${
          phase === "hold" ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      >
        Tap to continue
      </p>
    </button>
  );
}
