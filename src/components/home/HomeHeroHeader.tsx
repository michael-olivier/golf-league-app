import type { Player } from "../../types";

function formatLowHandicapDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = String(d.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

interface HomeHeroBackdropProps {
  imageUrl: string | null;
}

export function HomeHeroBackdrop({ imageUrl }: HomeHeroBackdropProps) {
  return (
    <>
      {imageUrl ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-sand-hunter" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-sand-hunter"
      />
    </>
  );
}

interface HomeHandicapSummaryProps {
  player: Player;
}

export function HomeHandicapSummary({ player }: HomeHandicapSummaryProps) {
  const lowIndex = player.lowHandicapIndex ?? player.handicapIndex;
  const lowDate = player.lowHandicapIndexAsOf;

  return (
    <div className="flex w-full flex-col items-center text-center text-white">
      <p className="text-sm font-medium tracking-wide text-white/95">
        Handicap Index<sup className="text-[10px]">®</sup>
      </p>
      <p className="mt-1 text-[5rem] font-semibold leading-none tracking-tight tabular-nums">
        {player.handicapIndex.toFixed(1)}
      </p>
      <p className="mt-3 text-sm text-white/90">
        <span className="text-white/75">Low H.I.</span>{" "}
        <span className="font-medium tabular-nums">{lowIndex.toFixed(1)}</span>
        {lowDate ? (
          <span className="tabular-nums text-white/85">
            {" "}
            ({formatLowHandicapDate(lowDate)})
          </span>
        ) : null}
      </p>
    </div>
  );
}

interface HomeHeroLogoProps {
  logoUrl: string | null;
  animateLogo?: boolean;
}

export function HomeHeroLogo({ logoUrl, animateLogo = false }: HomeHeroLogoProps) {
  if (!logoUrl) return null;
  return (
    <img
      src={logoUrl}
      alt="Sandbagger"
      width={320}
      height={64}
      className={`h-11 w-auto max-w-full object-contain ${animateLogo ? "home-logo-in" : ""}`}
    />
  );
}
