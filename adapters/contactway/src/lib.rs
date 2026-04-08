pub mod bridge;

use serde::{Deserialize, Serialize};

/// Intent sent from a source surface through the kernel to a haptic device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayIntent {
    pub source_surface: String,
    pub channel: String,
    pub pattern: String,
    pub intensity: f32,
    pub duration_ms: u64,
    pub context: Option<String>,
}

/// Result of attempting to forward an intent to a device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayDeviceResult {
    pub forwarded: bool,
    pub device_name: Option<String>,
    pub note: String,
}

/// Device info returned from scanning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayDeviceInfo {
    pub name: String,
    pub supports_vibrate: bool,
    pub supports_rotate: bool,
    pub supports_linear: bool,
}
