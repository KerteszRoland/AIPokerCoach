use std::fs;
use regex::Regex;
use reqwest;

#[derive(Debug, Clone)]
enum Position {
    BTN,
    SB,
    BB,
    UTG,
    UTG1,
    UTG2,
    LJ,
    HJ,
    CO,
}

impl Position {
    fn as_str(&self) -> &str {
        match self {
            Position::BTN => "BTN",
            Position::SB => "SB",
            Position::BB => "BB",
            Position::UTG => "UTG",
            Position::UTG1 => "UTG1",
            Position::UTG2 => "UTG2",
            Position::LJ => "LJ",
            Position::HJ => "HJ",
            Position::CO => "CO",
        }
    }

    fn from_index(index: usize) -> Position {
        match index {
            0 => Position::BTN,
            1 => Position::SB,
            2 => Position::BB,
            3 => Position::UTG,
            4 => Position::UTG1,
            5 => Position::UTG2,
            6 => Position::LJ,
            7 => Position::HJ,
            8 => Position::CO,
            _ => panic!("Invalid index: {}", index),
        }
    }

    fn to_json(&self) -> String {
        format!("\"{}\"", self.as_str())
    }
}

#[derive(Debug, Clone)]
struct Player {
    seat: u32,
    position: Option<Position>,
    name: String,
    chips: f32,
    is_sitting_out: bool,
}

impl Player {
    fn print(&self) {
        let position_str = if self.position.is_some() { format!("({}) ", self.position.as_ref().unwrap().as_str()) } else { "".to_string() };
        println!("  Seat {}: {}{} (${:.2}) {}", self.seat, position_str, self.name, self.chips, if self.is_sitting_out { "- sitting out" } else { "" });
    }

    fn to_json(&self) -> String {
        format!(
            "{{\"seat\":{},\"position\":{},\"name\":\"{}\",\"chips\":{},\"is_sitting_out\":{}}}",
            self.seat,
            match &self.position {
                Some(pos) => pos.to_json(),
                None => "null".to_string(),
            },
            self.name.replace("\"", "\\\""),
            self.chips,
            self.is_sitting_out
        )
    }
}

#[derive(Debug, Clone)]
enum Action {
    PostSmallBlind(f32),
    PostBigBlind(f32),
    SitsOut,
    Fold,
    Call(f32),
    Raise(f32,f32),
    Check,
    Bet(f32),
    BetAndAllIn(f32),
    CallAndAllIn(f32),
    RaiseAndAllIn(f32,f32),
    Muck,
    Shows(Vec<String>, String),
    Collected(f32),
    CashedOut(f32, f32),
    TimedOut,
    UncalledBet(f32),
    DoesNotShow,
    Join,
    Leave,
    Disconnected,
    Connected,
    CollectedFromSidePot(f32),
    CollectedFromMainPot(f32),
}

