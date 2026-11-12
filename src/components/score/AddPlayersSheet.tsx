import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomSheet } from "../BottomSheet";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { ScoringGolfer } from "../../types";
import {
  createManualScoringGolfer,
  followedGhinGolfers,
  ghinEntryToScoringGolfer,
  searchGhinGolfers,
  type GhinDirectoryEntry,
} from "../../data/ghinMock";

interface AddPlayersSheetProps {
  open: boolean;
  onClose: () => void;
  selected: ScoringGolfer[];
  onChangeSelected: (next: ScoringGolfer[]) => void;
  currentUserGolfer: ScoringGolfer;
  maxPlayers?: number;
  /** When set, picking a golfer replaces this partner instead of adding. */
  replacingPartnerId?: string | null;
  onReplacePartner?: (partnerId: string, golfer: ScoringGolfer) => void;
}

function GolferResultRow({
  entry,
  added,
  onAdd,
  disabled,
}: {
  entry: GhinDirectoryEntry;
  added: boolean;
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-fairway-800/15 py-3 last:border-0">
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled || added}
        aria-label={added ? `${entry.name} already added` : `Add ${entry.name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sand-hunter bg-white text-sand-hunter disabled:opacity-40"
      >
        <Plus className="h-5 w-5" strokeWidth={1} aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#373737]">
          {entry.name}
        </p>
        <p className="truncate text-xs text-fairway-500">{entry.homeCourseName}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-fairway-400">
          H.I.
        </p>
        <p className="mt-0.5 text-sm font-bold tabular-nums text-[#373737]">
          {entry.handicapIndex.toFixed(1)}
        </p>
      </div>
    </li>
  );
}

export function AddPlayersSheet({
  open,
  onClose,
  selected,
  onChangeSelected,
  currentUserGolfer,
  maxPlayers = 4,
  replacingPartnerId = null,
  onReplacePartner,
}: AddPlayersSheetProps) {
  const replaceMode = replacingPartnerId != null && onReplacePartner != null;
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualHandicap, setManualHandicap] = useState("");
  const [manualRatedTees, setManualRatedTees] = useState<"male" | "female">(
    "male",
  );

  const selectedIds = useMemo(
    () => new Set(selected.map((g) => g.id)),
    [selected],
  );

  const listEntries = useMemo(() => {
    if (debouncedQuery) return searchGhinGolfers(debouncedQuery);
    return followedGhinGolfers;
  }, [debouncedQuery]);

  const atCapacity = !replaceMode && selected.length >= maxPlayers;

  const closeAll = () => {
    setManualOpen(false);
    setQuery("");
    onClose();
  };

  const addGolfer = (golfer: ScoringGolfer) => {
    if (golfer.id === currentUserGolfer.id) return;
    if (replaceMode && replacingPartnerId && onReplacePartner) {
      if (selectedIds.has(golfer.id)) return;
      onReplacePartner(replacingPartnerId, golfer);
      closeAll();
      return;
    }
    if (selectedIds.has(golfer.id) || atCapacity) return;
    onChangeSelected([...selected, golfer]);
  };

  const manualHandicapNum = Number.parseFloat(manualHandicap);
  const manualValid =
    manualName.trim().length > 0 &&
    Number.isFinite(manualHandicapNum) &&
    manualHandicapNum >= 0;

  const submitManual = () => {
    if (!manualValid) return;
    const golfer = createManualScoringGolfer({
      name: manualName,
      handicapIndex: manualHandicapNum,
      ratedTees: manualRatedTees,
    });
    addGolfer(golfer);
    setManualName("");
    setManualHandicap("");
    setManualRatedTees("male");
    setManualOpen(false);
  };

  return (
    <>
      <BottomSheet
        open={open && !manualOpen}
        onClose={closeAll}
        title={replaceMode ? "Change golfer" : "Add players"}
        tone="white"
        expanded
        contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <div className="space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GHIN golfers"
            className="w-full rounded-xl border border-sand-hunter/35 bg-white px-3 py-2.5 text-sm text-[#373737] placeholder:text-fairway-400"
          />

          <p className="text-xs font-bold uppercase tracking-wider text-fairway-500">
            {debouncedQuery ? "Search results" : "Following"}
          </p>

          <ul className="max-h-[min(42dvh,320px)] overflow-y-auto overscroll-contain">
            {listEntries.length === 0 ? (
              <li className="py-6 text-center text-sm text-fairway-500">
                {debouncedQuery
                  ? "No golfers match your search."
                  : "You are not following any golfers yet."}
              </li>
            ) : (
              listEntries.map((entry) => {
                const golfer = ghinEntryToScoringGolfer(entry);
                const added =
                  selectedIds.has(golfer.id) ||
                  entry.ghinNumber === currentUserGolfer.ghinNumber;
                return (
                  <GolferResultRow
                    key={entry.ghinNumber}
                    entry={entry}
                    added={added}
                    disabled={atCapacity}
                    onAdd={() => addGolfer(golfer)}
                  />
                );
              })
            )}
          </ul>

          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="w-full pt-1 text-center text-xs font-semibold text-sand-hunter underline"
          >
            Manually Add Golfers
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={open && manualOpen}
        onClose={() => setManualOpen(false)}
        title="Add golfer"
        tone="white"
        expanded
        contentClassName="pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-fairway-500">
              Golfer name
            </span>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="w-full rounded-xl border border-sand-hunter/35 px-3 py-2.5 text-sm text-[#373737]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-fairway-500">
              18-hole handicap
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={manualHandicap}
              onChange={(e) => setManualHandicap(e.target.value)}
              className="w-full rounded-xl border border-sand-hunter/35 px-3 py-2.5 text-sm text-[#373737]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-fairway-500">
              Rated tees
            </span>
            <select
              value={manualRatedTees}
              onChange={(e) =>
                setManualRatedTees(e.target.value as "male" | "female")
              }
              className="w-full rounded-xl border border-sand-hunter/35 bg-white px-3 py-2.5 text-sm text-[#373737]"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <button
            type="button"
            disabled={!manualValid || atCapacity}
            onClick={submitManual}
            className="w-full rounded-2xl bg-sand-hunter py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Add Golfer
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
