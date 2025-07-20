import { positionEnum } from "@/db/schema";

export type Position = (typeof positionEnum.enumValues)[number];

export const PositionsArray = positionEnum.enumValues;

export const Positions = {
  BTN: "BTN" as Position,
  SB: "SB" as Position,
  BB: "BB" as Position,
  UTG: "UTG" as Position,
  UTG1: "UTG1" as Position,
  UTG2: "UTG2" as Position,
  LJ: "LJ" as Position,
  HJ: "HJ" as Position,
  CO: "CO" as Position,
};

export function isValidPosition(position: string): position is Position {
  return PositionsArray.includes(position as Position);
}
