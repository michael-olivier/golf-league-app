export interface RuleSection {
  id: string;
  title: string;
  summary: string;
  body: string[];
  externalUrl?: string;
}

export const usgaRulesSections: RuleSection[] = [
  {
    id: "fundamentals",
    title: "Fundamentals of the Game",
    summary: "Play the course as you find it and play the ball as it lies.",
    body: [
      "Golf is played by striking a ball with a club from the teeing area into the hole by a stroke or successive strokes.",
      "Players must act with integrity, show consideration to others, and take good care of the course.",
      "The Rules protect all players equally — apply them to yourself and expect others to do the same.",
    ],
    externalUrl: "https://www.usga.org/rules/rules-of-golf/rule-1.html",
  },
  {
    id: "match-play",
    title: "Match Play & League Formats",
    summary: "How holes are won, halved, and conceded in team competition.",
    body: [
      "A match consists of players or sides competing against each other hole by hole.",
      "A player wins a hole when completing it in fewer strokes (including handicap strokes where applied).",
      "If both players tie on a hole, the hole is halved. The match status is expressed as up, down, or all square.",
      "A player may concede an opponent's next stroke, a hole, or the match — the concession cannot be declined or withdrawn.",
    ],
    externalUrl: "https://www.usga.org/rules/rules-of-golf/rule-3.html",
  },
  {
    id: "handicap",
    title: "Handicap & GHIN",
    summary: "Using a Handicap Index for equitable competition.",
    body: [
      "A Handicap Index represents a player's demonstrated ability and is maintained through GHIN (or another authorized golf association).",
      "Course Handicap converts the Index for a specific set of tees using the Course Rating and Slope Rating.",
      "In league play, strokes are typically allocated on holes based on stroke index order (lowest handicap receives strokes on hardest holes first).",
      "Only scores posted to GHIN per association policy count toward a player's official index.",
    ],
    externalUrl: "https://www.usga.org/handicapping.html",
  },
  {
    id: "scoring",
    title: "Scoring & Scorecards",
    summary: "Recording gross scores and certifying results.",
    body: [
      "Each hole score is the number of strokes taken to hole out, plus penalty strokes.",
      "For handicap purposes, most holes are capped at net double bogey when a hole is not finished or played under stroke-and-distance.",
      "In competition, players should compare scores hole by hole and resolve discrepancies before leaving the scoring area.",
      "The scorecard must identify the competition, date, course, and each player's name and handicap for the round.",
    ],
    externalUrl: "https://www.usga.org/rules/rules-of-golf/rule-3.html",
  },
  {
    id: "relief",
    title: "Relief Areas & Penalties",
    summary: "When and how to take free relief or penalty relief.",
    body: [
      "Penalty areas (yellow/red) and bunkers have specific relief options; many require a one-stroke penalty.",
      "Abnormal course conditions (ground under repair, immovable obstructions, etc.) may allow free relief.",
      "Unplayable ball relief always costs one penalty stroke unless playing from the original spot under stroke and distance.",
      "Always mark the reference point and drop in the correct relief area when taking relief.",
    ],
    externalUrl: "https://www.usga.org/rules/rules-of-golf/rule-16.html",
  },
  {
    id: "equipment",
    title: "Equipment & Teeing",
    summary: "Clubs, balls, and starting each hole.",
    body: [
      "A player must not make a stroke at a ball with more than 14 clubs.",
      "Teeing areas are defined by tee markers; the ball must be played from within the teeing area on the first stroke of each hole.",
      "If a ball falls off the tee before a stroke, it may be re-teed without penalty; if a stroke was made, the ball is in play.",
    ],
    externalUrl: "https://www.usga.org/rules/rules-of-golf/rule-4.html",
  },
];
