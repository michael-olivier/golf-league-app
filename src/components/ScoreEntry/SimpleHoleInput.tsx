import type { SimpleHoleScore } from "../../types";
import { HoleScoreStepper } from "./HoleScoreStepper";

interface SimpleHoleInputProps {
  holeNumber: number;
  par: number;
  score: SimpleHoleScore;
  onChange: (score: SimpleHoleScore) => void;
}

export function SimpleHoleInput({
  holeNumber,
  par,
  score,
  onChange,
}: SimpleHoleInputProps) {
  return (
    <HoleScoreStepper
      holeNumber={holeNumber}
      par={par}
      strokes={score.strokes}
      onChange={(strokes) => onChange({ strokes })}
    />
  );
}
