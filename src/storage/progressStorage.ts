import type { GameProgress } from "../game/progression";

const STORAGE_KEY = "math-universe-progress";

export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): GameProgress {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return { completedRooms: [] };
  }

  try {
    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "completedRooms" in parsed &&
      Array.isArray(parsed.completedRooms) &&
      parsed.completedRooms.every((room) => typeof room === "string")
    ) {
      return { completedRooms: parsed.completedRooms };
    }
  } catch {
    // Fall back to fresh progress if the saved data is malformed.
  }

  return { completedRooms: [] };
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}