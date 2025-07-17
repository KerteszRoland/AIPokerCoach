import { asc, desc } from "drizzle-orm";
import {
  Actions,
  CommunityCards,
  HandPlayerCards,
  HandPlayers,
  Hands,
} from "@/db/schema";
import db from "./db";

export type HandFull = typeof Hands.$inferSelect & {
  players: (typeof HandPlayers.$inferSelect & {
    cards: typeof HandPlayerCards.$inferSelect;
  })[];
  actions: (typeof Actions.$inferSelect)[];
  communityCards: typeof CommunityCards.$inferSelect;
};

export default async function getMostRecentHand(): Promise<
  HandFull | undefined
> {
  const hand: HandFull | undefined = await db.query.Hands.findFirst({
    orderBy: [desc(Hands.createdAt)],
    with: {
      players: {
        with: {
          cards: true,
        },
      },
      actions: {
        orderBy: [asc(Actions.street), asc(Actions.sequence)],
      },
      communityCards: true,
    },
  });
  return hand;
}
