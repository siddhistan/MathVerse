
import { describe, expect, it } from "vitest";
import {
  getRoomConfig,
  ROOM_CONFIGS,
} from "../src/game/roomConfig";

describe("room configuration", () => {
  it("defines all 12 rooms", () => {
    expect(ROOM_CONFIGS).toHaveLength(12);
  });

  it("gives every room a unique ID", () => {
    const ids = ROOM_CONFIGS.map((room) => room.id);
    expect(new Set(ids).size).toBe(12);
  });

  it("configures four rooms on each floor", () => {
    for (const floor of [1, 2, 3]) {
      expect(
        ROOM_CONFIGS.filter((room) => room.floor === floor),
      ).toHaveLength(4);
    }
  });

  it("marks the fourth room on each floor as a boss", () => {
    for (const floor of [1, 2, 3]) {
      expect(getRoomConfig(floor, 4)?.isBoss).toBe(true);
      expect(getRoomConfig(floor, 3)?.isBoss).toBe(false);
    }
  });

  it("gives boss rooms more rounds and time", () => {
    const normalRoom = getRoomConfig(1, 1)!;
    const bossRoom = getRoomConfig(1, 4)!;

    expect(bossRoom.totalRounds).toBeGreaterThan(normalRoom.totalRounds);
    expect(bossRoom.timeLimitSeconds).toBeGreaterThan(
      normalRoom.timeLimitSeconds,
    );
  });

  it("returns undefined for a nonexistent room", () => {
    expect(getRoomConfig(4, 1)).toBeUndefined();
    expect(getRoomConfig(1, 5)).toBeUndefined();
  });

  it("assigns a puzzle type and difficulty to every room", () => {
    for (const room of ROOM_CONFIGS) {
      expect(room.puzzleType).toBeTruthy();
      expect(room.difficulty.maxNumber).toBeGreaterThan(0);
      expect(room.difficulty.operations.length).toBeGreaterThan(0);
    }
  });
});
