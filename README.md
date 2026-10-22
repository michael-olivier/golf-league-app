# Sandbagger (golf-league-app)

A mobile-friendly golf league web app for weekly team matches, score entry, GHIN handicaps, and USGA rules reference.

## Features

- **Splash screen** — League logo (if set) or home course logo on each app open, then fade into the app
- **Score entry (primary)** — Quick strokes per hole or detailed stats (FIR, GIR, putts, penalties, sand saves)
- **Foursome modes** — Enter your own score or claim “enter for everyone” for the group
- **GHIN handicaps** — View your index, teammates, and opponents (mock data; wire to GHIN API later)
- **USGA rules** — Expandable reference sections with links to USGA.org
- **Makeup scheduling** — Competing teams propose dates; the other team confirms to reschedule a postponed match
- **Admin** — Create weekly matches, set status, auto-assign foursomes

## Quick start

```bash
cd ~/Projects/golf-league-app
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## GitHub Pages

Pushes to `main` deploy via GitHub Actions to:

**https://michael-olivier.github.io/golf-league-app/**

All demos are listed on the separate prototypes hub:

**https://michael-olivier.github.io/prototypes/**

Source for the hub lives in [`prototypes/`](prototypes/) (publish as the `michael-olivier/prototypes` repo).

Local Pages preview:

```bash
npm run build
VITE_BASE_PATH=/golf-league-app/ npx vite preview
```

In the repo **Settings → Pages**, source should be **GitHub Actions** (enabled automatically on first deploy).

## Splash / branding

Set `league.logoUrl` (splash) and optional `league.homeLogoUrl` (home header) in `src/data/mock.ts`; if splash logo is omitted, `courses[].logoUrl` on the home course is used. Assets live in `public/logos/`.

## Demo user

Mock data logs you in as **Mike Olivier** (`player-mike`) with **admin** role. Week 4 is in progress with a mixed-team foursome.

## Next steps (production)

1. **Auth** — Sign-in per player (Clerk, Auth0, etc.)
2. **Database** — Supabase/Firebase for matches, scores, teams
3. **GHIN API** — OAuth integration for live Handicap Index ([USGA GHIN](https://www.usga.org/handicapping.html))
4. **Real-time** — Sync score entry across devices in the same foursome
5. **League logic** — Match play points, net skins, stroke allocation

## Project structure

```
src/
  components/     Layout, player chips, score inputs
  data/           Mock league + USGA rules content
  pages/          Home, Scores, Handicaps, Rules, Admin
  store/          React context + local state
  types/          Domain models
```
