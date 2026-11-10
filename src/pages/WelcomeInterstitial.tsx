import { useEffect, useState } from "react";
import {
  WELCOME_MESSAGE_HOLD_MS,
  WELCOME_MESSAGE_IN_MS,
  WELCOME_MESSAGE_OUT_MS,
} from "../constants/bootMotion";
import { useLeague } from "../store/LeagueContext";
import { playerFirstName } from "../utils/recentCourseHero";

type WelcomePhase = "enter" | "hold" | "exit";

interface WelcomeInterstitialProps {
  onComplete: () => void;
}

export function WelcomeInterstitial({ onComplete }: WelcomeInterstitialProps) {
  const { currentPlayer } = useLeague();
  const [phase, setPhase] = useState<WelcomePhase>("enter");

  const firstName = playerFirstName(currentPlayer.name);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("hold"), WELCOME_MESSAGE_IN_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => setPhase("exit"), WELCOME_MESSAGE_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = window.setTimeout(onComplete, WELCOME_MESSAGE_OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-sand-hunter px-8"
      aria-live="polite"
    >
      <p
        className={`text-center text-2xl font-semibold tracking-tight text-sand-champagne ${
          phase === "enter" ? "welcome-message-in" : ""
        } ${phase === "exit" ? "welcome-message-out" : ""}`}
      >
        Welcome back, {firstName}
      </p>
    </div>
  );
}
