export type ActionName =
  | "PostSmallBlind"
  | "PostBigBlind"
  | "SitsOut"
  | "Fold"
  | "Call"
  | "Raise"
  | "Check"
  | "Bet"
  | "BetAndAllIn"
  | "CallAndAllIn"
  | "RaiseAndAllIn"
  | "Muck"
  | "Shows"
  | "Collected"
  | "CashedOut"
  | "TimedOut"
  | "UncalledBet"
  | "DoesNotShow"
  | "Join"
  | "Leave"
  | "Disconnected"
  | "Connected"
  | "CollectedFromSidePot"
  | "CollectedFromMainPot";

export const ActionNamesArray: ActionName[] = [
  "PostSmallBlind",
  "PostBigBlind",
  "SitsOut",
  "Fold",
  "Call",
  "Raise",
  "Check",
  "Bet",
  "BetAndAllIn",
  "CallAndAllIn",
  "RaiseAndAllIn",
  "Muck",
  "Shows",
  "Collected",
  "CashedOut",
  "TimedOut",
  "UncalledBet",
  "DoesNotShow",
  "Join",
  "Leave",
  "Disconnected",
  "Connected",
  "CollectedFromSidePot",
  "CollectedFromMainPot",
];

export enum ActionNames {
  PostSmallBlind = "PostSmallBlind",
  PostBigBlind = "PostBigBlind",
  SitsOut = "SitsOut",
  Fold = "Fold",
  Call = "Call",
  Raise = "Raise",
  Check = "Check",
  Bet = "Bet",
  BetAndAllIn = "BetAndAllIn",
  CallAndAllIn = "CallAndAllIn",
  RaiseAndAllIn = "RaiseAndAllIn",
  Muck = "Muck",
  Shows = "Shows",
  Collected = "Collected",
  CashedOut = "CashedOut",
  TimedOut = "TimedOut",
  UncalledBet = "UncalledBet",
  DoesNotShow = "DoesNotShow",
  Join = "Join",
  Leave = "Leave",
  Disconnected = "Disconnected",
  Connected = "Connected",
  CollectedFromSidePot = "CollectedFromSidePot",
  CollectedFromMainPot = "CollectedFromMainPot",
}

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
export enum Streets {
  Pre = "pre",
  Preflop = "preflop",
  Flop = "flop",
  Turn = "turn",
  River = "river",
  Showdown = "showdown",
}

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