struct ActionToParse {
    re: Regex,
    action_type: fn(caps: regex::Captures<'_>) -> Action,
}   

#[derive(Debug, Clone)]
struct PlayerAction {
    player_name: String,
    action: Action,
}

impl PlayerAction {
    fn from_str(line: &str) -> Option<Self> {
        let actions_to_parse = vec![
            ActionToParse {
                re: Regex::new(r"(.+?): folds").unwrap(),
                action_type: |caps| Action::Fold
            },
            ActionToParse {
                re: Regex::new(r"(.+?): checks").unwrap(), 
                action_type: |caps| Action::Check
            },
            ActionToParse {
                re: Regex::new(r"(.+?): bets \$([0-9.]+)").unwrap(),
                action_type: |caps| Action::Bet(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): calls \$([0-9.]+)").unwrap(),
                action_type: |caps| Action::Call(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): raises \$([0-9.]+) to \$([0-9.]+)").unwrap(),
                action_type: |caps| Action::Raise(caps.get(2).unwrap().as_str().parse::<f32>().unwrap(), caps.get(3).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): bets \$([0-9.]+) and is all-in").unwrap(),
                action_type: |caps| Action::BetAndAllIn(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): calls \$([0-9.]+) and is all-in").unwrap(),
                action_type: |caps| Action::CallAndAllIn(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): raises \$([0-9.]+) to \$([0-9.]+) and is all-in").unwrap(),
                action_type: |caps| Action::RaiseAndAllIn(caps.get(2).unwrap().as_str().parse::<f32>().unwrap(), caps.get(3).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): shows \[([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs])\] \((.+?)\)").unwrap(),
                action_type: |caps| Action::Shows(vec![caps.get(2).unwrap().as_str().to_string(), caps.get(3).unwrap().as_str().to_string()], caps.get(4).unwrap().as_str().to_string())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): mucks hand").unwrap(),
                action_type: |caps| Action::Muck
            },
            ActionToParse {
                re: Regex::new(r"(.+?) collected \$([0-9.]+) from pot").unwrap(),
                action_type: |caps| Action::Collected(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?) cashed out the hand for \$([0-9.]+)(?:\s+\| Cash Out Fee \$([0-9.]+))?").unwrap(),
                action_type: |caps| Action::CashedOut(
                    caps.get(2).unwrap().as_str().parse::<f32>().unwrap(),
                    caps.get(3).map_or(0.0, |m| m.as_str().parse::<f32>().unwrap())
                )
            },
            ActionToParse {
                re: Regex::new(r"(.+?) has timed out").unwrap(),
                action_type: |caps| Action::TimedOut
            },
            ActionToParse {
                re: Regex::new(r"Uncalled bet \(\$([0-9.]+)\) returned to (.+?)").unwrap(),
                action_type: |caps| Action::UncalledBet(caps.get(1).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?): doesn't show hand").unwrap(),
                action_type: |caps| Action::DoesNotShow
            },
            ActionToParse {
                re: Regex::new(r"(.+?) joins the table").unwrap(),
                action_type: |caps| Action::Join
            },
            ActionToParse {
                re: Regex::new(r"(.+?) leaves the table").unwrap(),
                action_type: |caps| Action::Leave
            },
            ActionToParse {
                re: Regex::new(r"(.+?) is disconnected").unwrap(),
                action_type: |caps| Action::Disconnected
            },
            ActionToParse {
                re: Regex::new(r"(.+?) is connected").unwrap(),
                action_type: |caps| Action::Connected
            },
            ActionToParse {
                re: Regex::new(r"(.+?) collected \$([0-9.]+) from side pot").unwrap(),
                action_type: |caps| Action::CollectedFromSidePot(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
            ActionToParse {
                re: Regex::new(r"(.+?) collected \$([0-9.]+) from main pot").unwrap(),
                action_type: |caps| Action::CollectedFromMainPot(caps.get(2).unwrap().as_str().parse::<f32>().unwrap())
            },
        ];

        for action_to_parse in actions_to_parse {
            if let Some(caps) = action_to_parse.re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();

                return Some(PlayerAction {
                    player_name,
                    action: (action_to_parse.action_type)(caps),
                });
            }
        };
        //println!("!!!!!!!!!!!!!Warning: Could not parse action from line: {}", line);
        panic!("!!!!!!!!!!!!!Warning: Could not parse action from line: {}", line);
        None
    }
    fn print(&self) {
        match &self.action {
            Action::PostSmallBlind(amount) => {
                println!("{}: posts small blind ${:.2}", self.player_name, amount);
            },
            Action::PostBigBlind(amount) => {
                println!("{}: posts big blind ${:.2}", self.player_name, amount);
            },
            Action::SitsOut => {
                println!("{}: sits out", self.player_name);
            },
            Action::Fold => {
                println!("{}: folds", self.player_name);
            },
            Action::Call(amount) => {
                println!("{}: calls ${:.2}", self.player_name, amount);
            },
            Action::Raise(amount, amount_to) => {
                println!("{}: raises ${:.2} to ${:.2}", self.player_name, amount, amount_to);
            },
            Action::Check => {
                println!("{}: checks", self.player_name);
            },
            Action::Bet(amount) => {
                println!("{}: bets ${:.2}", self.player_name, amount);
            },
            Action::BetAndAllIn(amount) => {
                println!("{}: bets ${:.2} and is all-in", self.player_name, amount);
            },
            Action::CallAndAllIn(amount) => {
                println!("{}: calls ${:.2} and is all-in", self.player_name, amount);
            },
            Action::RaiseAndAllIn(amount, amount_to) => {
                println!("{}: raises ${:.2} to ${:.2} and is all-in", self.player_name, amount, amount_to);
            },
            Action::Muck => {
                println!("{}: mucks hand", self.player_name);
            },
            Action::Shows(cards, player_name) => {
                println!("{}: shows [{}] ({})", self.player_name, cards.join(" "), player_name);
            },
            Action::Collected(amount) => {
                println!("{} collected ${:.2} from pot", self.player_name, amount);
            },
            Action::CashedOut(amount, amount_to) => {
                println!("{} cashed out the hand for ${:.2} | Cash Out Fee ${:.2}", self.player_name, amount, amount_to);
            },
            Action::TimedOut => {
                println!("{} has timed out", self.player_name);
            },
            Action::UncalledBet(amount) => {
                println!("Uncalled bet (${:.2}) returned to {}", amount, self.player_name);
            },
            Action::DoesNotShow => {
                println!("{}: doesn't show hand", self.player_name);
            },
            Action::Join => {
                println!("{} joins the table", self.player_name);
            },
            Action::Leave => {
                println!("{} leaves the table", self.player_name);
            },
            Action::Disconnected => {
                println!("{} is disconnected", self.player_name);
            },
            Action::Connected => {
                println!("{} is connected", self.player_name);
            },
            Action::CollectedFromSidePot(amount) => {
                println!("{} collected ${:.2} from side pot", self.player_name, amount);
            },
            Action::CollectedFromMainPot(amount) => {
                println!("{} collected ${:.2} from main pot", self.player_name, amount);
            },
        }
    }

