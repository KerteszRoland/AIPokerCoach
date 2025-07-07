# Schedule

## Week 1.

- [ ] Plan the overview of the project (README.md)
- [ ] Gather requirements (features, constraints)
- [ ] Plan User interface (wireframes)
- [ ] Plan week schedule (this file)
- [ ] Choose the tech stack

### Deliverables:

- README.md
- UI Wireframes
- Week schedule
- Tech stack

## Week 2.

- [ ] Setup Rust project (watch hand logs, parse them, upload to nextjs backend endpoint)
- [ ] Setup Next.js project (backend, frontend, sockets)
- [ ] Setup SQLite database & schema

### Deliverables:

- Shows preflop charts on frontend (select position,toggle between RFI, Facing RFI, 3bet)
- Auto update preflop charts when round ends (via websockets)

## Week 3.

- [ ] Implement Database schema, implement access from Next.js backend

### Deliverables:

- Generate preflop charts based on hand history (from database)
- Implement review poker table
- Implement visual effects (chips, cards, pot, stb)

## Week 4.

- [ ] Implement hand upload API with authentication
- [ ] Create hand storage and validation in backend
- [ ] Implement real-time WebSocket notifications for new hands
- [ ] Add position detection and auto-chart updates

### Deliverables:

- Complete data flow from PokerStars → Rust client → Next.js backend
- Real-time position updates and chart switching
- Hand history stored in database with proper validation

## Week 5.

- [ ] Implement preflop action analysis (compare user actions to charts)
- [ ] Add bet sizing analysis for preflop raises/calls
- [ ] Create range visualization components
- [ ] Implement community card analysis and range updating
- [ ] Build hand review interface (street by street analysis)

### Deliverables:

- Previous hand analysis showing preflop chart compliance
- Visual range representation with community card interactions
- Basic hand review page with action-by-action breakdown

## Week 6.

- [ ] Integrate Gemini AI for hand analysis summaries
- [ ] Implement session-level analysis and reporting
- [ ] Create mistake categorization and tracking system
- [ ] Add BB win/loss calculations and statistics
- [ ] Build custom preflop chart generation from user's hand history

### Deliverables:

- AI-powered hand and session summaries
- Personalized preflop charts based on user's play history
- Comprehensive statistics dashboard (BB won/lost, mistake frequency)

## Week 7.

- [ ] Implement repeated mistake detection and analysis
- [ ] Create session review page with AI insights
- [ ] Add mistake trend tracking over time
- [ ] Implement chart comparison (user vs standard charts)
- [ ] Build notification system for common mistakes

### Deliverables:

- AI analysis of repeated mistakes with actionable insights
- Complete session review functionality

## Week 8.

- [ ] Polish UI/UX and add visual effects (chips, cards, pot animations)
- [ ] Implement comprehensive testing (unit, integration, E2E)
- [ ] Add error handling and edge case management
- [ ] Create user onboarding and documentation
- [ ] Prepare for deployment and production setup

### Deliverables:

- Production-ready application with polished interface
- Complete test coverage and documentation
- Deployed application ready for beta testing
