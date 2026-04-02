use serde::{Deserialize, Serialize};

pub const WORLD_X: usize = 42;
pub const WORLD_Y: usize = 42;
pub const WORLD_Z: usize = 42;
pub const MAX_AGENTS: usize = 16;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SessionPhase {
    Watch,
    Analyze,
    Entry,
    Exit,
    Cooldown,
    Build,
    Director,
    Coder,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentState {
    pub id: String,
    pub x: u8,
    pub y: u8,
    pub z: u8,
    pub mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub kind: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaJob {
    pub prompt: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub phase: SessionPhase,
    pub agents: Vec<AgentState>,
    pub receipts: Vec<Receipt>,
    pub media_jobs: Vec<MediaJob>,
    pub filled_voxels: usize,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            phase: SessionPhase::Build,
            agents: vec![],
            receipts: vec![Receipt {
                kind: "boot".into(),
                detail: "HyperMythX kernel initialized".into(),
            }],
            media_jobs: vec![],
            filled_voxels: 0,
        }
    }
}
