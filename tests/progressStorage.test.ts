// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  loadProgress,
  resetProgress,
  saveProgress,
} from "../src/storage/progressStorage";

describe("progressStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty progress", () => {
    expect(loadProgress()).toEqual({ completedRooms: [] });
  });

  it("saves and loads progress", () => {
    const progress = {
      completedRooms: ["floor-1-room-1", "floor-1-room-2"],
    };

    saveProgress(progress);

    expect(loadProgress()).toEqual(progress);
  });

  it("resets saved progress", () => {
    saveProgress({ completedRooms: ["floor-1-room-1"] });

    resetProgress();

    expect(loadProgress()).toEqual({ completedRooms: [] });
  });

  it("handles malformed saved data", () => {
    localStorage.setItem("math-universe-progress", "{invalid json");

    expect(loadProgress()).toEqual({ completedRooms: [] });
  });
});