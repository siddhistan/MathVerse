
import { useEffect, useState } from "react";
import {
  ROUND_SIZE,
  TOTAL_ROUNDS,
  createChallenge,
  failOnTimeout,
  finishFailureFeedback,
  selectBubble,
  type ChallengeState,
} from "../game/challengeEngine";
import {
  generateRound,
  type MathExpression,
} from "../game/expressionGenerator";

interface ChallengeViewProps {
  floor: number;
  room: number;
  onComplete: () => void;
  onExit: () => void;
}

function createFreshRound(): MathExpression[] {
  return generateRound();
}

export default function ChallengeView({
  floor,
  room,
  onComplete,
  onExit,
}: ChallengeViewProps) {
  const [challenge, setChallenge] = useState<ChallengeState>(() =>
    createChallenge(createFreshRound()),
  );

  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (challenge.status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [challenge.status, challenge.roundIndex]);

  useEffect(() => {
    if (timeLeft !== 0 || challenge.status !== "playing") return;

    setChallenge((current) => failOnTimeout(current));
  }, [timeLeft, challenge.status]);

  useEffect(() => {
    if (challenge.status !== "feedback") return;

    const timeout = window.setTimeout(() => {
      setChallenge((current) => finishFailureFeedback(current));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [challenge.status]);

  useEffect(() => {
    if (challenge.status === "success") {
      onComplete();
    }
  }, [challenge.status, onComplete]);

  function handleBubbleClick(bubbleId: string) {
    if (challenge.status !== "playing") return;

    const expected = [...challenge.currentRound].sort(
      (a, b) => a.value - b.value,
    )[challenge.selectedIds.length];

    const clicked = challenge.currentRound.find(
      (bubble) => bubble.id === bubbleId,
    );

    const isCorrect = clicked?.id === expected?.id;

    let nextRound: MathExpression[] | undefined;

    if (
      isCorrect &&
      challenge.selectedIds.length === ROUND_SIZE - 1 &&
      challenge.roundIndex < TOTAL_ROUNDS - 1
    ) {
      nextRound = createFreshRound();
    }

    setChallenge((current) =>
      selectBubble(current, bubbleId, nextRound),
    );
  }

  function retryChallenge() {
    setChallenge(createChallenge(createFreshRound()));
    setTimeLeft(30);
  }

  return (
    <section className="challenge-view">
      <button className="back-button" onClick={onExit}>
        ← Exit room
      </button>

      <div className="challenge-heading">
        <p className="eyebrow">
          FLOOR {floor} · ROOM {room}
        </p>
        <h2>Order the Orbs</h2>
        <p>Tap the expressions from smallest answer to largest.</p>
      </div>

      <div className="challenge-stats">
        <div className="stat-card">
          <span className="stat-label">TIME LEFT</span>
          <strong className={timeLeft <= 10 ? "timer-danger" : ""}>
            {timeLeft}s
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">ROUND</span>
          <strong>
            {Math.min(challenge.roundIndex + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </strong>
        </div>
      </div>

      {challenge.status === "playing" ||
      challenge.status === "feedback" ? (
        <div className="bubble-grid">
          {challenge.currentRound.map((bubble) => {
            const selected = challenge.selectedIds.includes(bubble.id);
            const isWrong =
              challenge.feedback?.wrongBubbleId === bubble.id;
            const isCorrectFeedback =
              challenge.feedback?.correctBubbleId === bubble.id;

            let bubbleClass = "math-bubble";

            if (selected) bubbleClass += " bubble-selected";
            if (isWrong) bubbleClass += " bubble-wrong";
            if (
              challenge.status === "feedback" &&
              isCorrectFeedback
            ) {
              bubbleClass += " bubble-correct";
            }

            return (
              <button
                key={bubble.id}
                className={bubbleClass}
                disabled={
                  challenge.status !== "playing" || selected
                }
                onClick={() => handleBubbleClick(bubble.id)}
              >
                <span className="bubble-expression">{bubble.text}</span>
                {selected && (
                  <span className="bubble-check">✓</span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      {challenge.status === "playing" && (
        <p className="challenge-hint">
          Find the smallest answer first!
        </p>
      )}

      {challenge.status === "feedback" && (
        <p className="challenge-message">
          Not quite! The green orb shows the correct next choice.
        </p>
      )}

      {challenge.status === "failed" && (
        <div className="challenge-result">
          <div className="result-icon">💫</div>
          <h3>
            {challenge.failureReason === "timeout"
              ? "Time's up!"
              : "Not quite!"}
          </h3>
          <p>
            {challenge.failureReason === "timeout"
              ? "You ran out of time. Give it another shot!"
              : "One wrong click ended this attempt. You can try again."}
          </p>
          <button className="primary-button" onClick={retryChallenge}>
            Try again
          </button>
          <button className="back-button" onClick={onExit}>
            Back to rooms
          </button>
        </div>
      )}

      {challenge.status === "success" && (
        <div className="challenge-result">
          <div className="result-icon">🏆</div>
          <h3>Room conquered!</h3>
          <p>You ordered every orb correctly in time.</p>
        </div>
      )}
    </section>
  );
}
