
import { describe, expect, it } from "vitest";
import { generateMissingNumberPuzzle } from "../src/game/missingNumber";
import type { DifficultyConfig } from "../src/game/difficulty";

const easyDifficulty: DifficultyConfig = {
  minNumber: 1,
  maxNumber: 10,
  operations: ["+", "−"],
};

describe("generateMissingNumberPuzzle", () => {
  
  it("generates equations whose correct answer satisfies the equation", () => {
    for (let i = 0; i < 100; i++) {
      const puzzle = generateMissingNumberPuzzle(easyDifficulty);

      const match = puzzle.text.match(/^(\d+) ([+−]) \? = (\d+)$/);
      expect(match).not.toBeNull();

      if (!match) continue;

      const left = Number(match[1]);
      const operator = match[2];
      const result = Number(match[3]);

      const calculated =
        operator === "+" ? left + puzzle.answer : left - puzzle.answer;

      expect(calculated).toBe(result);
    }
  });

  it("uses only operators allowed by the difficulty", () => {
    const additionOnly: DifficultyConfig = {
      minNumber: 1,
      maxNumber: 10,
      operations: ["+"],
    };

    for (let i = 0; i < 50; i++) {
      const puzzle = generateMissingNumberPuzzle(additionOnly);
      expect(puzzle.text).toContain("+");
    }
  });


  it("provides exactly three distinct answer options", () => {
    const puzzle = generateMissingNumberPuzzle(easyDifficulty);

    expect(puzzle.options).toHaveLength(3);
    expect(new Set(puzzle.options).size).toBe(3);
  });

  it("includes the correct answer among the options", () => {
    const puzzle = generateMissingNumberPuzzle(easyDifficulty);

    expect(puzzle.options).toContain(puzzle.answer);
  });

  it("generates a unique ID for each puzzle", () => {
    const first = generateMissingNumberPuzzle(easyDifficulty);
    const second = generateMissingNumberPuzzle(easyDifficulty);

    expect(first.id).not.toBe(second.id);
  });

  it("generates only positive answer options within the difficulty range", () => {
    for (let i = 0; i < 100; i++) {
      const puzzle = generateMissingNumberPuzzle(easyDifficulty);

      for (const option of puzzle.options) {
        expect(option).toBeGreaterThanOrEqual(1);
        expect(option).toBeLessThanOrEqual(10);
      }
    }
  });
});
