import { cardEnum } from "@/db/schema";

export type Card = (typeof cardEnum.enumValues)[number];

export const CardsArray = cardEnum.enumValues;

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

export function getCardsSortedByValue(cards: Card[]): Card[] {
  return cards.sort((a, b) => {
    return (
      CardValuesArray.indexOf(getCardValue(a)) -
      CardValuesArray.indexOf(getCardValue(b))
    );
  });
}

export function getCardSuit(card: Card): CardSuit {
  return card.slice(-1) as CardSuit;
}
