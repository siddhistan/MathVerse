export const TOTAL_FLOORS = 3;
export const ROOMS_PER_FLOOR = 4;

export interface GameProgress {
  completedRooms: string[];
}

export function roomId(floor: number, room: number): string {
  return `floor-${floor}-room-${room}`;
}

export function isRoomUnlocked(
  floor: number,
  room: number,
  progress: GameProgress,
): boolean {
  if (floor < 1 || floor > TOTAL_FLOORS || room < 1 || room > ROOMS_PER_FLOOR) {
    return false;
  }

  if (floor === 1 && room === 1) {
    return true;
  }

  if (room > 1) {
    return progress.completedRooms.includes(roomId(floor, room - 1));
  }

  // The first room of the next floor unlocks after the previous
  // floor's fourth room has been completed.
  return progress.completedRooms.includes(
    roomId(floor - 1, ROOMS_PER_FLOOR),
  );
}

export function completeRoom(
  floor: number,
  room: number,
  progress: GameProgress,
): GameProgress {
  const id = roomId(floor, room);

  if (
    !isRoomUnlocked(floor, room, progress) ||
    progress.completedRooms.includes(id)
  ) {
    return progress;
  }

  return {
    ...progress,
    completedRooms: [...progress.completedRooms, id],
  };
}