export type Position =
  | "BTN"
  | "SB"
  | "BB"
  | "UTG"
  | "UTG+1"
  | "UTG+2"
  | "LJ"
  | "HJ"
  | "CO";

export const Positions: Position[] = [
  "BTN",
  "SB",
  "BB",
  "UTG",
  "UTG+1",
  "UTG+2",
  "LJ",
  "HJ",
  "CO",
];

export function isValidPosition(position: string): position is Position {
  return Positions.includes(position as Position);
}

export type Seat = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
