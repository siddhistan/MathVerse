import { describe, expect, it } from "vitest";
import {
  createChallenge,
  selectBubble,
  failOnTimeout,
  finishFailureFeedback,
  type ChallengeState,
} from "../src/game/challengeEngine";
import type { MathExpression } from "../src/game/expressionGenerator";

function makeRound(values: number[]): MathExpression[] {
  return values.map((value, index) => ({
    id: `bubble-${index}`,
    left: value,
    right: 0,
    operator: "+" as const,
    text: `${value} + 0`,
    value,
  }));
}

function completeRound(state: ChallengeState): ChallengeState {
  const ordered = [...state.currentRound].sort(
    (a, b) => a.value - b.value,
  );

  for (const bubble of ordered) {
    const isLast = state.selectedIds.length === 2;

    state = selectBubble(
      state,
      bubble.id,
      isLast ? makeRound([11, 12, 13]) : undefined,
    );
  }

  return state;
}

describe("challengeEngine", () => {
  it("starts at round one", () => {
    const state = createChallenge(makeRound([3, 1, 2]));

    expect(state.status).toBe("playing");
    expect(state.roundIndex).toBe(0);
    expect(state.selectedIds).toEqual([]);
  });

  it("accepts bubbles in ascending order", () => {
    let state = createChallenge(makeRound([3, 1, 2]));

    state = selectBubble(state, "bubble-1");
    state = selectBubble(state, "bubble-2");

    expect(state.selectedIds).toEqual(["bubble-1", "bubble-2"]);
    expect(state.status).toBe("playing");
  });

  it("reveals the correct bubble after a wrong click", () => {
    const initial = createChallenge(makeRound([3, 1, 2]));
    const state = selectBubble(initial, "bubble-0");

    expect(state.status).toBe("feedback");
    expect(state.feedback?.wrongBubbleId).toBe("bubble-0");
    expect(state.feedback?.correctBubbleId).toBe("bubble-1");
    expect(state.failureReason).toBe("wrong-answer");
  });

  
it("continues after feedback when lives remain", () => {
  let state = createChallenge(makeRound([3,1,2]));

  const wrongBubble = state.currentRound.find(
    (bubble) =>
      bubble.id !==
      [...state.currentRound].sort((a, b) => a.value - b.value)[0].id,
  )!;

  state = selectBubble(state, wrongBubble.id);

  expect(state.status).toBe("feedback");
  expect(state.lives).toBe(2);

  state = finishFailureFeedback(state);

  expect(state.status).toBe("playing");
  expect(state.feedback).toBeNull();
  expect(state.lives).toBe(2);
});


  it("fails when the timer expires", () => {
    const state = failOnTimeout(createChallenge(makeRound([3, 1, 2])));

    expect(state.status).toBe("failed");
    expect(state.failureReason).toBe("timeout");
  });

  it("completes after five successful rounds", () => {
    let state = createChallenge(makeRound([3, 1, 2]));

    for (let round = 0; round < 4; round++) {
      state = completeRound(state);
      expect(state.status).toBe("playing");
      expect(state.roundIndex).toBe(round + 1);
    }

    state = completeRound(state);

    expect(state.status).toBe("success");
    expect(state.roundIndex).toBe(4);
  });

  it("ignores unknown bubble IDs", () => {
    const initial = createChallenge(makeRound([3, 1, 2]));
    const state = selectBubble(initial, "missing-bubble");

    expect(state).toBe(initial);
  });
});