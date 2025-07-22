import { asc, desc } from "drizzle-orm";
import {
  Actions,
  CommunityCards,
  HandPlayerCards,
  HandPlayers,
  Hands,
} from "@/db/schema";
import db from "../db";
import { Card } from "@/config/card";
import { Position } from "@/config/position";
import { ActionName, numToStreet, Street } from "@/config/action";

export type HandPlayerCards = {
  handPlayerId: string;
  card1: Card;
  card2: Card;
};

export type HandPlayer = {
  id: string;
  name: string;
  handId: string;
  seat: number;
  position: Position | null;
  chips: number;
  chipsAfterHand: number;
  isSittingOut: boolean;
  isHero: boolean;
};

export type HandPlayerFull = HandPlayer & {
  cards: HandPlayerCards | null;
};

export type Action = {
  id: string;
  name: ActionName;
  handId: string;
  handPlayerId: string;
  street: Street;
  sequence: number;
  amount: number | null;
  amount2: number | null;
  card1: Card | null;
  card2: Card | null;
  text: string | null;
};

export type ActionFull = Action & {
  player: HandPlayer;
};

export type CommunityCard = {
  handId: string;
  flop1: Card | null;
  flop2: Card | null;
  flop3: Card | null;
  turn: Card | null;
  river: Card | null;
};

export type Hand = {
  id: string;
  pokerClientHandId: string | null;
  date: string;
  time: string;
  tableName: string;
  smallBlind: number;
  maxPlayers: number;
  dealerSeat: number;
  totalPot: number;
  mainPot: number;
  sidePot: number;
  sidePot2: number;
  rake: number;
  createdAt: string;
};

export type HandFull = Hand & {
  players: HandPlayerFull[];
  actions: ActionFull[];
  communityCards: CommunityCard | null;
};

export function HandFullFromDb(
  dbHand: typeof Hands.$inferSelect & {
    players: (typeof HandPlayers.$inferSelect & {
      cards: typeof HandPlayerCards.$inferSelect | null;
    })[];
    actions: (typeof Actions.$inferSelect & {
      player: typeof HandPlayers.$inferSelect;
    })[];
    communityCards: typeof CommunityCards.$inferSelect;
  }
): HandFull {
  return {
    id: dbHand.id,
    pokerClientHandId: dbHand.pokerClientHandId,
    date: dbHand.date,
    time: dbHand.time,
    tableName: dbHand.tableName,
    smallBlind: dbHand.smallBlind,
    maxPlayers: dbHand.maxPlayers,
    dealerSeat: dbHand.dealerSeat,
    totalPot: dbHand.totalPot,
    mainPot: dbHand.mainPot,
    sidePot: dbHand.sidePot,
    sidePot2: dbHand.sidePot2,
    rake: dbHand.rake,
    createdAt: dbHand.createdAt,
    players: dbHand.players.map((player) => ({
      ...HandPlayerFromDb(player),
      cards: player.cards ? HandPlayerCardsFromDb(player.cards) : null,
    })),
    actions: dbHand.actions.map((action) => ({
      ...ActionFromDb(action),
      player: HandPlayerFromDb(action.player),
    })),
    communityCards: dbHand.communityCards
      ? CommunityCardFromDb(dbHand.communityCards)
      : null,
  } as HandFull;
}

export function HandFromDb(dbHand: typeof Hands.$inferSelect): Hand {
  return dbHand as Hand;
}

export function HandPlayerFromDb(
  dbHandPlayer: typeof HandPlayers.$inferSelect
): HandPlayer {
  return dbHandPlayer as HandPlayer;
}

export function HandPlayerCardsFromDb(
  dbHandPlayerCard: typeof HandPlayerCards.$inferSelect
): HandPlayerCards {
  return dbHandPlayerCard as HandPlayerCards;
}

export function ActionFromDb(dbAction: typeof Actions.$inferSelect): Action {
  const street = numToStreet(dbAction.street);
  return {
    id: dbAction.id,
    name: dbAction.name as ActionName,
    handId: dbAction.handId,
    handPlayerId: dbAction.handPlayerId,
    street: street,
    sequence: dbAction.sequence,
    amount: dbAction.amount,
    amount2: dbAction.amount2,
    card1: dbAction.card1 as Card | null,
    card2: dbAction.card2 as Card | null,
    text: dbAction.text,
  } as Action;
}

export function CommunityCardFromDb(
  dbCommunityCard: typeof CommunityCards.$inferSelect
): CommunityCard {
  return {
    handId: dbCommunityCard.handId,
    flop1: dbCommunityCard.flop1 as Card | null,
    flop2: dbCommunityCard.flop2 as Card | null,
    flop3: dbCommunityCard.flop3 as Card | null,
    turn: dbCommunityCard.turn as Card | null,
    river: dbCommunityCard.river as Card | null,
  } as CommunityCard;
}

export async function getMostRecentHand(): Promise<HandFull | null> {
  const hand = await db.query.Hands.findFirst({
    orderBy: [desc(Hands.createdAt)],
    with: {
      players: {
        with: {
          cards: true,
        },
      },
      actions: {
        orderBy: [asc(Actions.street), asc(Actions.sequence)],
        with: {
          player: true,
        },
      },
      communityCards: true,
    },
  });

  return hand ? HandFullFromDb(hand) : null;
}

export async function getHands(
  page: number,
  pageSize: number
): Promise<HandFull[]> {
  const hands = await db.query.Hands.findMany({
    orderBy: [desc(Hands.createdAt)],
    limit: pageSize,
    offset: page * pageSize,
    with: {
      players: {
        with: {
          cards: true,
        },
      },
      actions: {
        orderBy: [asc(Actions.street), asc(Actions.sequence)],
        with: {
          player: true,
        },
      },
      communityCards: true,
    },
  });
  return hands.map(HandFullFromDb);
}
