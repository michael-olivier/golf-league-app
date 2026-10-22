import type { ReactNode } from "react";
import { CourseFavoriteStar } from "./CourseFavoriteStar";

interface CourseNameWithFavoriteProps {
  courseId: string;
  courseName: string;
  children?: ReactNode;
}

export function CourseNameWithFavorite({
  courseId,
  courseName,
  children,
}: CourseNameWithFavoriteProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-fairway-300">
          {courseName}
        </h2>
        <CourseFavoriteStar courseId={courseId} courseName={courseName} />
      </div>
      {children}
    </div>
  );
}
