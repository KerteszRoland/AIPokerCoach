import { ActionNamesArray, StreetsArray } from "@/config/action";
import { CardsArray } from "@/config/card";
import { PositionsArray } from "@/config/position";
import {
  Action,
  ActionFull,
  CommunityCard,
  Hand,
  HandFull,
  HandPlayer,
  HandPlayerCards,
  HandPlayerFull,
} from "@/server/serverRequests/hand";
import { z } from "zod";

export const handPlayerCardsValidationSchema = z.object({
  handPlayerId: z.string(),
  card1: z.enum(CardsArray),
  card2: z.enum(CardsArray),
}) satisfies z.ZodType<HandPlayerCards>;

export const handPlayerValidationSchema = z.object({
  id: z.string(),
  name: z.string(),
  handId: z.string(),
  seat: z.number(),
  position: z.enum(PositionsArray).nullable(),
  chips: z.number(),
  chipsAfterHand: z.number(),
  isSittingOut: z.boolean(),
  isHero: z.boolean(),
}) satisfies z.ZodType<HandPlayer>;

export const handPlayerFullValidationSchema = handPlayerValidationSchema.extend(
  {
    cards: handPlayerCardsValidationSchema.nullable(),
  }
) satisfies z.ZodType<HandPlayerFull>;

export const actionValidationSchema = z.object({
  id: z.string(),
  name: z.enum(ActionNamesArray),
  handId: z.string(),
  handPlayerId: z.string(),
  street: z.enum(StreetsArray),
  sequence: z.number(),
  amount: z.number().nullable(),
  amount2: z.number().nullable(),
  card1: z.enum(CardsArray).nullable(),
  card2: z.enum(CardsArray).nullable(),
  text: z.string().nullable(),
}) satisfies z.ZodType<Action>;

export const actionFullValidationSchema = actionValidationSchema.extend({
  player: handPlayerValidationSchema,
}) satisfies z.ZodType<ActionFull>;

export const communityCardValidationSchema = z.object({
  handId: z.string(),
  flop1: z.enum(CardsArray).nullable(),
  flop2: z.enum(CardsArray).nullable(),
  flop3: z.enum(CardsArray).nullable(),
  turn: z.enum(CardsArray).nullable(),
  river: z.enum(CardsArray).nullable(),
}) satisfies z.ZodType<CommunityCard>;

export const handValidationSchema = z.object({
  id: z.string(),
  pokerClientHandId: z.string().nullable(),
  date: z.string(),
  time: z.string(),
  tableName: z.string(),
  smallBlind: z.number(),
  maxPlayers: z.number(),
  dealerSeat: z.number(),
  totalPot: z.number(),
  mainPot: z.number(),
  sidePot: z.number(),
  sidePot2: z.number(),
  rake: z.number(),
  createdAt: z.string(),
  userId: z.string(),
}) satisfies z.ZodType<Hand>;

export const handFullValidationSchema = handValidationSchema.extend({
  players: z.array(handPlayerFullValidationSchema),
  actions: z.array(actionFullValidationSchema),
  communityCards: communityCardValidationSchema.nullable(),
}) satisfies z.ZodType<HandFull>;
