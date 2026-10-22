import type { SimpleHoleScore } from "../../types";
import {
  HoleScoreStepper,
  type HoleNavigation,
} from "./HoleScoreStepper";

interface SimpleHoleInputProps {
  holeNumber: number;
  par: number;
  score: SimpleHoleScore;
  onChange: (score: SimpleHoleScore) => void;
  navigation: HoleNavigation;
}

export function SimpleHoleInput({
  holeNumber,
  par,
  score,
  onChange,
  navigation,
}: SimpleHoleInputProps) {
  return (
    <HoleScoreStepper
      holeNumber={holeNumber}
      par={par}
      strokes={score.strokes}
      onChange={(strokes) => onChange({ strokes })}
      navigation={navigation}
    />
  );
}
