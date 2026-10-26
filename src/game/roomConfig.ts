
import type { DifficultyConfig } from "./difficulty";

export type PuzzleType =
  | "ascending-order"
  | "missing-number"
  | "missing-operator"
  | "equation-check"
  | "number-sequence"
  | "number-maze"
  | "order-of-operations"
  | "fractions"
  | "multi-step-equation";

export interface RoomConfig {
  id: string;
  floor: number;
  room: number;
  name: string;
  puzzleType: PuzzleType;
  difficulty: DifficultyConfig;
  totalRounds: number;
  timeLimitSeconds: number;
  startingLives: number;
  isBoss: boolean;
}

const easyArithmetic: DifficultyConfig = {
  minNumber: 1,
  maxNumber: 10,
  operations: ["+", "−"],
};

const mediumArithmetic: DifficultyConfig = {
  minNumber: 1,
  maxNumber: 20,
  operations: ["+", "−", "×"],
};

const hardArithmetic: DifficultyConfig = {
  minNumber: 1,
  maxNumber: 30,
  operations: ["+", "−", "×", "÷"],
};

const expertArithmetic: DifficultyConfig = {
  minNumber: 1,
  maxNumber: 50,
  operations: ["+", "−", "×", "÷"],
};

function createRoom(
  floor: number,
  room: number,
  name: string,
  puzzleType: PuzzleType,
  difficulty: DifficultyConfig,
  isBoss = false,
): RoomConfig {
  return {
    id: `floor-${floor}-room-${room}`,
    floor,
    room,
    name,
    puzzleType,
    difficulty,
    totalRounds: isBoss ? 7 : 5,
    timeLimitSeconds: isBoss ? 60 : 30,
    startingLives: 3,
    isBoss,
  };
}

export const ROOM_CONFIGS: RoomConfig[] = [
  // Floor 1: Foundations
  createRoom(1, 1, "The Sorting Hall", "ascending-order", easyArithmetic),
  createRoom(1, 2, "The Missing Rune", "missing-number", easyArithmetic),
  createRoom(1, 3, "The Operator's Workshop", "missing-operator", mediumArithmetic),
  createRoom(1, 4, "The Guardian's Trial", "ascending-order", mediumArithmetic, true),

  // Floor 2: Logic and Patterns
  createRoom(2, 1, "The Equation Forge", "equation-check", mediumArithmetic),
  createRoom(2, 2, "The Pattern Vault", "number-sequence", mediumArithmetic),
  createRoom(2, 3, "The Number Maze", "number-maze", hardArithmetic),
  createRoom(2, 4, "The Logic Guardian", "number-sequence", hardArithmetic, true),

  // Floor 3: Mastery
  createRoom(3, 1, "The Order of Operations", "order-of-operations", hardArithmetic),
  createRoom(3, 2, "The Fraction Portal", "fractions", hardArithmetic),
  createRoom(3, 3, "The Equation Labyrinth", "multi-step-equation", expertArithmetic),
  createRoom(3, 4, "The Master of Numbers", "multi-step-equation", expertArithmetic, true),
];

export function getRoomConfig(
  floor: number,
  room: number,
): RoomConfig | undefined {
  return ROOM_CONFIGS.find(
    (config) => config.floor === floor && config.room === room,
  );
}
