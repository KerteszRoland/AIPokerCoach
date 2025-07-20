CREATE TYPE "public"."action_name_enum" AS ENUM('PostSmallBlind', 'PostBigBlind', 'SitsOut', 'Fold', 'Call', 'Raise', 'Check', 'Bet', 'BetAndAllIn', 'CallAndAllIn', 'RaiseAndAllIn', 'Muck', 'Shows', 'Collected', 'CashedOut', 'TimedOut', 'UncalledBet', 'DoesNotShow', 'Join', 'Leave', 'Disconnected', 'Connected', 'CollectedFromSidePot', 'CollectedFromMainPot');--> statement-breakpoint
CREATE TYPE "public"."card_enum" AS ENUM('2s', '2h', '2d', '2c', '3s', '3h', '3d', '3c', '4s', '4h', '4d', '4c', '5s', '5h', '5d', '5c', '6s', '6h', '6d', '6c', '7s', '7h', '7d', '7c', '8s', '8h', '8d', '8c', '9s', '9h', '9d', '9c', 'Ts', 'Th', 'Td', 'Tc', 'Js', 'Jh', 'Jd', 'Jc', 'Qs', 'Qh', 'Qd', 'Qc', 'Ks', 'Kh', 'Kd', 'Kc', 'As', 'Ah', 'Ad', 'Ac');--> statement-breakpoint
CREATE TYPE "public"."chart_action_enum" AS ENUM('raise', 'call', '3-bet', '4-bet');--> statement-breakpoint
CREATE TYPE "public"."chart_hand_enum" AS ENUM('AA', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'KK', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'AQo', 'KQo', 'QQ', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'AJo', 'KJo', 'QJo', 'JJ', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'ATo', 'KTo', 'QTo', 'JTo', 'TT', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', 'A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '99', '98s', '97s', '96s', '95s', '94s', '93s', '92s', 'A8o', 'K8o', 'Q8o', 'J8o', 'T8o', '98o', '88', '87s', '86s', '85s', '84s', '83s', '82s', 'A7o', 'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o', '77', '76s', '75s', '74s', '73s', '72s', 'A6o', 'K6o', 'Q6o', 'J6o', 'T6o', '96o', '86o', '76o', '66', '65s', '64s', '63s', '62s', 'A5o', 'K5o', 'Q5o', 'J5o', 'T5o', '95o', '85o', '75o', '65o', '55', '54s', '53s', '52s', 'A4o', 'K4o', 'Q4o', 'J4o', 'T4o', '94o', '84o', '74o', '64o', '54o', '44', '43s', '42s', 'A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '93o', '83o', '73o', '63o', '53o', '43o', '33', '32s', 'A2o', 'K2o', 'Q2o', 'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o', '22');--> statement-breakpoint
CREATE TYPE "public"."chart_type_enum" AS ENUM('rfi', 'frfi', '3-bet');--> statement-breakpoint
CREATE TYPE "public"."position_enum" AS ENUM('BTN', 'SB', 'BB', 'UTG', 'UTG1', 'UTG2', 'LJ', 'HJ', 'CO');--> statement-breakpoint
CREATE TABLE "ai_poker_coach_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"hand_id" text NOT NULL,
	"street" integer NOT NULL,
	"sequence" integer NOT NULL,
	"name" "action_name_enum" NOT NULL,
	"amount" double precision,
	"amount2" double precision,
	"card1" "card_enum",
	"card2" "card_enum",
	"text" text,
	"hand_player_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_community_cards" (
	"hand_id" text PRIMARY KEY NOT NULL,
	"flop1" "card_enum",
	"flop2" "card_enum",
	"flop3" "card_enum",
	"turn" "card_enum",
	"river" "card_enum"
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_hand_player_cards" (
	"hand_player_id" text PRIMARY KEY NOT NULL,
	"card1" "card_enum" NOT NULL,
	"card2" "card_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_hand_players" (
	"id" text PRIMARY KEY NOT NULL,
	"hand_id" text NOT NULL,
	"seat" integer NOT NULL,
	"position" "position_enum",
	"name" text NOT NULL,
	"chips" double precision NOT NULL,
	"chips_after_hand" double precision NOT NULL,
	"is_sitting_out" boolean DEFAULT false NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_hands" (
	"id" text PRIMARY KEY NOT NULL,
	"poker_client_hand_id" text,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"table_name" text NOT NULL,
	"small_blind" double precision NOT NULL,
	"max_players" integer NOT NULL,
	"dealer_seat" integer NOT NULL,
	"total_pot" double precision NOT NULL,
	"main_pot" double precision NOT NULL,
	"side_pot" double precision DEFAULT 0 NOT NULL,
	"side_pot2" double precision DEFAULT 0 NOT NULL,
	"rake" double precision NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_range_chart_hands" (
	"id" text PRIMARY KEY NOT NULL,
	"range_chart_id" text NOT NULL,
	"hand" chart_hand_enum NOT NULL,
	"action" chart_action_enum NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_poker_coach_range_charts" (
	"id" text PRIMARY KEY NOT NULL,
	"type" chart_type_enum NOT NULL,
	"for_position" "position_enum" NOT NULL,
	"against_position" "position_enum"
);
--> statement-breakpoint
ALTER TABLE "ai_poker_coach_actions" ADD CONSTRAINT "ai_poker_coach_actions_hand_id_ai_poker_coach_hands_id_fk" FOREIGN KEY ("hand_id") REFERENCES "public"."ai_poker_coach_hands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_poker_coach_actions" ADD CONSTRAINT "ai_poker_coach_actions_hand_player_id_ai_poker_coach_hand_players_id_fk" FOREIGN KEY ("hand_player_id") REFERENCES "public"."ai_poker_coach_hand_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_poker_coach_community_cards" ADD CONSTRAINT "ai_poker_coach_community_cards_hand_id_ai_poker_coach_hands_id_fk" FOREIGN KEY ("hand_id") REFERENCES "public"."ai_poker_coach_hands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_poker_coach_hand_player_cards" ADD CONSTRAINT "ai_poker_coach_hand_player_cards_hand_player_id_ai_poker_coach_hand_players_id_fk" FOREIGN KEY ("hand_player_id") REFERENCES "public"."ai_poker_coach_hand_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_poker_coach_hand_players" ADD CONSTRAINT "ai_poker_coach_hand_players_hand_id_ai_poker_coach_hands_id_fk" FOREIGN KEY ("hand_id") REFERENCES "public"."ai_poker_coach_hands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_poker_coach_range_chart_hands" ADD CONSTRAINT "ai_poker_coach_range_chart_hands_range_chart_id_ai_poker_coach_range_charts_id_fk" FOREIGN KEY ("range_chart_id") REFERENCES "public"."ai_poker_coach_range_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actions_hand_id_idx" ON "ai_poker_coach_actions" USING btree ("hand_id");--> statement-breakpoint
CREATE INDEX "actions_street_idx" ON "ai_poker_coach_actions" USING btree ("street");--> statement-breakpoint
CREATE INDEX "hand_players_hand_id_idx" ON "ai_poker_coach_hand_players" USING btree ("hand_id");