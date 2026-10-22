import { useCallback, useSyncExternalStore } from "react";
import {
  readFavoriteCourses,
  toggleFavoriteCourse,
  type FavoriteCourseEntry,
} from "../utils/favoriteCourses";
import { cachedJsonSnapshot } from "../utils/snapshotCache";

function readFavoritesSnapshot(): FavoriteCourseEntry[] {
  return cachedJsonSnapshot("favorites", readFavoriteCourses);
}

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("fairway-favorites-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("fairway-favorites-changed", handler);
  };
}

function notifyFavoritesChanged(): void {
  window.dispatchEvent(new Event("fairway-favorites-changed"));
}

export function useFavoriteCourses(): {
  favorites: FavoriteCourseEntry[];
  isFavorite: (courseId: string) => boolean;
  toggleFavorite: (courseId: string, courseName: string) => void;
} {
  const favorites = useSyncExternalStore(
    subscribe,
    readFavoritesSnapshot,
    readFavoritesSnapshot,
  );

  const isFavorite = useCallback(
    (courseId: string) => favorites.some((c) => c.id === courseId),
    [favorites],
  );

  const toggleFavorite = useCallback((courseId: string, courseName: string) => {
    toggleFavoriteCourse(courseId, courseName);
    notifyFavoritesChanged();
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