    fn to_json(&self) -> String {
        format!(
            "{{\"player_name\":\"{}\",\"action\":{}}}",
            self.player_name.replace("\"", "\\\""),
            self.action.to_json()
        )
    }
}

impl Action {
    fn to_json(&self) -> String {
        match self {
            Action::PostSmallBlind(a) => format!("{{\"type\":\"PostSmallBlind\",\"amount\":{}}}", a),
            Action::PostBigBlind(a) => format!("{{\"type\":\"PostBigBlind\",\"amount\":{}}}", a),
            Action::SitsOut => "{\"type\":\"SitsOut\"}".to_string(),
            Action::Fold => "{\"type\":\"Fold\"}".to_string(),
            Action::Call(a) => format!("{{\"type\":\"Call\",\"amount\":{}}}", a),
            Action::Raise(a, to) => format!("{{\"type\":\"Raise\",\"amount\":{},\"to\":{}}}", a, to),
            Action::Check => "{\"type\":\"Check\"}".to_string(),
            Action::Bet(a) => format!("{{\"type\":\"Bet\",\"amount\":{}}}", a),
            Action::BetAndAllIn(a) => format!("{{\"type\":\"BetAndAllIn\",\"amount\":{}}}", a),
            Action::CallAndAllIn(a) => format!("{{\"type\":\"CallAndAllIn\",\"amount\":{}}}", a),
            Action::RaiseAndAllIn(a, to) => format!("{{\"type\":\"RaiseAndAllIn\",\"amount\":{},\"to\":{}}}", a, to),
            Action::Muck => "{\"type\":\"Muck\"}".to_string(),
            Action::Shows(cards, desc) => format!("{{\"type\":\"Shows\",\"cards\":[{}],\"desc\":\"{}\"}}", cards.iter().map(|c| format!("\"{}\"", c)).collect::<Vec<_>>().join(","), desc.replace("\"", "\\\"")),
            Action::Collected(a) => format!("{{\"type\":\"Collected\",\"amount\":{}}}", a),
            Action::CashedOut(a, fee) => format!("{{\"type\":\"CashedOut\",\"amount\":{},\"fee\":{}}}", a, fee),
            Action::TimedOut => "{\"type\":\"TimedOut\"}".to_string(),
            Action::UncalledBet(a) => format!("{{\"type\":\"UncalledBet\",\"amount\":{}}}", a),
            Action::DoesNotShow => "{\"type\":\"DoesNotShow\"}".to_string(),
            Action::Join => "{\"type\":\"Join\"}".to_string(),
            Action::Leave => "{\"type\":\"Leave\"}".to_string(),
            Action::Disconnected => "{\"type\":\"Disconnected\"}".to_string(),
            Action::Connected => "{\"type\":\"Connected\"}".to_string(),
            Action::CollectedFromSidePot(a) => format!("{{\"type\":\"CollectedFromSidePot\",\"amount\":{}}}", a),
            Action::CollectedFromMainPot(a) => format!("{{\"type\":\"CollectedFromMainPot\",\"amount\":{}}}", a),
        }
    }
}

#[derive(Clone)]
struct Hand {
    id: String,
    date: String,
    time: String,
    table_name: String,
    small_blind: f32,
    max_players: u32,
    dealer_seat: u32,
    players: Vec<Player>,
    pre_actions: Vec<PlayerAction>,
    preflop_actions: Vec<PlayerAction>,
    flop_actions: Vec<PlayerAction>,
    turn_actions: Vec<PlayerAction>,
    river_actions: Vec<PlayerAction>,
    show_down_actions: Vec<PlayerAction>,
    player_cards: Vec<String>,
    player_name: String,
    community_cards: Vec<String>,
    total_pot: f32,
    main_pot: f32,
    side_pots: Vec<f32>,
    rake: f32,
}

impl Hand {
    fn from_str(hand_str: &str, player_name: &str) -> Self {
        println!("hand_str: {}", hand_str);
        let re = regex::Regex::new(r"PokerStars Hand #(\d+):\s+.+?\(\$(\d+\.\d+)\/\$(\d+\.\d+) USD\) - (\d{4}/\d{2}/\d{2} \d{1,2}:\d{2}:\d{2}) CET \[\d{4}/\d{2}/\d{2} \d{1,2}:\d{2}:\d{2} ET\]").unwrap();
        let re2 = regex::Regex::new(r"Table '(.+?)' (\d+)-max Seat #(\d+) is the button").unwrap();
        
        let caps = re.captures(hand_str).expect(&format!("Could not capture hand details from string: {}", hand_str));
        let caps2 = re2.captures(hand_str).unwrap();

        let hand_id = caps.get(1).unwrap().as_str().to_string();
        let small_blind = caps.get(2).unwrap().as_str().parse::<f32>().unwrap();
        let dealer_seat = caps2.get(3).unwrap().as_str().parse::<u32>().unwrap();
        let date = caps.get(4).unwrap().as_str().split(' ').nth(0).unwrap().to_string();
        let time = caps.get(4).unwrap().as_str().split(' ').nth(1).unwrap().to_string();
        let table_name = caps2.get(1).unwrap().as_str().to_string();
        let max_players = caps2.get(2).unwrap().as_str().parse::<u32>().unwrap();


        let mut preflop_actions: Vec<PlayerAction> = Vec::new();
        let mut flop_actions: Vec<PlayerAction> = Vec::new();
        let mut turn_actions: Vec<PlayerAction> = Vec::new(); 
        let mut river_actions: Vec<PlayerAction> = Vec::new();
        let mut show_down_actions: Vec<PlayerAction> = Vec::new();

        let base_str = hand_str.split("*** HOLE CARDS ***") // preflop, flop, turn, river, show down
        .nth(1)
        .unwrap()
        .split("*** SUMMARY ***")
        .nth(0)
        .unwrap();

        if base_str.contains("*** FLOP ***") {
            let preflop_str = base_str.split("*** FLOP ***")
            .nth(0)
            .unwrap();
            preflop_actions = Self::parse_preflop_actions(preflop_str);
        }

        if base_str.contains("*** FLOP ***") {
            let flop_str = base_str.split("*** FLOP ***")
            .nth(1)
            .unwrap()
            .split("*** TURN ***")
            .nth(0)
            .unwrap();
            flop_actions = Self::parse_flop_actions(flop_str);
        }

        if base_str.contains("*** TURN ***") {
            let turn_str = base_str.split("*** TURN ***")
            .nth(1)
            .unwrap()
            .split("*** RIVER ***")
            .nth(0)
            .unwrap();
            turn_actions = Self::parse_turn_actions(turn_str);
        }

        if base_str.contains("*** RIVER ***") {
            let river_str = base_str.split("*** RIVER ***")
            .nth(1)
            .unwrap()
            .split("*** SHOW DOWN ***")
            .nth(0)
            .unwrap();
            river_actions = Self::parse_river_actions(river_str);
        }

        if base_str.contains("*** SHOW DOWN ***") {
            let show_down_str = base_str.split("*** SHOW DOWN ***")
            .nth(1)
            .unwrap();
            show_down_actions = Self::parse_show_down_actions(show_down_str);
        }

        let players = Self::parse_players(hand_str, dealer_seat);
        let pre_actions = Self::parse_pre_actions(hand_str);
        let player_cards = Self::parse_player_cards(hand_str);
       
        let community_cards = Self::parse_community_cards(hand_str);
        let (total_pot, main_pot, side_pots, rake) = Self::parse_pot_and_rake(hand_str);

        Hand {
            id: hand_id,
            small_blind,
            date,
            time,
            table_name,
            max_players,
            dealer_seat,
            player_name: player_name.to_string(),
            players,
            pre_actions,
            player_cards,
            preflop_actions,
            flop_actions,
            turn_actions,
            river_actions,
            show_down_actions,
            community_cards,
            total_pot,
            main_pot,
            side_pots,
            rake,
        }
    }

