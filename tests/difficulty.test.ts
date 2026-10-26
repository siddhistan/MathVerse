import { describe, expect, it } from "vitest";
import { getDifficulty } from "../src/game/difficulty";

describe("getDifficulty", () => {
  it("starts with easy operations", () => {
    const difficulty = getDifficulty(1, 1);

    expect(difficulty.operations).toEqual(["+", "−"]);
    expect(difficulty.maxNumber).toBe(10);
  });

  it("introduces multiplication by Room 3", () => {
    const difficulty = getDifficulty(1, 3);

    expect(difficulty.operations).toContain("×");
  });

  it("introduces division on Floor 2", () => {
    const difficulty = getDifficulty(2, 1);

    expect(difficulty.operations).toContain("÷");
  });

  it("increases the number range on later floors", () => {
    const difficulty = getDifficulty(3, 1);

    expect(difficulty.maxNumber).toBe(50);
  });
});