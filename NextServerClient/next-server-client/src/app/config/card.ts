export type Card =
  | "2s"
  | "2h"
  | "2d"
  | "2c"
  | "3s"
  | "3h"
  | "3d"
  | "3c"
  | "4s"
  | "4h"
  | "4d"
  | "4c"
  | "5s"
  | "5h"
  | "5d"
  | "5c"
  | "6s"
  | "6h"
  | "6d"
  | "6c"
  | "7s"
  | "7h"
  | "7d"
  | "7c"
  | "8s"
  | "8h"
  | "8d"
  | "8c"
  | "9s"
  | "9h"
  | "9d"
  | "9c"
  | "Ts"
  | "Th"
  | "Td"
  | "Tc"
  | "Js"
  | "Jh"
  | "Jd"
  | "Jc"
  | "Qs"
  | "Qh"
  | "Qd"
  | "Qc"
  | "Ks"
  | "Kh"
  | "Kd"
  | "Kc"
  | "As"
  | "Ah"
  | "Ad"
  | "Ac";

export const CardsArray: Card[] = [
  "2s",
  "2h",
  "2d",
  "2c",
  "3s",
  "3h",
  "3d",
  "3c",
  "4s",
  "4h",
  "4d",
  "4c",
  "5s",
  "5h",
  "5d",
  "5c",
  "6s",
  "6h",
  "6d",
  "6c",
  "7s",
  "7h",
  "7d",
  "7c",
  "8s",
  "8h",
  "8d",
  "8c",
  "9s",
  "9h",
  "9d",
  "9c",
  "Ts",
  "Th",
  "Td",
  "Tc",
  "Js",
  "Jh",
  "Jd",
  "Jc",
  "Qs",
  "Qh",
  "Qd",
  "Qc",
  "Ks",
  "Kh",
  "Kd",
  "Kc",
  "As",
  "Ah",
  "Ad",
  "Ac",
];

export function isValidCard(card: string): boolean {
  return CardsArray.includes(card as Card);
}

export type CardSuit = "s" | "h" | "d" | "c";
export const CardSuitsArray: CardSuit[] = ["s", "h", "d", "c"];
export enum CardSuits {
  Spades = "s",
  Hearts = "h",
  Diamonds = "d",
  Clubs = "c",
}

export type CardValue =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export const CardValuesArray: CardValue[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export enum CardValues {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "T",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
}

export function isValidCardValue(value: string): boolean {
  return CardValuesArray.includes(value as CardValue);
}

export function isValidCardSuit(suit: string): boolean {
  return CardSuitsArray.includes(suit as CardSuit);
}

export function getCardValue(card: Card): CardValue {
  return card.slice(0, -1) as CardValue;
}

export function getCardSuit(card: Card): CardSuit {
  return card.slice(-1) as CardSuit;
}
