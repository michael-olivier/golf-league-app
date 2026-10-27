import { Navigate, useSearchParams } from "react-router-dom";

/** Legacy route — casual scoring starts on `/scores`. */
export function ScoreSetupPage() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");
  const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return <Navigate to={`/scores${qs}`} replace />;
}
