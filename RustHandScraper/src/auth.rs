use std::env;
use std::error::Error;
use std::time::Duration;
use tokio::time::sleep;
use webbrowser;
use keyring::Entry;
use reqwest;
use serde::Deserialize;
use serde_json;
use dotenv::dotenv;

const KEYRING_SERVICE: &str = "ai-poker-coach";
const KEYRING_USER: &str = "access_token";

pub fn store_access_token(token: &str) -> Result<(), Box<dyn Error>> {
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)?;
    entry.set_password(token)?;
    
    println!("Access token stored securely in keyring");
    Ok(())
}

pub fn get_access_token() -> Result<Option<String>, Box<dyn Error>> {
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)?;
    match entry.get_password() {
        Ok(token) => {
            Ok(Some(token))
        },
        Err(keyring::Error::NoEntry) => {
            Ok(None)
        },
        Err(e) => {
            println!("Error retrieving from keyring: {:?}", e);
            Err(Box::new(e))
        },
    }
}

pub fn clear_access_token() -> Result<(), Box<dyn Error>> {
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)?;
    match entry.delete_credential() {
        Ok(()) => {
            println!("Access token cleared from keyring");
            Ok(())
        }
        Err(keyring::Error::NoEntry) => {
            println!("No access token found in keyring to clear");
            Ok(())
        }
        Err(e) => Err(Box::new(e)),
    }
}

pub fn is_authenticated() -> bool {
    match get_access_token() {
        Ok(Some(_)) => true,
        _ => false,
    }
}

pub async fn start_login_flow() -> Result<(), Box<dyn Error>> {
    dotenv::dotenv().ok();
    
    // Clear any existing token before starting new login flow
    clear_access_token().ok(); // Ignore errors if no token exists
    
    let backend_url = env::var("BACKEND_URL").expect("Missing the BACKEND_URL environment variable.");
    let nextjs_exchange_url = format!("{}/api/rust-client", backend_url);
    
    println!("Opening browser for authentication...");
    webbrowser::open(&nextjs_exchange_url)?;
    
    println!("Loading... Please complete authentication in your browser");
    
    // Busy wait for token to appear in keyring
    let mut attempts = 0;
    let max_attempts = 300; // 10 minutes timeout (300 * 2 seconds)
    let mut loading_chars = ['|', '/', '-', '\\'];
    let mut loading_index = 0;
    
    loop {
        if attempts >= max_attempts {
            return Err("Login timed out after 10 minutes. Please try again.".into());
        }
        
        // Check if token exists in keyring
        match get_access_token()? {
            Some(token) => {
                println!("\n✓ Authentication successful! Token received and stored securely.");
                return Ok(());
            }
            None => {
                // Show loading animation
                print!("\rLoading... {} Waiting for authentication to complete", 
                       loading_chars[loading_index]);
                loading_index = (loading_index + 1) % loading_chars.len();
                std::io::Write::flush(&mut std::io::stdout()).ok();
            }
        }
        
        sleep(Duration::from_secs(2)).await;
        attempts += 1;
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GoogleUserInfo {
    pub id: String,
    pub email: String,
    pub name: String,
    pub picture: String,
}

pub async fn get_google_user_info() -> Result<GoogleUserInfo, Box<dyn Error>> {
    // Get the access token from keyring
    let access_token = match get_access_token()? {
        Some(token) => token.trim().to_string(), // Trim any whitespace/newlines
        None => return Err("No access token found. Please authenticate first.".into()),
    };
    
    println!("Using token (first 20 chars): {}...", &access_token[..std::cmp::min(20, access_token.len())]);
    
    // Create HTTP client
    let client = reqwest::Client::new();
    
    // Make request to Google's userinfo endpoint
    let response = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await?;
    
    println!("Response status: {}", response.status());
    
    // Check if request was successful
    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        
        // If it's a 401, the token might be expired
        if status == 401 {
            println!("Access token appears to be expired or invalid. You may need to re-authenticate.");
            // Optionally clear the token
            clear_access_token().ok();
        }
        
        return Err(format!("Failed to get user info. Status: {}, Error: {}", status, error_text).into());
    }
    
    // Parse the JSON response
    let user_info: GoogleUserInfo = response.json().await?;
    
    println!("Successfully retrieved Google user info for: {}", user_info.email);
    Ok(user_info)
}

pub async fn validate_access_token() -> Result<bool, Box<dyn Error>> {
    let access_token = match get_access_token()? {
        Some(token) => token.trim().to_string(),
        None => return Ok(false),
    };
    
    let client = reqwest::Client::new();
    
    // Test the token using Google's tokeninfo endpoint
    let response = client
        .get(&format!("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={}", access_token))
        .send()
        .await?;
    
    if response.status().is_success() {
        let token_info: serde_json::Value = response.json().await?;
        println!("Token validation successful. Scope: {:?}", token_info.get("scope"));
        Ok(true)
    } else {
        println!("Token validation failed. Status: {}", response.status());
        if response.status() == 400 {
            println!("Token appears to be expired or invalid.");
            clear_access_token().ok();
        }
        Ok(false)
    }
}
