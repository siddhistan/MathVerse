import { describe, expect, it } from "vitest";
import {
  generateExpression,
  generateRound,
  type MathExpression,
} from "../src/game/expressionGenerator";

function calculate(expression: MathExpression): number {
  const { left, right, operator } = expression;

  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return left / right;
  }
}

describe("expressionGenerator", () => {
  it("generates valid mathematical expressions", () => {
    for (let i = 0; i < 100; i++) {
      const expression = generateExpression();

      expect(expression.text).toBe(
        `${expression.left} ${expression.operator} ${expression.right}`,
      );
      expect(expression.value).toBe(calculate(expression));
      expect(Number.isFinite(expression.value)).toBe(true);
    }
  });

  it("generates exactly three expressions per round", () => {
    expect(generateRound()).toHaveLength(3);
  });

  it("generates three distinct numerical values", () => {
    for (let i = 0; i < 100; i++) {
      const round = generateRound();
      const values = round.map((expression) => expression.value);

      expect(new Set(values).size).toBe(3);
    }
  });

  it("generates unique IDs for each expression", () => {
    const round = generateRound();
    const ids = round.map((expression) => expression.id);

    expect(new Set(ids).size).toBe(3);
  });

  it("only generates non-negative results in the initial difficulty", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateExpression().value).toBeGreaterThanOrEqual(0);
    }
  });
});