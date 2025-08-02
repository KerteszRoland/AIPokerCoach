use std::{fs::{self, DirEntry}, io::Error, thread, sync::mpsc};
use regex::Regex;
use reqwest;
use tray_icon::{menu::{CheckMenuItem, IconMenuItem, Menu, MenuEvent, MenuItem}, Icon, TrayIconBuilder, TrayIconEvent};
#[cfg(target_os = "linux")]
use gtk;
use tokio::time::{sleep, Duration};
use dotenv::dotenv;
use native_dialog::{DialogBuilder, MessageLevel};
mod auth;
mod config;
use auth::{start_login_flow, get_access_token, store_access_token, get_google_user_info};
use config::{ConfigManager, AppConfig};
use std::env;
use winreg::{RegKey, enums::HKEY_CLASSES_ROOT};

use crate::auth::{clear_access_token, GoogleUserInfo};

const BACKEND_URL: &str = "http://localhost:3000";

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
    chips_after_hand: f32,
    is_sitting_out: bool,
}

impl Player {
    fn print(&self) {
        let position_str = if self.position.is_some() { format!("({}) ", self.position.as_ref().unwrap().as_str()) } else { "".to_string() };
        println!("  Seat {}: {}{} (${:.2}) {}", self.seat, position_str, self.name, self.chips, if self.is_sitting_out { "- sitting out" } else { "" });
    }

