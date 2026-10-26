import type { DifficultyConfig } from "./difficulty";

export type Operator = "+" | "−" | "×" | "÷";

export interface MathExpression {
  id: string;
  left: number;
  right: number;
  operator: Operator;
  text: string;
  value: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateExpression(
  difficulty: DifficultyConfig = {
    minNumber: 1,
    maxNumber: 10,
    operations: ["+", "−"],
  },
): MathExpression {
  const operator =
    difficulty.operations[
      randomInt(0, difficulty.operations.length - 1)
    ];

  let left: number;
  let right: number;
  let value: number;

  switch (operator) {
    case "+":
      left = randomInt(difficulty.minNumber, difficulty.maxNumber);
      right = randomInt(difficulty.minNumber, difficulty.maxNumber);
      value = left + right;
      break;

    case "−":
      left = randomInt(difficulty.minNumber, difficulty.maxNumber);
      right = randomInt(difficulty.minNumber, left);
      value = left - right;
      break;

    case "×":
      left = randomInt(2, Math.min(10, difficulty.maxNumber));
      right = randomInt(2, Math.min(10, difficulty.maxNumber));
      value = left * right;
      break;

    case "÷": {
      right = randomInt(2, Math.min(10, difficulty.maxNumber));
      const quotient = randomInt(2, Math.min(10, difficulty.maxNumber));
      left = right * quotient;
      value = left / right;
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    left,
    right,
    operator,
    text: `${left} ${operator} ${right}`,
    value,
  };
}

export function generateRound(
  difficulty?: DifficultyConfig,
): MathExpression[] {
  const expressions: MathExpression[] = [];
  const usedValues = new Set<number>();

  for (let attempt = 0; attempt < 1000 && expressions.length < 3; attempt++) {
    const expression = generateExpression(difficulty);

    if (!usedValues.has(expression.value)) {
      expressions.push(expression);
      usedValues.add(expression.value);
    }
  }

  if (expressions.length < 3) {
    throw new Error("Unable to generate three distinct expressions.");
  }

  return expressions;
}