
import {
  isRoomUnlocked,
  roomId,
  type GameProgress,
} from "../game/progression";

interface FloorViewProps {
  floor: number;
  progress: GameProgress;
  onSelectRoom: (room: number) => void;
  onBack: () => void;
}

export default function FloorView({
  floor,
  progress,
  onSelectRoom,
  onBack,
}: FloorViewProps) {
  return (
    <section className="floor-view">
      <button className="back-button" onClick={onBack}>
        ← Back to building
      </button>

      <div className="floor-title">
        <p className="eyebrow">KNOWLEDGE TOWER</p>
        <h2>Floor {floor}</h2>
        <p>Choose a room and test your mathematical skills.</p>
      </div>

      <div className="room-grid">
        {[1, 2, 3, 4].map((room) => {
          const unlocked = isRoomUnlocked(floor, room, progress);
          const completed = progress.completedRooms.includes(
            roomId(floor, room),
          );

          return (
            <button
              key={room}
              className={`room-card ${unlocked ? "unlocked" : "locked"} ${
                completed ? "completed" : ""
              }`}
              disabled={!unlocked}
              onClick={() => onSelectRoom(room)}
            >
              <span className="room-icon">
                {completed ? "✓" : unlocked ? "◇" : "🔒"}
              </span>

              <span className="room-name">Room {room}</span>

              <span className="room-status">
                {completed
                  ? "Completed · Replay"
                  : unlocked
                    ? "Ready to explore"
                    : "Complete the previous room"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
