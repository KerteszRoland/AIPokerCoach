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

export const PositionsArray: Position[] = [
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

export enum Positions {
  BTN = "BTN",
  SB = "SB",
  BB = "BB",
  UTG = "UTG",
  UTG1 = "UTG+1",
  UTG2 = "UTG+2",
  LJ = "LJ",
  HJ = "HJ",
  CO = "CO",
}

export function isValidPosition(position: string): position is Position {
  return PositionsArray.includes(position as Position);
}

export type Seat = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
