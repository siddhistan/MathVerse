import { describe, expect, it } from "vitest";
import {
  completeRoom,
  isRoomUnlocked,
  type GameProgress,
} from "../src/game/progression";

describe("progression", () => {
  it("unlocks only the first room initially", () => {
    const progress: GameProgress = { completedRooms: [] };

    expect(isRoomUnlocked(1, 1, progress)).toBe(true);
    expect(isRoomUnlocked(1, 2, progress)).toBe(false);
    expect(isRoomUnlocked(2, 1, progress)).toBe(false);
  });

  it("unlocks the next room after completion", () => {
    const progress = completeRoom(1, 1, { completedRooms: [] });

    expect(isRoomUnlocked(1, 2, progress)).toBe(true);
    expect(isRoomUnlocked(1, 3, progress)).toBe(false);
  });

  it("unlocks the next floor after all four rooms are completed", () => {
    let progress: GameProgress = { completedRooms: [] };

    for (let room = 1; room <= 4; room++) {
      progress = completeRoom(1, room, progress);
    }

    expect(isRoomUnlocked(2, 1, progress)).toBe(true);
  });

  it("allows replaying completed rooms without duplicating progress", () => {
    const initial: GameProgress = { completedRooms: [] };
    const once = completeRoom(1, 1, initial);
    const twice = completeRoom(1, 1, once);

    expect(twice.completedRooms).toEqual(["floor-1-room-1"]);
  });

  it("rejects rooms outside the building", () => {
    const progress: GameProgress = { completedRooms: [] };

    expect(isRoomUnlocked(0, 1, progress)).toBe(false);
    expect(isRoomUnlocked(1, 5, progress)).toBe(false);
    expect(isRoomUnlocked(4, 1, progress)).toBe(false);
  });
});