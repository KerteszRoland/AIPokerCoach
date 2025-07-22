import { actionNameEnum } from "@/db/schema";

export type ActionName = (typeof actionNameEnum.enumValues)[number];

export const ActionNamesArray = actionNameEnum.enumValues;

export const ActionNames = {
  PostSmallBlind: "PostSmallBlind" as ActionName,
  PostBigBlind: "PostBigBlind" as ActionName,
  SitsOut: "SitsOut" as ActionName,
  Fold: "Fold" as ActionName,
  Call: "Call" as ActionName,
  Raise: "Raise" as ActionName,
  Check: "Check" as ActionName,
  Bet: "Bet" as ActionName,
  BetAndAllIn: "BetAndAllIn" as ActionName,
  CallAndAllIn: "CallAndAllIn" as ActionName,
  RaiseAndAllIn: "RaiseAndAllIn" as ActionName,
  Muck: "Muck" as ActionName,
  Shows: "Shows" as ActionName,
  Collected: "Collected" as ActionName,
  CashedOut: "CashedOut" as ActionName,
  TimedOut: "TimedOut" as ActionName,
  UncalledBet: "UncalledBet" as ActionName,
  DoesNotShow: "DoesNotShow" as ActionName,
  Join: "Join" as ActionName,
  Leave: "Leave" as ActionName,
  Disconnected: "Disconnected" as ActionName,
  Connected: "Connected" as ActionName,
  CollectedFromSidePot: "CollectedFromSidePot" as ActionName,
  CollectedFromMainPot: "CollectedFromMainPot" as ActionName,
};

export function isValidActionName(text: string): text is ActionName {
  return ActionNamesArray.includes(text as ActionName);
}

export type Street = "pre" | "preflop" | "flop" | "turn" | "river" | "showdown";
export const StreetsArray: Street[] = [
  "pre",
  "preflop",
  "flop",
  "turn",
  "river",
  "showdown",
];
export const Streets = {
  Pre: "pre" as Street,
  Preflop: "preflop" as Street,
  Flop: "flop" as Street,
  Turn: "turn" as Street,
  River: "river" as Street,
  Showdown: "showdown" as Street,
};

export function streetToNum(streetName: Street) {
  switch (streetName) {
    case "pre":
      return 0;
    case "preflop":
      return 1;
    case "flop":
      return 2;
    case "turn":
      return 3;
    case "river":
      return 4;
    case "showdown":
      return 5;
    default:
      throw new Error(`Invalid street name: ${streetName}`);
  }
}

export function numToStreet(num: number) {
  return StreetsArray[num] as Street;
}

export function isValidStreet(street: string): boolean {
  return StreetsArray.includes(street as Street);
}

export type PokerStreet = "flop" | "turn" | "river";
export const PokerStreetsArray: PokerStreet[] = ["flop", "turn", "river"];
export enum PokerStreets {
  Flop = "flop",
  Turn = "turn",
  River = "river",
}
