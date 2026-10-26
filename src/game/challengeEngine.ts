import type { MathExpression } from "./expressionGenerator";

export const TOTAL_ROUNDS = 5;
export const ROUND_SIZE = 3;

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
  selectedIds: string[];
  currentRound: MathExpression[];
  feedback: ChallengeFeedback | null;
  failureReason: "wrong-answer" | "timeout" | null;
}

export function createChallenge(
  firstRound: MathExpression[],
): ChallengeState {
  if (firstRound.length !== ROUND_SIZE) {
    throw new Error("Each round must contain exactly three expressions.");
  }

  if (new Set(firstRound.map((item) => item.value)).size !== ROUND_SIZE) {
    throw new Error("Each round must have three distinct values.");
  }

  return {
    status: "playing",
    roundIndex: 0,
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

  if (bubble.id !== expected.id) {
    return {
      ...state,
      status: "feedback",
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
    if (state.roundIndex === TOTAL_ROUNDS - 1) {
      return {
        ...state,
        status: "success",
        selectedIds,
      };
    }

    if (!nextRound || nextRound.length !== ROUND_SIZE) {
      throw new Error("The next round must contain three expressions.");
    }

    if (
      new Set(nextRound.map((item) => item.value)).size !== ROUND_SIZE
    ) {
      throw new Error("The next round must have three distinct values.");
    }

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
    status: "failed",
    feedback: null,
  };
}