# AIPokerCoach

Goal: help novice poker players improve who already know the rules and general concepts at micro stakes
(rules, hands, positions)

## Constraints:

- Works only with PokerStars
- Cash Game only

## Features:

- Provide preflop charts based on position (toggle between RFI, Facing RFI, 3bet)
- Auto update position (thus charts) when round ends, so you always see the chart you need to look at
- Analyze previous hand:
  - Did you followed the preflop chart action (raise, fold, call, limp, 3bet, 4bet)?
  - Did you raise/call an appropriate amount preflop?
  - Visualize Your and opponents ranges (highlights what connects with community cards, automatically gray out options that are less likely based on betting)
  - Analyze each street actions you took
  - How much did you lose/win (in BBs)
- Generates your own preflop charts based on your hand history (compare to "standard" chart)
- AI analyzes your repeated mistakes that came up a lot

## Tech stack:

- Rust client that scrapes PokerStars hand history and uploads it to server
- Next.js frontend/backend that displays the analysis, updates the charts via sockets.
- Gemini for AI text analysis summary (previous hand, session, repeated mistakes)
- SQLlite database on server for storage (hands, charts, etc)

## Data Flow Summary

1. Play: User plays a hand on PokerStars.
2. Write: PokerStars client writes the hand history to a local text file.
3. Detect & Parse: The Rust client detects the file change, parses the new hand into a structured format (JSON).
4. Upload: The Rust client POSTs the JSON data with an API key to the Next.js backend.
5. Store & Analyze: The backend validates the data, stores it in PostgreSQL, and runs its own deterministic analysis logic.
6. Notify: The backend pushes a "new hand" event via WebSockets.
7. Update: The Next.js frontend, listening to the WebSocket, receives the event and updates the UI (e.g., a notification pops up, updates the charts).
8. Review: The user navigates to the session review page. The frontend calls the backend API, which may in turn call the Gemini API to generate a qualitative summary of the aggregated mistakes.
