import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const Hands = sqliteTable("hands", {
  id: text("id").primaryKey(), // UUID as text
  pokerClientHandId: text("poker_client_hand_id"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  tableName: text("table_name").notNull(),
  smallBlind: real("small_blind").notNull(),
  maxPlayers: integer("max_players").notNull(),
  dealerSeat: integer("dealer_seat").notNull(),
  totalPot: real("total_pot").notNull(),
  mainPot: real("main_pot").notNull(),
  sidePot: real("side_pot").notNull().default(0),
  sidePot2: real("side_pot2").notNull().default(0),
  rake: real("rake").notNull(),
  createdAt: text("created_at").notNull(),
});

export const HandPlayers = sqliteTable(
  "hand_players",
  {
    id: text("id").primaryKey(), // UUID as text
    handId: text("hand_id")
      .notNull()
      .references(() => Hands.id, { onDelete: "cascade" }),
    seat: integer("seat").notNull(),
    position: text("position"),
    name: text("name").notNull(),
    chips: real("chips").notNull(),
    chipsAfterHand: real("chips_after_hand").notNull(),
    isSittingOut: integer("is_sitting_out", { mode: "boolean" })
      .notNull()
      .default(false),
    isHero: integer("is_hero", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [index("hand_players_hand_id_idx").on(table.handId)]
);

export const HandPlayerCards = sqliteTable("hand_player_cards", {
  handPlayerId: text("hand_player_id")
    .primaryKey()
    .references(() => HandPlayers.id, { onDelete: "cascade" }),
  card1: text("card1").notNull(),
  card2: text("card2").notNull(),
});

export const CommunityCards = sqliteTable("community_cards", {
  handId: text("hand_id")
    .primaryKey()
    .references(() => Hands.id, { onDelete: "cascade" }),
  flop1: text("flop1"),
  flop2: text("flop2"),
  flop3: text("flop3"),
  turn: text("turn"),
  river: text("river"),
});

export const Actions = sqliteTable(
  "actions",
  {
    id: text("id").primaryKey(), // UUID as text
    handId: text("hand_id")
      .notNull()
      .references(() => Hands.id, { onDelete: "cascade" }),
    street: integer("street").notNull(), // 0=pre,1=preflop,2=flop,3=turn,4=river,5=showdown (note: you had river=3, but probably typo; adjust as needed)
    sequence: integer("sequence").notNull(),
    name: text("name").notNull(),
    amount: real("amount"),
    amount2: real("amount2"),
    card1: text("card1"),
    card2: text("card2"),
    text: text("text"),
    handPlayerId: text("hand_player_id")
      .notNull()
      .references(() => HandPlayers.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("actions_hand_id_idx").on(table.handId),
    index("actions_street_idx").on(table.street),
  ]
);

export const RangeCharts = sqliteTable("range_charts", {
  id: text("id").primaryKey(), // UUID as text
  type: text("type").notNull(), // (rfi, frfi, 3bet)
  forPosition: text("for_position").notNull(), // (BTN, UTG)
  againstPosition: text("against_position"), // (BTN, UTG)
});

export const RangeChartHands = sqliteTable("range_chart_hands", {
  id: text("id").primaryKey(), // UUID as text
  rangeChartId: text("range_chart_id")
    .notNull()
    .references(() => RangeCharts.id, { onDelete: "cascade" }),
  hand: text("hand").notNull(), // (AKs)
  action: text("action").notNull(), // (raise, call, 3-bet, 4-bet)
});

// Relations ////////////////////////////////////////////////////////////////

export const handsRelations = relations(Hands, ({ many, one }) => ({
  players: many(HandPlayers),
  actions: many(Actions),
  communityCards: one(CommunityCards, {
    fields: [Hands.id],
    references: [CommunityCards.handId],
  }),
}));

export const handPlayersRelations = relations(HandPlayers, ({ one, many }) => ({
  hand: one(Hands, {
    fields: [HandPlayers.handId],
    references: [Hands.id],
  }),
  cards: one(HandPlayerCards, {
    fields: [HandPlayers.id],
    references: [HandPlayerCards.handPlayerId],
  }),
  actions: many(Actions), // Players can have many actions
}));

export const handPlayerCardsRelations = relations(
  HandPlayerCards,
  ({ one }) => ({
    player: one(HandPlayers, {
      fields: [HandPlayerCards.handPlayerId],
      references: [HandPlayers.id],
    }),
  })
);

export const communityCardsRelations = relations(CommunityCards, ({ one }) => ({
  hand: one(Hands, {
    fields: [CommunityCards.handId],
    references: [Hands.id],
  }),
}));

export const actionsRelations = relations(Actions, ({ one }) => ({
  hand: one(Hands, {
    fields: [Actions.handId],
    references: [Hands.id],
  }),
  player: one(HandPlayers, {
    fields: [Actions.handPlayerId],
    references: [HandPlayers.id],
  }),
}));

export const RangeChartRelations = relations(RangeCharts, ({ many }) => ({
  hands: many(RangeChartHands),
}));

export const RangeChartHandRelations = relations(
  RangeChartHands,
  ({ one }) => ({
    chart: one(RangeCharts, {
      fields: [RangeChartHands.rangeChartId],
      references: [RangeCharts.id],
    }),
  })
);
