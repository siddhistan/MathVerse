
import { useState } from "react";
import BuildingScene from "./components/BuildingScene";
import FloorView from "./components/FloorView";
import ChallengeView from "./components/ChallengeView";
import {
  completeRoom,
  type GameProgress,
} from "./game/progression";
import {
  loadProgress,
  saveProgress,
  resetProgress,
} from "./storage/progressStorage";
import "./App.css";

function App() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const [progress, setProgress] = useState<GameProgress>(() =>
    loadProgress(),
  );

  function returnToBuilding() {
    setSelectedRoom(null);
    setSelectedFloor(null);
  }

  function finishRoom() {
    if (selectedFloor === null || selectedRoom === null) return;

    const updatedProgress = completeRoom(
      selectedFloor,
      selectedRoom,
      progress,
    );

    setProgress(updatedProgress);
    saveProgress(updatedProgress);
    setSelectedRoom(null);
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      "Are you sure you want to reset all progress? All completed rooms will be locked again.",
    );

    if (!confirmed) return;

    resetProgress();

    setProgress({ completedRooms: [] });
    setSelectedRoom(null);
    setSelectedFloor(null);
  }

  return (
    <main className="app">
      <header className="game-header">
        <p className="eyebrow">YOUR ADVENTURE STARTS HERE</p>
        <h1>Math Universe</h1>
        <p className="subtitle">
          Explore the building. Solve challenges. Unlock every room.
        </p>
      </header>

      <section className="game-area">
        {selectedFloor === null ? (
          <>
            <div className="scene-heading">
              <h2>The Knowledge Tower</h2>
              <p>Choose a floor to begin your adventure.</p>
            </div>

            <BuildingScene onSelectFloor={setSelectedFloor} />
          </>
        ) : selectedRoom === null ? (
          <FloorView
            floor={selectedFloor}
            progress={progress}
            onSelectRoom={setSelectedRoom}
            onBack={returnToBuilding}
          />
        ) : (
          <ChallengeView
            key={`${selectedFloor}-${selectedRoom}`}
            floor={selectedFloor}
            room={selectedRoom}
            onComplete={finishRoom}
            onExit={() => setSelectedRoom(null)}
          />
        )}
      </section>

      <footer className="game-footer">
        <span>3 floors</span>
        <span>12 rooms to discover</span>
        <span>
          {progress.completedRooms.length}/12 rooms completed
        </span>

        <button
          className="reset-progress-button"
          onClick={handleResetProgress}
        >
          ↻ Reset Progress
        </button>
      </footer>
    </main>
  );
}

export default App;