    fn parse_players(hand_str: &str, dealer_seat: u32) -> Vec<Player> {
        let mut players = Vec::new();
        
        // Regex to match seat information
        let seat_re = Regex::new(r"Seat (\d+): (.+?) \(\$([0-9.]+) in chips\)( is sitting out)?").unwrap();
        
        for line in hand_str.lines() {
            if let Some(caps) = seat_re.captures(line) {
                let seat = caps.get(1).unwrap().as_str().parse::<u32>().unwrap();
                let name = caps.get(2).unwrap().as_str().to_string();
                let chips = caps.get(3).unwrap().as_str().parse::<f32>().unwrap();
                let is_sitting_out = caps.get(4).is_some();

                players.push(Player {
                    seat,
                    position: Option::<Position>::None,
                    name,
                    chips,
                    is_sitting_out,
                });
            }
        }
        
        let playing_players_count = players.iter().filter(|p| !p.is_sitting_out).count();
        let players_count = players.len() as u32;
        players.sort_by_key(|p| if p.is_sitting_out { players_count + 1 } else { (p.seat as i32 - dealer_seat as i32 + players_count as i32) as u32 % players_count });
    
        for index in 0..playing_players_count {
            // IF BTN, SB, BB, then the position is the index
            // IF index is 3, 4, 5,..., then calculate your effective position based on how many players are sitting out
            players[index].position = Some(Position::from_index(if index < 3 { index } else { index+(9-playing_players_count) }));
        }

        // Sort by seat number
        players.sort_by_key(|p| p.seat);
        players
    }

