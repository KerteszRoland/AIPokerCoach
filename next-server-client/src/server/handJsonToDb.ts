import db from "./db";
import {
  Hands,
  HandPlayers,
  CommunityCards,
  Actions,
  HandPlayerCards,
} from "../db/schema";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function handJsonToDb(hand: any) {
  const handId = crypto.randomUUID();
  await db.insert(Hands).values({
    id: handId,
    pokerClientHandId: hand.id,
    date: hand.date,
    time: hand.time,
    tableName: hand.table_name,
    smallBlind: hand.small_blind,
    maxPlayers: hand.max_players,
    dealerSeat: hand.dealer_seat,
    totalPot: hand.total_pot,
    mainPot: hand.main_pot,
    sidePot: hand.side_pot,
    sidePot2: hand.side_pot2,
    rake: hand.rake,
    createdAt: new Date().toISOString(),
  });

  const nameToPlayerId = new Map();
  const cardsMap = new Map();

  if (hand.hero_name && hand.hero_cards && hand.hero_cards.length === 2) {
    cardsMap.set(hand.hero_name, hand.hero_cards);
  }

  for (const player of hand.players) {
    const playerId = crypto.randomUUID();
    const isHero = player.name === hand.hero_name;
    await db.insert(HandPlayers).values({
      id: playerId,
      handId: handId,
      seat: player.seat,
      position: player.position,
      name: player.name,
      chips: player.chips,
      chipsAfterHand: player.chips_after_hand,
      isSittingOut: player.is_sitting_out,
      isHero: isHero,
    });
    nameToPlayerId.set(player.name, playerId);
  }

  if (
    hand.community_cards &&
    Array.isArray(hand.community_cards) &&
    hand.community_cards.length > 0
  ) {
    await db.insert(CommunityCards).values({
      handId: handId,
      flop1: hand.community_cards[0] ?? null,
      flop2: hand.community_cards[1] ?? null,
      flop3: hand.community_cards[2] ?? null,
      turn: hand.community_cards[3] ?? null,
      river: hand.community_cards[4] ?? null,
    });
  }

  const streetActions = [
    { street: 0, actions: hand.pre_actions || [] },
    { street: 1, actions: hand.preflop_actions || [] },
    { street: 2, actions: hand.flop_actions || [] },
    { street: 3, actions: hand.turn_actions || [] },
    { street: 4, actions: hand.river_actions || [] },
    { street: 5, actions: hand.show_down_actions || [] },
  ];

  for (const sa of streetActions) {
    for (let seq = 0; seq < sa.actions.length; seq++) {
      const act = sa.actions[seq];
      const playerId = nameToPlayerId.get(act.player_name);
      if (!playerId) continue; // Skip if player not found
      const actionId = crypto.randomUUID();
      const amount = act.action.amount ?? null;
      const amount2 = act.action.to ?? null;
      const text = act.action.desc ?? null;
      const card1 = act.action.cards?.[0] ?? null;
      const card2 = act.action.cards?.[1] ?? null;

      if (
        sa.street === 5 &&
        act.action.type === "Shows" &&
        act.action.cards &&
        act.action.cards.length === 2
      ) {
        cardsMap.set(act.player_name, act.action.cards);
      }

      await db.insert(Actions).values({
        id: actionId,
        handId: handId,
        street: sa.street,
        sequence: seq,
        name: act.action.type,
        amount,
        amount2,
        card1,
        card2,
        text: text,
        handPlayerId: playerId,
      });
    }
  }

  for (const [name, cards] of cardsMap) {
    const playerId = nameToPlayerId.get(name);
    if (playerId) {
      await db.insert(HandPlayerCards).values({
        handPlayerId: playerId,
        card1: cards[0],
        card2: cards[1],
      });
    }
  }
}
