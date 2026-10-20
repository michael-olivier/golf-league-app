import { useState } from "react";
import { usgaRulesSections } from "../data/usgaRules";

export function RulesPage() {
  const [expanded, setExpanded] = useState<string | null>(
    usgaRulesSections[0]?.id ?? null,
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-fairway-400">
        Quick reference for league play. For official rulings, see the full
        USGA Rules of Golf.
      </p>

      <ul className="space-y-2">
        {usgaRulesSections.map((section) => {
          const open = expanded === section.id;
          return (
            <li
              key={section.id}
              className="overflow-hidden rounded-xl border border-fairway-800 bg-fairway-900/30"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded(open ? null : section.id)
                }
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <h2 className="font-semibold text-fairway-200">{section.title}</h2>
                  <p className="mt-0.5 text-xs text-fairway-400">
                    {section.summary}
                  </p>
                </div>
                <span className="text-fairway-500">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="border-t border-fairway-800 px-4 py-3 text-sm text-fairway-300">
                  <ul className="list-disc space-y-2 pl-4">
                    {section.body.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                  {section.externalUrl && (
                    <a
                      href={section.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-fairway-400 underline hover:text-fairway-200"
                    >
                      Read on USGA.org →
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
