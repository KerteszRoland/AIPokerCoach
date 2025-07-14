use std::fs;
use regex::Regex;

#[derive(Debug, Clone)]
struct Player {
    seat: u32,
    name: String,
    chips: f32,
    is_sitting_out: bool,
}

#[derive(Debug, Clone)]
enum PreAction {
    PostSmallBlind(f32),
    PostBigBlind(f32),
    SitsOut,
}

#[derive(Debug, Clone)]
struct PlayerAction {
    player_name: String,
    action: PreAction,
}

struct Hand {
    id: String,
    date: String,
    time: String,
    table_name: String,
    small_blind: f32,
    max_players: u32,
    dealer_position: u32,
    players: Vec<Player>,
    pre_actions: Vec<PlayerAction>,
}

impl Hand {
    fn from_str(hand_str: &str) -> Self {
        //println!("hand_str: {}", hand_str);
        let re = regex::Regex::new(r"PokerStars Hand #(\d+):.+?\(\$(\d+\.\d+)\/\$(\d+\.\d+).+?\) - (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})").unwrap();
        let re2 = regex::Regex::new(r"Table '(.+?)' (\d+)-max Seat #(\d+) is the button").unwrap();
        
        let caps = re.captures(hand_str).unwrap();
        let caps2 = re2.captures(hand_str).unwrap();

        // Parse players
        let players = Self::parse_players(hand_str);
        
        // Parse pre-actions
        let pre_actions = Self::parse_pre_actions(hand_str);

        Hand {
            id: caps.get(1).unwrap().as_str().to_string(),
            small_blind: caps.get(2).unwrap().as_str().parse::<f32>().unwrap(),
            date: caps.get(4).unwrap().as_str().split(' ').nth(0).unwrap().to_string(),
            time: caps.get(4).unwrap().as_str().split(' ').nth(1).unwrap().to_string(),
            table_name: caps2.get(1).unwrap().as_str().to_string(),
            max_players: caps2.get(2).unwrap().as_str().parse::<u32>().unwrap(),
            dealer_position: caps2.get(3).unwrap().as_str().parse::<u32>().unwrap(),
            players,
            pre_actions,
        }
    }

    fn parse_players(hand_str: &str) -> Vec<Player> {
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
                    name,
                    chips,
                    is_sitting_out,
                });
            }
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
                    action: PreAction::PostSmallBlind(amount),
                });
            } else if let Some(caps) = big_blind_re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();
                let amount = caps.get(2).unwrap().as_str().parse::<f32>().unwrap();
                pre_actions.push(PlayerAction {
                    player_name,
                    action: PreAction::PostBigBlind(amount),
                });
            } else if let Some(caps) = sits_out_re.captures(line) {
                let player_name = caps.get(1).unwrap().as_str().to_string();
                pre_actions.push(PlayerAction {
                    player_name,
                    action: PreAction::SitsOut,
                });
            }
        }
        
        pre_actions
    }
}

fn main() {
    let username = "LakatosJózsef";
    let hands_folder = format!("C:\\Users\\OM\\AppData\\Local\\PokerStars\\HandHistory\\{}", username);

    let mut all_hands = Vec::new();

    let files = fs::read_dir(hands_folder).unwrap();
    for file in files {
        let file_path = file.unwrap().path();
        let contents = fs::read_to_string(file_path).unwrap();
        let hands: Vec<&str> = contents.split("\r\n\r\n\r\n").collect();
        for hand_str in hands {
            if !hand_str.trim().is_empty() {
                let hand = Hand::from_str(hand_str);
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
    println!("Dealer Position: {}", hand.dealer_position);
    
    println!("\nPlayers:");
    for player in &hand.players {
        println!("  Seat {}: {} (${:.2}) {}", 
            player.seat, 
            player.name, 
            player.chips,
            if player.is_sitting_out { "- sitting out" } else { "" }
        );
    }
    
    println!("\nPre-actions:");
    for action in &hand.pre_actions {
        match &action.action {
            PreAction::PostSmallBlind(amount) => {
                println!("  {}: posts small blind ${:.2}", action.player_name, amount);
            },
            PreAction::PostBigBlind(amount) => {
                println!("  {}: posts big blind ${:.2}", action.player_name, amount);
            },
            PreAction::SitsOut => {
                println!("  {}: sits out", action.player_name);
            },
        }
    }
}