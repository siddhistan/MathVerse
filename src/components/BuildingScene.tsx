
interface BuildingSceneProps {
  onSelectFloor: (floor: number) => void;
}

const floors = [
  { number: 3, y: 100, color: "#8b5cf6" },
  { number: 2, y: 225, color: "#6366f1" },
  { number: 1, y: 350, color: "#3b82f6" },
];

export default function BuildingScene({
  onSelectFloor,
}: BuildingSceneProps) {
  return (
    <div className="building-scene">
      <svg
        viewBox="0 0 700 520"
        role="img"
        aria-label="Math Universe building with three floors"
      >
        <ellipse
          cx="350"
          cy="455"
          rx="230"
          ry="28"
          fill="#0f172a"
          opacity="0.12"
        />

        {floors.map((floor) => (
          <g
            key={floor.number}
            role="button"
            tabIndex={0}
            aria-label={`Enter floor ${floor.number}`}
            onClick={() => onSelectFloor(floor.number)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectFloor(floor.number);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {/* Front wall */}
            <polygon
              points={`210,${floor.y + 45} 420,${floor.y + 45} 420,${floor.y + 125} 210,${floor.y + 125}`}
              fill={floor.color}
              stroke="#1e1b4b"
              strokeWidth="2"
            />

            {/* Right wall */}
            <polygon
              points={`420,${floor.y + 45} 490,${floor.y + 5} 490,${floor.y + 85} 420,${floor.y + 125}`}
              fill="#312e81"
              stroke="#1e1b4b"
              strokeWidth="2"
            />

            {/* Top surface */}
            <polygon
              points={`210,${floor.y + 45} 280,${floor.y + 5} 490,${floor.y + 5} 420,${floor.y + 45}`}
              fill="#c4b5fd"
              stroke="#1e1b4b"
              strokeWidth="2"
            />

            {/* Windows */}
            {[245, 300, 355].map((x) => (
              <rect
                key={x}
                x={x}
                y={floor.y + 65}
                width="28"
                height="32"
                rx="3"
                fill="#fef3c7"
                stroke="#312e81"
                strokeWidth="2"
              />
            ))}

            {/* Floor label */}
            <text
              x="315"
              y={floor.y + 115}
              textAnchor="middle"
              fontSize="15"
              fontWeight="bold"
              fill="white"
              pointerEvents="none"
            >
              FLOOR {floor.number}
            </text>
          </g>
        ))}

        {/* Roof */}
        <polygon
          points="190,145 350,55 510,145 350,185"
          fill="#f59e0b"
          stroke="#92400e"
          strokeWidth="3"
        />

        <text
          x="350"
          y="135"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#451a03"
          pointerEvents="none"
        >
          MATH
        </text>
      </svg>
    </div>
  );
}
