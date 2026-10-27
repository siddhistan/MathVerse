
import { useEffect, useState } from "react";
import MissingNumberView from "./MissingNumberView";
import {
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
import { getRoomConfig } from "../game/roomConfig";

interface ChallengeViewProps {
  floor: number;
  room: number;
  onComplete: () => void;
  onExit: () => void;
}

export default function ChallengeView({
  floor,
  room,
  onComplete,
  onExit,
}: ChallengeViewProps) {
  const config = getRoomConfig(floor, room);

  if (!config) {
    return (
      <section className="challenge-view">
        <h2>Room not found</h2>
        <button className="back-button" onClick={onExit}>
          ← Back to rooms
        </button>
      </section>
    );
  }

   if (config.puzzleType === "missing-number") {
    return (
      <MissingNumberView
        floor={floor}
        room={room}
        onComplete={onComplete}
        onExit={onExit}
      />
    );
  }

  return (
    <ActiveChallenge
      key={`${floor}-${room}`}
      floor={floor}
      room={room}
      config={config}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
}

interface ActiveChallengeProps extends ChallengeViewProps {
  config: NonNullable<ReturnType<typeof getRoomConfig>>;
}

function ActiveChallenge({
  floor,
  room,
  config,
  onComplete,
  onExit,
}: ActiveChallengeProps) {
  function createFreshRound(): MathExpression[] {
    return generateRound(config.difficulty);
  }

  const [challenge, setChallenge] = useState<ChallengeState>(() =>
    createChallenge(
      createFreshRound(),
      config.totalRounds,
      config.startingLives,
    ),
  );

  const [timeLeft, setTimeLeft] = useState(config.timeLimitSeconds);

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

    if (!clicked || !expected) return;

    let nextRound: MathExpression[] | undefined;

    if (
      clicked.id === expected.id &&
      challenge.selectedIds.length === 2 &&
      challenge.roundIndex < challenge.totalRounds - 1
    ) {
      nextRound = createFreshRound();
    }

    setChallenge((current) =>
      selectBubble(current, bubbleId, nextRound),
    );
  }

  function retryChallenge() {
    setChallenge(
      createChallenge(
        createFreshRound(),
        config.totalRounds,
        config.startingLives,
      ),
    );
    setTimeLeft(config.timeLimitSeconds);
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
        <h2>{config.name}</h2>
        <p>Tap the expressions from smallest answer to largest.</p>
        {config.isBoss && (
          <p className="boss-label">★ BOSS CHALLENGE ★</p>
        )}
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
            {Math.min(challenge.roundIndex + 1, challenge.totalRounds)}/
            {challenge.totalRounds}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">LIVES</span>
          <strong aria-label={`${challenge.lives} lives remaining`}>
            {"❤️".repeat(challenge.lives)}
            {"🖤".repeat(config.startingLives - challenge.lives)}
          </strong>
        </div>
      </div>

      {(challenge.status === "playing" ||
        challenge.status === "feedback") && (
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

            if (challenge.status === "feedback" && isCorrectFeedback) {
              bubbleClass += " bubble-correct";
            }

            return (
              <button
                key={bubble.id}
                className={bubbleClass}
                disabled={challenge.status !== "playing" || selected}
                onClick={() => handleBubbleClick(bubble.id)}
              >
                <span className="bubble-expression">{bubble.text}</span>
                {selected && <span className="bubble-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {challenge.status === "playing" && (
        <p className="challenge-hint">
          Find the smallest answer first!
        </p>
      )}

      {challenge.status === "feedback" && (
        <p className="challenge-message">
          Incorrect! You have {challenge.lives}{" "}
          {challenge.lives === 1 ? "life" : "lives"} remaining.
        </p>
      )}

      {challenge.status === "failed" && (
        <div className="challenge-result">
          <div className="result-icon">💫</div>
          <h3>
            {challenge.failureReason === "timeout"
              ? "Time's up!"
              : "Out of lives!"}
          </h3>
          <p>
            {challenge.failureReason === "timeout"
              ? "You ran out of time. Give it another shot!"
              : "You've used all your lives. Try again!"}
          </p>
          <button className="primary-button" onClick={retryChallenge}>
            Try again
          </button>
          <button className="back-button" onClick={onExit}>
            Back to rooms
          </button>
        </div>
      )}
    </section>
  );
}
