
import { useEffect, useState } from "react";
import {
  createMissingNumberChallenge,
  finishMissingNumberFeedback,
  selectMissingNumberAnswer,
} from "../game/missingNumberEngine";
import { generateMissingNumberPuzzle } from "../game/missingNumber";
import { getRoomConfig } from "../game/roomConfig";

interface MissingNumberViewProps {
  floor: number;
  room: number;
  onComplete: () => void;
  onExit: () => void;
}

export default function MissingNumberView({
  floor,
  room,
  onComplete,
  onExit,
}: MissingNumberViewProps) {
  const config = getRoomConfig(floor, room);

  if (!config || config.puzzleType !== "missing-number") {
    return (
      <section className="challenge-view">
        <h2>Room configuration error</h2>
        <button className="back-button" onClick={onExit}>
          ← Back to rooms
        </button>
      </section>
    );
  }

  return (
    <ActiveMissingNumber
      key={`${floor}-${room}`}
      floor={floor}
      room={room}
      config={config}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
}

interface ActiveMissingNumberProps extends MissingNumberViewProps {
  config: NonNullable<ReturnType<typeof getRoomConfig>>;
}

function ActiveMissingNumber({
  floor,
  room,
  config,
  onComplete,
  onExit,
}: ActiveMissingNumberProps) {
  const [challenge, setChallenge] = useState(() =>
    createMissingNumberChallenge(
      generateMissingNumberPuzzle(config.difficulty),
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

    setChallenge((current) => ({
      ...current,
      status: "failed",
      failureReason: null,
    }));
  }, [timeLeft, challenge.status]);

  useEffect(() => {
    if (challenge.status !== "feedback") return;

    const timeout = window.setTimeout(() => {
      setChallenge((current) => finishMissingNumberFeedback(current));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [challenge.status]);

  useEffect(() => {
    if (challenge.status === "success") {
      onComplete();
    }
  }, [challenge.status, onComplete]);

  function handleAnswer(answer: number) {
    if (challenge.status !== "playing") return;

    const isCorrect = answer === challenge.puzzle.answer;
    const isFinalRound =
      challenge.roundIndex === challenge.totalRounds - 1;

    const nextPuzzle =
      isCorrect && !isFinalRound
        ? generateMissingNumberPuzzle(config.difficulty)
        : undefined;

    setChallenge((current) =>
      selectMissingNumberAnswer(current, answer, nextPuzzle),
    );
  }

  function retryChallenge() {
    setChallenge(
      createMissingNumberChallenge(
        generateMissingNumberPuzzle(config.difficulty),
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
        <p>Find the missing number to solve the equation.</p>

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
        <>
          <div className="missing-number-equation">
            {challenge.puzzle.text}
          </div>

          <div className="bubble-grid">
            {challenge.puzzle.options.map((option) => (
              <button
                key={option}
                className="math-bubble"
                disabled={challenge.status !== "playing"}
                onClick={() => handleAnswer(option)}
              >
                <span className="bubble-expression">{option}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {challenge.status === "playing" && (
        <p className="challenge-hint">
          Choose the number that makes the equation correct!
        </p>
      )}

      {challenge.status === "feedback" && (
        <p className="challenge-message">
          Not quite! You have {challenge.lives}{" "}
          {challenge.lives === 1 ? "life" : "lives"} remaining.
        </p>
      )}

      {challenge.status === "failed" && (
        <div className="challenge-result">
          <div className="result-icon">💫</div>
          <h3>{timeLeft === 0 ? "Time's up!" : "Out of lives!"}</h3>
          <p>
            {timeLeft === 0
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
