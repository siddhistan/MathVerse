
import type { MathExpression } from "./expressionGenerator";

export const TOTAL_ROUNDS = 5;
export const ROUND_SIZE = 3;
export const STARTING_LIVES = 3;

export type ChallengeStatus =
  | "playing"
  | "feedback"
  | "success"
  | "failed";

export interface ChallengeFeedback {
  wrongBubbleId: string;
  correctBubbleId: string;
}

export interface ChallengeState {
  status: ChallengeStatus;
  roundIndex: number;
  totalRounds: number;
  lives: number;
  selectedIds: string[];
  currentRound: MathExpression[];
  feedback: ChallengeFeedback | null;
  failureReason: "wrong-answer" | "timeout" | null;
}

function validateRound(round: MathExpression[]): void {
  if (round.length !== ROUND_SIZE) {
    throw new Error("Each round must contain exactly three expressions.");
  }

  if (new Set(round.map((item) => item.value)).size !== ROUND_SIZE) {
    throw new Error("Each round must have three distinct values.");
  }
}

export function createChallenge(
  firstRound: MathExpression[],
  totalRounds = TOTAL_ROUNDS,
  startingLives = STARTING_LIVES,
): ChallengeState {
  validateRound(firstRound);

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
    selectedIds: [],
    currentRound: firstRound,
    feedback: null,
    failureReason: null,
  };
}

export function selectBubble(
  state: ChallengeState,
  bubbleId: string,
  nextRound?: MathExpression[],
): ChallengeState {
  if (state.status !== "playing") {
    return state;
  }

  const bubble = state.currentRound.find((item) => item.id === bubbleId);

  // Ignore unknown IDs and repeated selections.
  if (!bubble || state.selectedIds.includes(bubbleId)) {
    return state;
  }

  const expected = [...state.currentRound].sort(
    (a, b) => a.value - b.value,
  )[state.selectedIds.length];

  if (!expected) {
    return state;
  }

  if (bubble.id !== expected.id) {
    const remainingLives = state.lives - 1;

    return {
      ...state,
      status: remainingLives > 0 ? "feedback" : "failed",
      lives: remainingLives,
      feedback: {
        wrongBubbleId: bubble.id,
        correctBubbleId: expected.id,
      },
      failureReason: "wrong-answer",
    };
  }

  const selectedIds = [...state.selectedIds, bubbleId];

  // The player has correctly ordered all three bubbles.
  if (selectedIds.length === ROUND_SIZE) {
    if (state.roundIndex === state.totalRounds - 1) {
      return {
        ...state,
        status: "success",
        selectedIds,
      };
    }

    if (!nextRound) {
      throw new Error("The next round must contain three expressions.");
    }

    validateRound(nextRound);

    return {
      ...state,
      roundIndex: state.roundIndex + 1,
      selectedIds: [],
      currentRound: nextRound,
    };
  }

  return {
    ...state,
    selectedIds,
  };
}

export function failOnTimeout(
  state: ChallengeState,
): ChallengeState {
  if (state.status !== "playing") {
    return state;
  }

  return {
    ...state,
    status: "failed",
    feedback: null,
    failureReason: "timeout",
  };
}

export function finishFailureFeedback(
  state: ChallengeState,
): ChallengeState {
  if (state.status !== "feedback") {
    return state;
  }

  return {
    ...state,
    status: "playing",
    feedback: null,
    failureReason: null,
  };
}
