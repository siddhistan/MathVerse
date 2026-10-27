
import type { DifficultyConfig } from "./difficulty";

export interface MissingNumberPuzzle {
  id: string;
  text: string;
  answer: number;
  options: number[];
}

export function generateMissingNumberPuzzle(
  difficulty: DifficultyConfig,
): MissingNumberPuzzle {
  const { minNumber, maxNumber } = difficulty;

  // Choose the missing number.
  const answer =
    Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

  // Randomly choose addition or subtraction.
 const availableOperators = difficulty.operations.filter(
  (operation) => operation === "+" || operation === "−",
);

if (availableOperators.length === 0) {
  throw new Error(
    "Missing-number puzzles require addition or subtraction.",
  );
}

const operator =
  availableOperators[
    Math.floor(Math.random() * availableOperators.length)
  ];

  let left: number;
  let result: number;

  if (operator === "+") {
    left =
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    result = left + answer;
  } else {
    // Keep subtraction results non-negative.
    left = answer +
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + 1;
    result = left - answer;
  }

  // Create two incorrect options that are different from the answer.
  const options = new Set<number>([answer]);

  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const distractor = Math.random() < 0.5
      ? answer + offset
      : answer - offset;

    if (distractor >= minNumber && distractor <= maxNumber) {
      options.add(distractor);
    }
  }

  // Shuffle the options so the correct answer isn't always first.
  const shuffledOptions = [...options];

  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [
      shuffledOptions[j],
      shuffledOptions[i],
    ];
  }

  return {
    id: crypto.randomUUID(),
    text: `${left} ${operator} ? = ${result}`,
    answer,
    options: shuffledOptions,
  };
}
