import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { CourseFavoriteStar } from "./CourseFavoriteStar";

interface CourseNameWithFavoriteProps {
  courseId: string;
  courseName: string;
  children?: ReactNode;
  onBack?: () => void;
  backAriaLabel?: string;
}

export function CourseNameWithFavorite({
  courseId,
  courseName,
  children,
  onBack,
  backAriaLabel = "Go back",
}: CourseNameWithFavoriteProps) {
  return (
    <div className="text-left">
      <div className="flex items-center gap-0.5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel}
            className="-ml-1 flex shrink-0 items-center justify-center p-1 text-inherit transition active:opacity-70"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1} aria-hidden />
          </button>
        ) : null}
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-inherit">
          {courseName}
        </h2>
        <CourseFavoriteStar courseId={courseId} courseName={courseName} />
      </div>
      {children}
    </div>
  );
}
