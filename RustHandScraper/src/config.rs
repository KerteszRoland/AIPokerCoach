use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use dirs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub pokerstars_handhistory_path: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            pokerstars_handhistory_path: None,
        }
    }
}

pub struct ConfigManager {
    config_dir: PathBuf,
    config_file: PathBuf,
}

impl ConfigManager {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let config_dir = Self::get_config_dir()?;
        let config_file = config_dir.join("config.json");
        
        Ok(Self {
            config_dir,
            config_file,
        })
    }

    pub fn get_config_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let app_data_dir = dirs::config_dir()
            .ok_or("Could not determine config directory")?;
        
        let app_config_dir = app_data_dir.join("AI Poker Coach");
        
        // Create directory if it doesn't exist
        if !app_config_dir.exists() {
            fs::create_dir_all(&app_config_dir)?;
        }
        
        Ok(app_config_dir)
    }

    pub fn load_config(&self) -> Result<AppConfig, Box<dyn std::error::Error>> {
        if !self.config_file.exists() {
            let default_config = AppConfig::default();
            self.save_config(&default_config)?;
            return Ok(default_config);
        }

        let config_content = fs::read_to_string(&self.config_file)?;
        let config: AppConfig = serde_json::from_str(&config_content)?;
        Ok(config)
    }

    pub fn save_config(&self, config: &AppConfig) -> Result<(), Box<dyn std::error::Error>> {
        let config_json = serde_json::to_string_pretty(config)?;
        fs::write(&self.config_file, config_json)?;
        Ok(())
    }

    pub fn update_pokerstars_path(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut config = self.load_config()?;
        config.pokerstars_handhistory_path = Some(path);
        self.save_config(&config)?;
        Ok(())
    }

    pub fn get_pokerstars_path(&self) -> Result<Option<String>, Box<dyn std::error::Error>> {
        let config = self.load_config()?;
        Ok(config.pokerstars_handhistory_path)
    }

    // Get the path where the config file is stored (for debugging)
    pub fn get_config_file_path(&self) -> &Path {
        &self.config_file
    }
}

// Helper function to get the standard app data directory
pub fn get_app_data_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_data_dir = dirs::data_local_dir()
        .ok_or("Could not determine app data directory")?;
    
    let app_dir = app_data_dir.join("AI Poker Coach");
    
    // Create directory if it doesn't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    
    Ok(app_dir)
}

// Helper function to get cache directory
pub fn get_cache_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let cache_dir = dirs::cache_dir()
        .ok_or("Could not determine cache directory")?;
    
    let app_cache_dir = cache_dir.join("AI Poker Coach");
    
    // Create directory if it doesn't exist
    if !app_cache_dir.exists() {
        fs::create_dir_all(&app_cache_dir)?;
    }
    
    Ok(app_cache_dir)
} 