    fn parse_pre_actions(hand_str: &str) -> Vec<PlayerAction> {
        let mut pre_actions = Vec::new();
        
        // Regex patterns for different actions
        let small_blind_re = Regex::new(r"(.+?): posts small blind \$([0-9.]+)").unwrap();
        let big_blind_re = Regex::new(r"(.+?): posts big blind \$([0-9.]+)").unwrap();
        let sits_out_re = Regex::new(r"(.+?): sits out").unwrap();
        
        for line in hand_str.lines() {
            if let Some(caps) = small_blind_re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();
                let amount = caps.get(2).unwrap().as_str().parse::<f32>().unwrap();
                pre_actions.push(PlayerAction {
                    player_name,
                    action: Action::PostSmallBlind(amount),
                });
            } else if let Some(caps) = big_blind_re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();
                let amount = caps.get(2).unwrap().as_str().parse::<f32>().unwrap();
                pre_actions.push(PlayerAction {
                    player_name,
                    action: Action::PostBigBlind(amount),
                });
            } else if let Some(caps) = sits_out_re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();
                pre_actions.push(PlayerAction {
                    player_name,
                    action: Action::SitsOut,
                });
            }
        }
        
        pre_actions
    }

    fn parse_player_cards(hand_str: &str) -> Vec<String> {
        let mut player_cards = Vec::new();
        
        let playerhands_re = Regex::new(r"Dealt to (.+?) \[([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs])\]").unwrap();
        let playerhands_caps = playerhands_re.captures(hand_str).unwrap();
        player_cards.push(playerhands_caps.get(2).unwrap().as_str().to_string());
        player_cards.push(playerhands_caps.get(3).unwrap().as_str().to_string());
        player_cards
    }

    fn parse_community_cards(hand_str: &str) -> Vec<String> {
        let mut community_cards = Vec::new();
        
        if !hand_str.contains("*** FLOP ***") {
            return community_cards;
        }

        let community_cards_re = Regex::new(r"Board \[([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs])( ([2-9TJQKA][cdhs]))??( ([2-9TJQKA][cdhs]))?\]").unwrap();
        let community_cards_caps = community_cards_re.captures(hand_str).unwrap();
        for cap in community_cards_caps.iter() {
            if cap.is_some() {
                if cap.unwrap().as_str().len() == 2 {
                    community_cards.push(cap.unwrap().as_str().to_string());
                }
            }
        }
        community_cards
    }
    
    fn parse_preflop_actions(preflop_str: &str) -> Vec<PlayerAction> {
        let mut preflop_actions = Vec::new();
        
        let hole_cards_lines = preflop_str.lines().filter(|line| !line.is_empty() && !line.starts_with("Dealt to") && !line.starts_with("\r\n")); // skip "Dealt to ... [Ah As]" line
        for line in hole_cards_lines {
            if let Some(action) = PlayerAction::from_str(line) {
                preflop_actions.push(action);
            }
        }

        preflop_actions
    }

    fn parse_flop_actions(flop_str: &str) -> (Vec<PlayerAction>) {
        let mut flop_actions = Vec::new();

        let hole_cards_lines = flop_str.lines().filter(|line| !line.is_empty() && !line.starts_with(" [") && !line.starts_with("\r\n")); // skip "*** Flop [Ah As]" line
        for line in hole_cards_lines {
            if let Some(action) = PlayerAction::from_str(line) {
                flop_actions.push(action);
            }
        } 

        flop_actions
    }

    fn parse_turn_actions(turn_str: &str) -> Vec<PlayerAction> {
        let mut turn_actions = Vec::new();
        
        let hole_cards_lines = turn_str.lines().filter(|line| !line.is_empty() && !line.starts_with(" [") && !line.starts_with("\r\n")); // skip "*** Flop [Ah As]" line
        for line in hole_cards_lines {
            if let Some(action) = PlayerAction::from_str(line) {
                turn_actions.push(action);
            }
        } 

        turn_actions
    }

    fn parse_river_actions(river_str: &str) -> Vec<PlayerAction> {
        let mut river_actions = Vec::new();
        
        let hole_cards_lines = river_str.lines().filter(|line| !line.is_empty() && !line.starts_with(" [") && !line.starts_with("\r\n")); // skip "*** River [Ah As]" line
        for line in hole_cards_lines {
            if let Some(action) = PlayerAction::from_str(line) {
                river_actions.push(action);
            }
        }

        river_actions
    }

    fn parse_show_down_actions(show_down_str: &str) -> Vec<PlayerAction> {
        let mut show_down_actions = Vec::new();
        
        let hole_cards_lines = show_down_str.lines().filter(|line| !line.is_empty() && !line.starts_with("\r\n"));
        for line in hole_cards_lines {
            if let Some(action) = PlayerAction::from_str(line) {
                show_down_actions.push(action);
            }
        }

        show_down_actions
    }

    fn parse_pot_and_rake(hand_str: &str) -> (f32, f32, Vec<f32>, f32) {
        let pot_re = Regex::new(r"Total pot \$([0-9.]+)(?:\s+Main pot \$([0-9.]+)\.\s+Side pot \$([0-9.]+)\.)? \| Rake \$([0-9.]+)").unwrap();
        let pot_re_caps = pot_re.captures(hand_str).unwrap();

        let total_pot = pot_re_caps.get(1).unwrap().as_str().parse::<f32>().unwrap();
        let rake = pot_re_caps.get(4).unwrap().as_str().parse::<f32>().unwrap();

        let (main_pot, side_pots) = if let Some(main_pot_cap) = pot_re_caps.get(2) {
            let main_pot = main_pot_cap.as_str().parse::<f32>().unwrap();
            let side_pot = pot_re_caps.get(3).map(|cap| cap.as_str().trim_end_matches('.').parse::<f32>().unwrap());
            (main_pot, side_pot.map(|sp| vec![sp]).unwrap_or_default())
        } else {
            return (total_pot, total_pot, Vec::new(), rake);
        };

        (total_pot, main_pot, side_pots, rake)
    }


    fn to_json(&self) -> String {
        format!(
            "{{\"id\":\"{}\",\"date\":\"{}\",\"time\":\"{}\",\"table_name\":\"{}\",\"small_blind\":{},\"max_players\":{},\"dealer_seat\":{},\"players\":[{}],\"pre_actions\":[{}],\"preflop_actions\":[{}],\"flop_actions\":[{}],\"turn_actions\":[{}],\"river_actions\":[{}],\"show_down_actions\":[{}],\"player_cards\":[{}],\"player_name\":\"{}\",\"community_cards\":[{}],\"total_pot\":{},\"main_pot\":{},\"side_pots\":[{}],\"rake\":{}}}",
            self.id.replace("\"", "\\\""),
            self.date.replace("\"", "\\\""),
            self.time.replace("\"", "\\\""),
            self.table_name.replace("\"", "\\\""),
            self.small_blind,
            self.max_players,
            self.dealer_seat,
            self.players.iter().map(|p| p.to_json()).collect::<Vec<_>>().join(","),
            self.pre_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.preflop_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.flop_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.turn_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.river_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.show_down_actions.iter().map(|a| a.to_json()).collect::<Vec<_>>().join(","),
            self.player_cards.iter().map(|c| format!("\"{}\"", c)).collect::<Vec<_>>().join(","),
            self.player_name.replace("\"", "\\\""),
            self.community_cards.iter().map(|c| format!("\"{}\"", c)).collect::<Vec<_>>().join(","),
            self.total_pot,
            self.main_pot,
            self.side_pots.iter().map(|s| s.to_string()).collect::<Vec<_>>().join(","),
            self.rake
        )
    }
}

