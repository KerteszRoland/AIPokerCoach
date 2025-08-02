![Rust CI/CD](https://github.com/KerteszRoland/AIPokerCoach/actions/workflows/release.yml/badge.svg)

<br>
<div align="center">
  <img src="./RustHandScraper/src/assets/icon_running.png" width="128" height="128" alt="AI Poker Coach">
  <h1>AI Poker Coach</h1>
</div>

Goal: help novice poker players improve who already know the rules and general concepts at micro stakes
(rules, hands, positions)

## Constraints:

- Works only with PokerStars
- Cash Game only

## Features:

- Provide preflop charts based on position (toggle between RFI, Facing RFI, 3bet)
- Analyze previous hand after the session:
  - Did you followed the preflop chart action (raise, fold, call, limp, 3bet, 4bet)?
  - Did you raise/call an appropriate amount preflop?
  - Visualize Your and opponents ranges (highlights what connects with community cards, automatically gray out options that are less likely based on betting)
  - Analyze each street actions you took
  - How much did you lose/win (in BBs)
- Generates your own preflop charts based on your hand history (compare to "standard" chart)
- AI analyzes your repeated mistakes that came up a lot

## Wireframe design

![Poker UI Design](pokeraiUI.png)

## Tech stack:

- Rust client that scrapes PokerStars hand history and uploads it to server
- Next.js frontend/backend that displays the analysis, updates the charts via sockets.
- Gemini for AI text analysis summary (previous hand, session, repeated mistakes)
- Postgres database via DrizzleORM on server for storage (hands, charts, etc)

## Data Flow Summary

1. Play: User plays a hand on PokerStars.
2. Write: PokerStars client writes the hand history to a local text file.
3. Detect & Parse: The Rust client detects the file change, parses the new hand into a structured format (JSON).
4. Upload: The Rust client POSTs the JSON data with an API key to the Next.js backend.
5. Store & Analyze: The backend validates the data, stores it in PostgreSQL, and runs its own deterministic analysis logic.
6. Review: The user navigates to the session review page. The frontend calls the backend API, which may in turn call the Gemini API to generate a qualitative summary of the aggregated mistakes.

## Database schemas

### Hands

- id: UUID (pk)
- poker_client_hand_id: TEXT
- date: TEXT
- time: TEXT
- table_name: TEXT
- small_blind: REAL
- max_players: INTEGER
- dealer_seat: INTEGER
- players: populate from Table HandPlayers
- actions: populate from Table Actions
- community_cards: populate from CommunityCards
- total_pot: REAL
- main_pot: REAL
- side_pot: REAL
- side_pot2: REAL
- rake: REAL
- created_at: TEXT
- user_id: UUID (fk)

### HandPlayers

- id: UUID (pk)
- hand_id: UUID (fk)
- seat: INTEGER
- position: TEXT
- name: TEXT
- chips: REAL
- is_sitting_out: BOOLEAN
- is_hero: BOOLEAN

### HandPlayerCards

- hand_player_id: UUID (pk, fk)
- card1: TEXT
- card2: TEXT

### CommunityCards

- hand_id: UUID (pk, fk)
- flop1: TEXT
- flop2: TEXT
- flop3: TEXT
- turn: TEXT
- river: TEXT

### Actions

- id: UUID (pk)
- hand_id: UUID (fk)
- street: INTEGER // (pre=0, preflop=1, flop=2, turn=3, river=3, showdown=4)
- sequence: INTEGER
- name: TEXT
- amount: REAL nullable
- amount2: REAL nullable // amount to when raising
- card1: TEXT
- card2: TEXT
- text: TEXT nullable // Showdown poker hand as string
- hand_player_id: UUID (fk)

### RangeChart

- id: UUID (pk)
- type: TEXT // (rfi, frfi, 3bet)
- for_position: TEXT // (BTN, UTG,...)
- against_position: TEXT nullable // (BTN, UTG,...)

### RangeChartHand

- id: UUID (pk)
- poker_hand_chart_id: UUID (fk)
- hand: TEXT // (AKs)
- action: TEXT // (raise, call, 3-bet, 4-bet)

### Users

- id: UUID (pk)
- google_id: TEXT
- created_at: TEXT
