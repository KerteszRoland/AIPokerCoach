import {
  pgTable,
  text,
  integer,
  doublePrecision,
  index,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const projectPrefix = "ai_poker_coach_";

export const positionEnum = pgEnum(`position_enum`, [
  "BTN",
  "SB",
  "BB",
  "UTG",
  "UTG1",
  "UTG2",
  "LJ",
  "HJ",
  "CO",
]);

export const actionNameEnum = pgEnum(`action_name_enum`, [
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
]);

export const chartTypeEnum = pgEnum(`chart_type_enum`, [
  "rfi",
  "frfi",
  "3-bet",
]);

export const chartActionEnum = pgEnum(`chart_action_enum`, [
  "raise",
  "call",
  "3-bet",
  "4-bet",
]);

export const cardEnum = pgEnum(`card_enum`, [
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
]);

export const chartHandEnum = pgEnum(`chart_hand_enum`, [
  "AA",
  "AKs",
  "AQs",
  "AJs",
  "ATs",
  "A9s",
  "A8s",
  "A7s",
  "A6s",
  "A5s",
  "A4s",
  "A3s",
  "A2s",
  "AKo",
  "KK",
  "KQs",
  "KJs",
  "KTs",
  "K9s",
  "K8s",
  "K7s",
  "K6s",
  "K5s",
  "K4s",
  "K3s",
  "K2s",
  "AQo",
  "KQo",
  "QQ",
  "QJs",
  "QTs",
  "Q9s",
  "Q8s",
  "Q7s",
  "Q6s",
  "Q5s",
  "Q4s",
  "Q3s",
  "Q2s",
  "AJo",
  "KJo",
  "QJo",
  "JJ",
  "JTs",
  "J9s",
  "J8s",
  "J7s",
  "J6s",
  "J5s",
  "J4s",
  "J3s",
  "J2s",
  "ATo",
  "KTo",
  "QTo",
  "JTo",
  "TT",
  "T9s",
  "T8s",
  "T7s",
  "T6s",
  "T5s",
  "T4s",
  "T3s",
  "T2s",
  "A9o",
  "K9o",
  "Q9o",
  "J9o",
  "T9o",
  "99",
  "98s",
  "97s",
  "96s",
  "95s",
  "94s",
  "93s",
  "92s",
  "A8o",
  "K8o",
  "Q8o",
  "J8o",
  "T8o",
  "98o",
  "88",
  "87s",
  "86s",
  "85s",
  "84s",
  "83s",
  "82s",
  "A7o",
  "K7o",
  "Q7o",
  "J7o",
  "T7o",
  "97o",
  "87o",
  "77",
  "76s",
  "75s",
  "74s",
  "73s",
  "72s",
  "A6o",
  "K6o",
  "Q6o",
  "J6o",
  "T6o",
  "96o",
  "86o",
  "76o",
  "66",
  "65s",
  "64s",
  "63s",
  "62s",
  "A5o",
  "K5o",
  "Q5o",
  "J5o",
  "T5o",
  "95o",
  "85o",
  "75o",
  "65o",
  "55",
  "54s",
  "53s",
  "52s",
  "A4o",
  "K4o",
  "Q4o",
  "J4o",
  "T4o",
  "94o",
  "84o",
  "74o",
  "64o",
  "54o",
  "44",
  "43s",
  "42s",
  "A3o",
  "K3o",
  "Q3o",
  "J3o",
  "T3o",
  "93o",
  "83o",
  "73o",
  "63o",
  "53o",
  "43o",
  "33",
  "32s",
  "A2o",
  "K2o",
  "Q2o",
  "J2o",
  "T2o",
  "92o",
  "82o",
  "72o",
  "62o",
  "52o",
  "42o",
  "32o",
  "22",
]);

export const Hands = pgTable(`${projectPrefix}hands`, {
  id: text("id").primaryKey(), // UUID as text
  pokerClientHandId: text("poker_client_hand_id"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  tableName: text("table_name").notNull(),
  smallBlind: doublePrecision("small_blind").notNull(),
  maxPlayers: integer("max_players").notNull(),
  dealerSeat: integer("dealer_seat").notNull(),
  totalPot: doublePrecision("total_pot").notNull(),
  mainPot: doublePrecision("main_pot").notNull(),
  sidePot: doublePrecision("side_pot").notNull().default(0),
  sidePot2: doublePrecision("side_pot2").notNull().default(0),
  rake: doublePrecision("rake").notNull(),
  createdAt: text("created_at").notNull(),
});

export const HandPlayers = pgTable(
  `${projectPrefix}hand_players`,
  {
    id: text("id").primaryKey(), // UUID as text
    handId: text("hand_id")
      .notNull()
      .references(() => Hands.id, { onDelete: "cascade" }),
    seat: integer("seat").notNull(),
    position: positionEnum("position"),
    name: text("name").notNull(),
    chips: doublePrecision("chips").notNull(),
    chipsAfterHand: doublePrecision("chips_after_hand").notNull(),
    isSittingOut: boolean("is_sitting_out").notNull().default(false),
    isHero: boolean("is_hero").notNull().default(false),
  },
  (table) => [index("hand_players_hand_id_idx").on(table.handId)]
);

export const HandPlayerCards = pgTable(`${projectPrefix}hand_player_cards`, {
  handPlayerId: text("hand_player_id")
    .primaryKey()
    .references(() => HandPlayers.id, { onDelete: "cascade" }),
  card1: cardEnum("card1").notNull(),
  card2: cardEnum("card2").notNull(),
});

export const CommunityCards = pgTable(`${projectPrefix}community_cards`, {
  handId: text("hand_id")
    .primaryKey()
    .references(() => Hands.id, { onDelete: "cascade" }),
  flop1: cardEnum("flop1"),
  flop2: cardEnum("flop2"),
  flop3: cardEnum("flop3"),
  turn: cardEnum("turn"),
  river: cardEnum("river"),
});

export const Actions = pgTable(
  `${projectPrefix}actions`,
  {
    id: text("id").primaryKey(), // UUID as text
    handId: text("hand_id")
      .notNull()
      .references(() => Hands.id, { onDelete: "cascade" }),
    street: integer("street").notNull(),
    sequence: integer("sequence").notNull(),
    name: actionNameEnum("name").notNull(),
    amount: doublePrecision("amount"),
    amount2: doublePrecision("amount2"),
    card1: cardEnum("card1"),
    card2: cardEnum("card2"),
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

export const RangeCharts = pgTable(`${projectPrefix}range_charts`, {
  id: text("id").primaryKey(), // UUID as text
  type: chartTypeEnum("type").notNull(),
  forPosition: positionEnum("for_position").notNull(),
  againstPosition: positionEnum("against_position"),
});

export const RangeChartHands = pgTable(`${projectPrefix}range_chart_hands`, {
  id: text("id").primaryKey(), // UUID as text
  rangeChartId: text("range_chart_id")
    .notNull()
    .references(() => RangeCharts.id, { onDelete: "cascade" }),
  hand: chartHandEnum("hand").notNull(), // (AKs)
  action: chartActionEnum("action").notNull(),
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
