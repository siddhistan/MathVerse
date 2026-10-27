
import type { MissingNumberPuzzle } from "./missingNumber";

export type MissingNumberStatus =
  | "playing"
  | "success"
  | "feedback"
  | "failed";

export interface MissingNumberState {
  status: MissingNumberStatus;
  roundIndex: number;
  totalRounds: number;
  lives: number;
  puzzle: MissingNumberPuzzle;
  failureReason: "wrong-answer" | null;
}

export function createMissingNumberChallenge(
  firstPuzzle: MissingNumberPuzzle,
  totalRounds = 5,
  startingLives = 3,
): MissingNumberState {
  if (!Number.isInteger(totalRounds) || totalRounds < 1) {
    throw new Error("Total rounds must be a positive integer.");
  }

  if (!Number.isInteger(startingLives) || startingLives < 1) {
    throw new Error("Starting lives must be a positive integer.");
  }

  return {
    status: "playing",
    roundIndex: 0,
    totalRounds,
    lives: startingLives,
    puzzle: firstPuzzle,
    failureReason: null,
  };
}

export function selectMissingNumberAnswer(
  state: MissingNumberState,
  selectedAnswer: number,
  nextPuzzle?: MissingNumberPuzzle,
): MissingNumberState {
  if (state.status !== "playing") {
    return state;
  }

  if (!state.puzzle.options.includes(selectedAnswer)) {
    return state;
  }

  if (selectedAnswer !== state.puzzle.answer) {
    const remainingLives = state.lives - 1;

    return {
      ...state,
      status: remainingLives > 0 ? "feedback" : "failed",
      lives: remainingLives,
      failureReason: "wrong-answer",
    };
  }

  if (state.roundIndex === state.totalRounds - 1) {
    return {
      ...state,
      status: "success",
      roundIndex: state.roundIndex + 1,
    };
  }

  if (!nextPuzzle) {
    throw new Error("The next puzzle must be provided.");
  }

  return {
    ...state,
    roundIndex: state.roundIndex + 1,
    puzzle: nextPuzzle,
  };
}

export function finishMissingNumberFeedback(
  state: MissingNumberState,
): MissingNumberState {
  if (state.status !== "feedback") {
    return state;
  }

  return {
    ...state,
    status: "playing",
    failureReason: null,
  };
}
