use std::{fs, path::Path};

use crate::WhitelistConfig;

pub fn load_whitelist_from_path(path: &Path) -> Result<WhitelistConfig, Box<dyn std::error::Error + Send + Sync>> {
    let body = fs::read_to_string(path)?;
    let config = serde_json::from_str::<WhitelistConfig>(&body)?;
    Ok(config)
}