async fn send_hand_to_server(hand: Hand) {
    let client = reqwest::Client::new();
    let url = "http://localhost:3000/api/hand";
    let json = hand.to_json();
    let res = client
        .post(url)
        .header("Content-Type", "application/json")
        .body(json)
        .send()
        .await;
    match res {
        Ok(response) => {
            println!("Sent hand to server, status: {}", response.status());
        },
        Err(e) => {
            eprintln!("Failed to send hand to server: {}", e);
        }
    }
}

#[tokio::main]
async fn main() {
    let username = "LakatosJózsef";
    let path_to_pokerstars = "C:\\Users\\kerte\\AppData\\Local\\PokerStars";
    let hands_folder = format!("{}\\HandHistory\\{}", path_to_pokerstars, username);

    let mut all_hands = Vec::new();

    let files = vec![fs::read_dir(hands_folder).unwrap().next().unwrap()]; // only parse the first file
    //let files = fs::read_dir(hands_folder).unwrap(); // only parse the first file

    for file in files {
        let file_path = file.unwrap().path();
        let contents = fs::read_to_string(file_path).unwrap();
        let hands: Vec<&str> = vec![contents.split("\r\n\r\n\r\n").collect::<Vec<&str>>().first().unwrap()]; // only parse the first hand
        //let hands: Vec<&str> = contents.split("\r\n\r\n\r\n").collect();
        for hand_str in hands {
            let is_tournament = (hand_str.lines().find(|line| line.contains("Tournament #"))).is_some();
            if !hand_str.trim().is_empty() && !is_tournament {
                let hand = Hand::from_str(hand_str, username);
                all_hands.push(hand);
            }
        }
    }

    let hand = all_hands.first().unwrap();
    println!("ID: {}", hand.id);
    println!("Date: {}", hand.date);
    println!("Time: {}", hand.time);
    println!("Table Name: {}", hand.table_name);
    println!("Small Blind: {}", hand.small_blind);
    println!("Max Players: {}", hand.max_players);
    println!("Dealer Position: {}", hand.dealer_seat);
    
    println!("\nPlayers:");
    for player in &hand.players {
        player.print();
    }
    
    println!("\nPre-actions:");
    for action in &hand.pre_actions {
        action.print();
    }

    println!("\nPlayer Cards:");
    println!("{}: {} {}", hand.player_name, hand.player_cards[0], hand.player_cards[1]);

    println!("\nPreflop Actions:");
    for action in &hand.preflop_actions {
        action.print();
    }

    print!("\nCommunity Cards: ");
    for card in &hand.community_cards[0..3] {
        print!("{} ", card);
    }
    println!();

    println!("\nFlop Actions:");
    for action in &hand.flop_actions {
        action.print();
    }
    
    print!("\nCommunity Cards: ");
    for card in &hand.community_cards[0..4] {
        print!("{} ", card);
    }
    println!();

    println!("\nTurn Actions:");
    for action in &hand.turn_actions {
        action.print();
    }

    print!("\nCommunity Cards: ");
    for card in &hand.community_cards[0..5] {
        print!("{} ", card);
    }
    println!();

    println!("\nRiver Actions:");
    for action in &hand.river_actions {
        action.print();
    }

    println!("\nShow Down Actions:");
    for action in &hand.show_down_actions {
        action.print();
    }

    println!("\nTotal pot: ${:.2} | Main pot: ${:.2} | Side pots: ${:.2} | Rake: ${:.2}", hand.total_pot, hand.main_pot, hand.side_pots.iter().sum::<f32>(), hand.rake);

    // Send the first hand to the server
    send_hand_to_server(hand.clone()).await;
}