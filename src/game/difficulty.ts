export type DifficultyConfig = {
  minNumber: number;
  maxNumber: number;
  operations: ("+" | "−" | "×" | "÷")[];
};

export function getDifficulty(
  floor: number,
  room: number,
): DifficultyConfig {
  const level = (floor - 1) * 4 + room;

  if (level <= 2) {
    return {
      minNumber: 1,
      maxNumber: 10,
      operations: ["+", "−"],
    };
  }

  if (level <= 4) {
    return {
      minNumber: 1,
      maxNumber: 20,
      operations: ["+", "−", "×"],
    };
  }

  if (level <= 8) {
    return {
      minNumber: 1,
      maxNumber: 30,
      operations: ["+", "−", "×", "÷"],
    };
  }

  return {
    minNumber: 1,
    maxNumber: 50,
    operations: ["+", "−", "×", "÷"],
  };
}