    fn to_json(&self) -> String {
        format!(
            "{{\"seat\":{},\"position\":{},\"name\":\"{}\",\"chips\":{},\"chips_after_hand\":{},\"is_sitting_out\":{}}}",
            self.seat,
            match &self.position {
                Some(pos) => pos.to_json(),
                None => "null".to_string(),
            },
            self.name.replace("\"", "\\\""),
            self.chips,
            self.chips_after_hand,
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
    hero_cards: Vec<String>,
    hero_name: String,
    community_cards: Vec<String>,
    total_pot: f32,
    main_pot: f32,
    side_pot: f32,
    side_pot2: f32,
    rake: f32,
}

impl Hand {
    fn from_str(hand_str: &str) -> Self {
        println!("hand_str: {}", hand_str);

        let re = regex::Regex::new(r"PokerStars Hand #(\d+):\s+.+?\(\$(\d+\.\d+)\/\$(\d+\.\d+) USD\) - (\d{4}/\d{2}/\d{2} \d{1,2}:\d{2}:\d{2}) (CET|\w{2}|ET)").unwrap();
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

        let pre_actions = Self::parse_pre_actions(hand_str);
        let (hero_cards, hero_name) = Self::parse_hero_cards_and_name(hand_str);
        
        let community_cards = Self::parse_community_cards(hand_str);
        let (total_pot, main_pot, side_pot, side_pot2, rake) = Self::parse_pot_and_rake(hand_str);
        let players = Self::parse_players(hand_str, dealer_seat, &pre_actions, &preflop_actions, &flop_actions, &turn_actions, &river_actions, &show_down_actions);
        
        Hand {
            id: hand_id,
            small_blind,
            date,
            time,
            table_name,
            max_players,
            dealer_seat,
            hero_name: hero_name.to_string(),
            players,
            pre_actions,
            hero_cards,
            preflop_actions,
            flop_actions,
            turn_actions,
            river_actions,
            show_down_actions,
            community_cards,
            total_pot,
            main_pot,
            side_pot,
            side_pot2,
            rake,
        }
    }

    fn parse_players(hand_str: &str, dealer_seat: u32, pre_actions: &Vec<PlayerAction>, preflop_actions: &Vec<PlayerAction>, flop_actions: &Vec<PlayerAction>, turn_actions: &Vec<PlayerAction>, river_actions: &Vec<PlayerAction>, show_down_actions: &Vec<PlayerAction>) -> Vec<Player> {
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
                    name: name.clone(),
                    chips,
                    chips_after_hand: Self::calculate_chips_after_hand(name.clone(), chips, pre_actions, preflop_actions, flop_actions, turn_actions, river_actions, show_down_actions),
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

    fn calculate_chips_after_hand(name: String, chips: f32, pre_actions: &Vec<PlayerAction>, preflop_actions: &Vec<PlayerAction>, flop_actions: &Vec<PlayerAction>, turn_actions: &Vec<PlayerAction>, river_actions: &Vec<PlayerAction>, show_down_actions: &Vec<PlayerAction>) -> f32 {
        let mut chips_after_hand = chips;

        let mut put_into_pot = 0.0;

        for action in pre_actions.iter().chain(preflop_actions.iter()) {
            if action.player_name == name {
                match &action.action {
                    &Action::PostSmallBlind(amount) => put_into_pot += amount,
                    &Action::PostBigBlind(amount) => put_into_pot += amount,
                    &Action::Bet(amount) => put_into_pot += amount,
                    &Action::BetAndAllIn(amount) => put_into_pot += amount,
                    &Action::Raise(_, to) => put_into_pot += to - put_into_pot,
                    &Action::RaiseAndAllIn(_, to) => put_into_pot += to - put_into_pot,
                    &Action::Call(amount) => put_into_pot += amount,
                    &Action::CallAndAllIn(amount) => put_into_pot += amount,
                    &Action::Collected(amount) => chips_after_hand += amount,
                    &Action::CollectedFromSidePot(amount) => chips_after_hand += amount,
                    &Action::CollectedFromMainPot(amount) => chips_after_hand += amount,
                    &Action::CashedOut(amount, _) => chips_after_hand += amount,
                    &Action::UncalledBet(amount) => chips_after_hand += amount,
                    _ => {}
                }
            }
        }
        chips_after_hand -= put_into_pot;

        let streets = vec![flop_actions, turn_actions, river_actions, show_down_actions];
        for street in streets {
            put_into_pot = 0.0;
            for action in street {
                if action.player_name == name {
                    match &action.action {
                        &Action::Bet(amount) => put_into_pot += amount,
                        &Action::BetAndAllIn(amount) => put_into_pot += amount,
                        &Action::Raise(_, to) => put_into_pot += to - put_into_pot,
                        &Action::RaiseAndAllIn(_, to) => put_into_pot += to - put_into_pot,
                        &Action::Call(amount) => put_into_pot += amount,
                        &Action::CallAndAllIn(amount) => put_into_pot += amount,
                        &Action::Collected(amount) => chips_after_hand += amount,
                        &Action::CollectedFromSidePot(amount) => chips_after_hand += amount,
                        &Action::CollectedFromMainPot(amount) => chips_after_hand += amount,
                        &Action::CashedOut(amount, _) => chips_after_hand += amount,
                        &Action::UncalledBet(amount) => chips_after_hand += amount,
                        _ => {}
                    }
                }
            }
            chips_after_hand -= put_into_pot;
        }

        let rounded = (chips_after_hand * 100.0).round() / 100.0;
        rounded as f32
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

    fn parse_hero_cards_and_name(hand_str: &str) -> (Vec<String>, String) {
        let playerhands_re = Regex::new(r"Dealt to (.+?) \[([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs])\]").unwrap();
        let playerhands_caps = playerhands_re.captures(hand_str).unwrap();
        let hero_name = playerhands_caps.get(1).unwrap().as_str().to_string();
        let hero_cards = vec![playerhands_caps.get(2).unwrap().as_str().to_string(), playerhands_caps.get(3).unwrap().as_str().to_string()];
        (hero_cards, hero_name)
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

    fn parse_pot_and_rake(hand_str: &str) -> (f32, f32, f32, f32, f32) {
        let pot_re = Regex::new(r"Total pot \$([0-9.]+)(?:\s+Main pot \$([0-9.]+)\.\s+Side pot \$([0-9.]+)\.)? \| Rake \$([0-9.]+)").unwrap();
        let pot_re_caps = pot_re.captures(hand_str).unwrap();

        let total_pot = pot_re_caps.get(1).unwrap().as_str().parse::<f32>().unwrap();
        let rake = pot_re_caps.get(4).unwrap().as_str().parse::<f32>().unwrap();

        let (main_pot, side_pot, side_pot2) = if let Some(main_pot_cap) = pot_re_caps.get(2) {
            let main_pot = main_pot_cap.as_str().parse::<f32>().unwrap();
            let side_pot = pot_re_caps.get(3).map(|cap| cap.as_str().trim_end_matches('.').parse::<f32>().unwrap());
            let side_pot2: Option<f32> = Some(0.0);
            (main_pot, side_pot.unwrap_or(0.0), side_pot2.unwrap_or(0.0))
        } else {
            return (total_pot, total_pot, 0.0, 0.0, rake);
        };

        (total_pot, main_pot, side_pot, side_pot2, rake)
    }

    fn to_json(&self, user_google_id: String, google_access_token: String) -> String {
        format!(
            "{{\"id\":\"{}\",\"date\":\"{}\",\"time\":\"{}\",\"table_name\":\"{}\",\"small_blind\":{},\"max_players\":{},\"dealer_seat\":{},\"players\":[{}],\"pre_actions\":[{}],\"preflop_actions\":[{}],\"flop_actions\":[{}],\"turn_actions\":[{}],\"river_actions\":[{}],\"show_down_actions\":[{}],\"hero_cards\":[{}],\"hero_name\":\"{}\",\"community_cards\":[{}],\"total_pot\":{},\"main_pot\":{},\"side_pot\":{},\"side_pot2\":{},\"rake\":{},\"user_google_id\":\"{}\",\"google_access_token\":\"{}\"}}",
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
            self.hero_cards.iter().map(|c| format!("\"{}\"", c)).collect::<Vec<_>>().join(","),
            self.hero_name.replace("\"", "\\\""),
            self.community_cards.iter().map(|c| format!("\"{}\"", c)).collect::<Vec<_>>().join(","),
            self.total_pot,
            self.main_pot,
            self.side_pot,
            self.side_pot2,
            self.rake,
            user_google_id,
            google_access_token
        )
    }

    fn print(&self) {
        println!("ID: {}", self.id);
        println!("Date: {}", self.date);
        println!("Time: {}", self.time);
        println!("Table Name: {}", self.table_name);
        println!("Small Blind: {}", self.small_blind);
        println!("Max Players: {}", self.max_players);
        println!("Dealer Position: {}", self.dealer_seat);
        
        println!("\nPlayers:");
        for player in &self.players {
            player.print();
        }
        
        println!("\nPre-actions:");
        for action in &self.pre_actions {
            action.print();
        }
    
        println!("\nPlayer Cards:");
        println!("{}: {} {}", self.hero_name, self.hero_cards[0], self.hero_cards[1]);
    
        println!("\nPreflop Actions:");
        for action in &self.preflop_actions {
            action.print();
        }
    
        print!("\nCommunity Cards: ");
        for card in &self.community_cards[0..3] {
            print!("{} ", card);
        }
        println!();
    
        println!("\nFlop Actions:");
        for action in &self.flop_actions {
            action.print();
        }
        
        print!("\nCommunity Cards: ");
        for card in &self.community_cards[0..4] {
            print!("{} ", card);
        }
        println!();
    
        println!("\nTurn Actions:");
        for action in &self.turn_actions {
            action.print();
        }
    
        print!("\nCommunity Cards: ");
        for card in &self.community_cards[0..5] {
            print!("{} ", card);
        }
        println!();
    
        println!("\nRiver Actions:");
        for action in &self.river_actions {
            action.print();
        }
    
        println!("\nShow Down Actions:");
        for action in &self.show_down_actions {
            action.print();
        }
    
        println!("\nTotal pot: ${:.2} | Main pot: ${:.2} | Side pot: ${:.2} | Side pot 2: ${:.2} | Rake: ${:.2}", self.total_pot, self.main_pot, self.side_pot, self.side_pot2, self.rake);
    
    }
}

fn get_hand_files_from_folder(path_to_pokerstars_handhistory: &str) -> Vec<Result<DirEntry, Error>> {
    let hands_folder = format!("{}", path_to_pokerstars_handhistory);
    //let files = vec![fs::read_dir(hands_folder).unwrap().next().unwrap()]; // only parse the first file
    let files = fs::read_dir(hands_folder).unwrap().collect::<Vec<_>>();
    files
}

fn get_hands_from_file(file_path: &str) -> Vec<Hand> {
    let mut all_hands = Vec::new();
    let contents = fs::read_to_string(file_path).unwrap();
    //let hands: Vec<&str> = vec![contents.split("\r\n\r\n\r\n").collect::<Vec<&str>>().first().unwrap()]; // only parse the first hand
    let hands: Vec<&str> = contents.split("\r\n\r\n\r\n").collect();
    for hand_str in hands {
        let is_tournament = (hand_str.lines().find(|line| line.contains("Tournament #"))).is_some();
        if !hand_str.trim().is_empty() && !is_tournament {
            let hand = Hand::from_str(hand_str);
            all_hands.push(hand);
        }
    }
    all_hands
}

fn get_last_hand_from_file(file_path: &str) -> Hand {
    let contents = fs::read_to_string(file_path).unwrap();
    let last_hand_str = "PokerStars Hand".to_string()+contents.split("PokerStars Hand").last().unwrap();
    let hand = Hand::from_str(last_hand_str.as_str());
    hand
}

fn get_hand_by_id(all_hands: &Vec<Hand>, id: &str) -> Option<Hand> {
    all_hands.iter().find(|hand| hand.id == id).cloned()
}

fn scan_for_todays_most_recent_hand(path_to_pokerstars_handhistory: &str) -> Option<Hand> {
    let files = get_hand_files_from_folder(path_to_pokerstars_handhistory);
    let today = chrono::Local::now().date_naive();
    let today_str = today.format("%Y%m%d").to_string();

    let today_files: Vec<_> = files.into_iter().filter_map(|file_result| {
        let entry = file_result.ok()?; // Handle Result, skip if Err
        let file_name = entry.file_name();
        let file_modified_at = entry.metadata().unwrap().modified().unwrap();
        
        // Convert SystemTime to date string for comparison
        let file_modified_date = chrono::DateTime::<chrono::Local>::from(file_modified_at)
            .date_naive()
            .format("%Y%m%d")
            .to_string();

        if file_modified_date == today_str {
            return Some(entry); // Keep this DirEntry
        }
        None // Skip this file
    }).collect();


    let last_hand = today_files.iter().map(|file| 
        get_last_hand_from_file(file.path().to_str().unwrap()))
        .max_by_key(|hand| chrono::NaiveDateTime::parse_from_str(&format!("{} {}", hand.date, hand.time), "%Y/%m/%d %H:%M:%S").unwrap());
    last_hand
}

async fn send_hand_to_server(hand: Hand, user_google_id: String, google_access_token: String) {
    let client = reqwest::Client::new();
    println!("Sending hand to server: {}/api/hand", BACKEND_URL);
    let url = format!("{}/api/hand", BACKEND_URL);
    let json = hand.to_json(user_google_id, google_access_token);
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

fn show_alert(message: &str) {
    println!("Showing alert: {}", message);
    DialogBuilder::message()
        .set_level(MessageLevel::Info)
        .set_title("AI Poker Coach")
        .set_text(message)
        .confirm()
        .show()
        .unwrap();
}

#[derive(Debug)]
enum TrayCommand {
    SetPaused(bool),
    SetError(Option<String>),
    UpdateUserInfo(Option<GoogleUserInfo>, Option<tray_icon::menu::Icon>),
}

#[derive(Debug)]
enum AppCommand {
    TogglePause,
    LogIn,
    LogOut,
    SyncHands,
    ChangeFolderPath,
    Exit,
}

fn create_tray_thread(user_info: Option<GoogleUserInfo>, user_icon: Option<tray_icon::menu::Icon>) -> (mpsc::Sender<TrayCommand>, mpsc::Receiver<AppCommand>) {
    let (tray_tx, tray_rx) = mpsc::channel::<TrayCommand>();
    let (app_tx, app_rx) = mpsc::channel::<AppCommand>();

    thread::spawn(move || {
        #[cfg(target_os = "linux")]
        gtk::init().expect("Failed to initialize GTK.");

        let current_dir = std::env::current_exe().unwrap().parent().unwrap().to_path_buf();
        println!("Current directory: {}", current_dir.display());
        let icon_running = load_icon(std::path::Path::new(&format!("{}/assets/icon_running.png", current_dir.display())));
        let icon_paused = load_icon(std::path::Path::new(&format!("{}/assets/icon_paused.png", current_dir.display())));
        let icon_error = load_icon(std::path::Path::new(&format!("{}/assets/icon_error.png", current_dir.display())));

        let logged_in_name = IconMenuItem::new("Not logged in", false, None, None);
        let log_in_out = MenuItem::new("Log in/out", true, None);
        let paused = MenuItem::new("Pause", true, None);
        let sync_hands = MenuItem::new("Sync hands", true, None);
        let change_folder_path = MenuItem::new("Change folder path", true, None);
        let exit_item = MenuItem::new("Exit", true, None);

        let mut logged_in = false;

        if let Some(user_info) = &user_info {
            logged_in_name.set_enabled(true);
            logged_in_name.set_text(&format!("{}", user_info.name));
            logged_in_name.set_icon(user_icon);
            log_in_out.set_text("Log out");
            logged_in = true;
        } else {
            logged_in_name.set_enabled(false);
            logged_in_name.set_text("Not logged in");
            log_in_out.set_text("Log in");
            logged_in_name.set_icon(None);
        }

        let inner_menu = Menu::new();
        let _ = inner_menu.append(&logged_in_name);
        let _ = inner_menu.append(&log_in_out);
        let _ = inner_menu.append(&paused);
        let _ = inner_menu.append(&sync_hands);
        let _ = inner_menu.append(&change_folder_path);
        let _ = inner_menu.append(&exit_item);

        let tray = TrayIconBuilder::new()
            .with_menu(Box::new(inner_menu))
            .with_tooltip("AI Poker Coach - Running")
            .with_icon(icon_running.clone())
            .build()
            .unwrap();

        let menu_channel = MenuEvent::receiver();
        let tray_channel = TrayIconEvent::receiver();
        let mut is_paused = false;
        let mut error: Option<String> = None;

        loop {

            #[cfg(target_os = "linux")]
            gtk::main_iteration_do(false);

            // Windows message pumping for proper tray icon handling
            #[cfg(target_os = "windows")]
            {
                use std::mem;
                use std::ptr;
                // Simple message pump to ensure Windows messages are processed
                unsafe {
                    let mut msg: winapi::um::winuser::MSG = mem::zeroed();
                    while winapi::um::winuser::PeekMessageW(&mut msg, ptr::null_mut(), 0, 0, winapi::um::winuser::PM_REMOVE) != 0 {
                        winapi::um::winuser::TranslateMessage(&msg);
                        winapi::um::winuser::DispatchMessageW(&msg);
                    }
                }
            }

            // Handle tray icon events (clicks)
            if let Ok(_event) = tray_channel.try_recv() {
                // Tray icon clicked - could add functionality here if needed
            }

            // Handle menu events
            if let Ok(event) = menu_channel.try_recv() {
                if event.id() == log_in_out.id() {
                    if logged_in {
                        println!("Log out requested");
                        app_tx.send(AppCommand::LogOut).ok();
                    } else {
                        println!("Log in requested");
                        app_tx.send(AppCommand::LogIn).ok();
                    }
                } 
                else if event.id() == paused.id() {
                    is_paused = !is_paused;
                    paused.set_text(if is_paused { "Resume" } else { "Pause" });
                    println!("Toggled pause state to: {}", is_paused);
                    app_tx.send(AppCommand::TogglePause).ok();
                } else if event.id() == sync_hands.id() {
                    println!("Sync hands requested");
                    app_tx.send(AppCommand::SyncHands).ok();
                } else if event.id() == change_folder_path.id() {
                    println!("Change folder path requested");
                    app_tx.send(AppCommand::ChangeFolderPath).ok();
                } else if event.id() == exit_item.id() {
                    println!("Exit requested");
                    app_tx.send(AppCommand::Exit).ok();
                    return;
                }
            }

            // Handle commands from main thread
            while let Ok(cmd) = tray_rx.try_recv() {
                match cmd {
                    TrayCommand::SetPaused(paused_state) => {
                        is_paused = paused_state;
                        paused.set_text(if is_paused { "Resume" } else { "Pause" });
                    }
                    TrayCommand::SetError(err) => {
                        error = err;
                    }
                    TrayCommand::UpdateUserInfo(updated_user_info, user_icon) => {
                        tray.set_visible(false);
                        tray.set_visible(true);
                        if let Some(updated_user_info) = updated_user_info {
                            logged_in_name.set_enabled(true);
                            logged_in_name.set_text(&format!("User: {}", updated_user_info.name));
                            logged_in_name.set_icon(user_icon);
                            log_in_out.set_text("Log out");
                            logged_in = true;
                        } else {
                            logged_in_name.set_enabled(false);
                            logged_in_name.set_text("Not logged in");
                            logged_in_name.set_icon(None);
                            log_in_out.set_text("Log in");
                            logged_in = false;
                        }
                    }
                }
            }

            // Update tray status
            let status = if let Some(ref e) = error {
                format!("Error: {}", e)
            } else if is_paused {
                "Paused".to_string()
            } else {
                "Running".to_string()
            };

            tray.set_tooltip(Some(&format!("AI Poker Coach - {}", status))).ok();

            let current_icon = if error.is_some() {
                icon_error.clone()
            } else if is_paused {
                icon_paused.clone()
            } else {
                icon_running.clone()
            };

            tray.set_icon(Some(current_icon)).ok();

            thread::sleep(std::time::Duration::from_millis(50));
        }
    });

    (tray_tx, app_rx)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    println!("Args: {:?}", args);

    // Create a Tokio runtime for async operations
    let rt = tokio::runtime::Runtime::new()?;

    if args.len() > 1 && args[1].starts_with("ai-poker-coach://") {
        // Callback mode: Parse URL from arg
        println!("Callback mode args: {:?}", args);
        store_access_token(&args[1].split("token=").last().unwrap()).expect("Failed to store access token");
        return Ok(());
    }

    // Initialize configuration manager
    let mut config_manager = ConfigManager::new()?;
    println!("Config file location: {:?}", config_manager.get_config_file_path());

    let mut user_icon: Option<tray_icon::menu::Icon> = None;
    let user_info: Option<GoogleUserInfo> = match rt.block_on(get_google_user_info()) {
        Ok(info) => {
            user_icon = Some(rt.block_on(load_icon_from_url(&info.picture, 32, 32)));
            Some(info)
        },
        Err(_) => None,
    };

    let (tray_tx, app_rx) = create_tray_thread(user_info.clone(), user_icon);

    let mut last_hand_id: Option<String> = None;
    let mut error: Option<String> = None;
    let mut is_paused = false;

    println!("Scanning for new hands...");

    loop {
        // Handle commands from tray thread
        while let Ok(cmd) = app_rx.try_recv() {
            match cmd {
                AppCommand::TogglePause => {
                    is_paused = !is_paused;
                    println!("Main: Pause state changed to: {}", is_paused);
                }
                AppCommand::LogIn => {
                    rt.block_on(start_login_flow())?;
                    if let Ok(user_info) = rt.block_on(get_google_user_info()) {
                        user_icon = Some(rt.block_on(load_icon_from_url(&user_info.picture, 32, 32)));
                        tray_tx.send(TrayCommand::UpdateUserInfo(Some(user_info), user_icon)).ok();
                    } else {
                        println!("Failed to get user info");
                    }
                }
                AppCommand::LogOut => {
                    clear_access_token().expect("Failed to clear access token");
                    tray_tx.send(TrayCommand::UpdateUserInfo(None, None)).ok();
                }
                AppCommand::SyncHands => {
                    println!("Main: Sync hands requested");
                    let user_info= rt.block_on(get_google_user_info());
                    let google_access_token = get_access_token();

                    if let Ok(user_info) = user_info && let Ok(google_access_token) = google_access_token {
                        if google_access_token.is_none() {
                            println!("Main: No access token");
                            return Ok(());
                        }
                        
                        // Get path from configuration instead of environment variable
                        let path_to_handhistory = match config_manager.get_pokerstars_path() {
                            Ok(Some(path)) => path,
                            Ok(None) => {
                                show_alert("No PokerStars hand history path configured. Please use 'Change folder path' option first.");
                                continue;
                            }
                            Err(e) => {
                                println!("Failed to get path from config: {}", e);
                                continue;
                            }
                        };
                        
                        let files = get_hand_files_from_folder(&path_to_handhistory);
                        let hands = files.iter().map(|file| get_hands_from_file(file.as_ref().unwrap().path().to_str().unwrap())).flatten().collect::<Vec<Hand>>();
                        for hand in &hands[0..5] {
                            println!("{}", hand.to_json( user_info.id.clone(), google_access_token.clone().unwrap()));
                            rt.block_on(send_hand_to_server(hand.clone(),  user_info.id.clone(), google_access_token.clone().unwrap()));
                        }
                        
                    }
                }
                AppCommand::ChangeFolderPath => {
                    println!("Main: Change folder path requested");
                    let path = DialogBuilder::file()
                        .set_title("Select PokerStars Hand History Folder")
                        .open_single_dir()
                        .show();
                    if let Ok(Some(path)) = path {
                        println!("Selected folder path: {}", path.display());
                        // Save the selected path to configuration
                        if let Err(e) = config_manager.update_pokerstars_path(path.to_string_lossy().to_string()) {
                            println!("Failed to save path to config: {}", e);
                        } else {
                            println!("Path saved to configuration successfully");
                        }
                    } else {
                        println!("No folder selected");
                    }
                }
                AppCommand::Exit => {
                    println!("Main: Exit requested");
                    return Ok(());
                }
            }
        }

        if !is_paused {
            /* 
            let pokerstars_path = std::env::var("POKERSTARS_HANDHISTORY_PATH")
                .unwrap_or_else(|_| "C:\\Users\\AppData\\Local\\PokerStars".to_string());
            match scan_for_todays_most_recent_hand(&pokerstars_path) {
                Some(hand) => {
                    if let Some(ref last_id) = last_hand_id {
                        if *last_id != hand.id {
                            println!("Found new hand: {}", hand.id);
                            rt.block_on(send_hand_to_server(hand.clone()));
                            println!("Hand sent to server:");
                            println!("{}", hand.to_json());
                            last_hand_id = Some(hand.id.clone());
                        }
                    } else {
                        println!("Found first hand: {}", hand.id);
                        rt.block_on(send_hand_to_server(hand.clone()));
                        println!("Hand sent to server:");
                        println!("{}", hand.to_json());
                        last_hand_id = Some(hand.id.clone());
                    }
                    error = None;
                }
                None => {
                    error = None;
                }
            }
            */
        }

        // Send status updates to tray thread
        tray_tx.send(TrayCommand::SetPaused(is_paused)).ok();
        tray_tx.send(TrayCommand::SetError(error.clone())).ok();

        std::thread::sleep(std::time::Duration::from_secs(3));
    }
    // Ok(())
}

fn load_icon(path: &std::path::Path) -> tray_icon::Icon {
    println!("Loading icon from path: {}", path.display());
    let (icon_rgba, icon_width, icon_height) = {
        let current_path = std::env::current_dir().unwrap();
        let image = image::open(path)
            .expect("Failed to open icon path")
            .into_rgba8();
        let (width, height) = image.dimensions();
        let rgba = image.into_raw();
        (rgba, width, height)
    };
    tray_icon::Icon::from_rgba(icon_rgba, icon_width, icon_height).expect("Failed to open icon")
}

async fn load_icon_from_url(url: &str, width: u32, height: u32) -> tray_icon::menu::Icon {
    let response = reqwest::get(url).await.unwrap();
    let bytes = response.bytes().await.unwrap();
    let image = image::load_from_memory(&bytes).unwrap();
    let resized_image = image.resize_exact(width, height, image::imageops::FilterType::Lanczos3);
    let rgba = resized_image.into_rgba8().into_raw();
    tray_icon::menu::Icon::from_rgba(rgba, width, height).unwrap()
}
