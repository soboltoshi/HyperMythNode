use serde::{Deserialize, Serialize};
use crate::state::{AppState, AgentState, MAX_AGENTS, MediaJob, Receipt, SessionPhase, WORLD_X, WORLD_Y, WORLD_Z};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CommandEnvelope {
    BuildBox { x: u8, y: u8, z: u8, sx: u8, sy: u8, sz: u8, material: String },
    SpawnAgent { id: String, x: u8, y: u8, z: u8 },
    MoveAgent { id: String, x: u8, y: u8, z: u8 },
    QueueMediaJob { prompt: String },
    ChangePhase { phase: SessionPhase },
}

pub fn apply_command(state: &mut AppState, cmd: CommandEnvelope) {
    match cmd {
        CommandEnvelope::BuildBox { x, y, z, sx, sy, sz, material } => {
            let fits = (x as usize + sx as usize) <= WORLD_X
                && (y as usize + sy as usize) <= WORLD_Y
                && (z as usize + sz as usize) <= WORLD_Z;
            if fits {
                state.filled_voxels += sx as usize * sy as usize * sz as usize;
                state.receipts.push(Receipt {
                    kind: "build_box".into(),
                    detail: format!("box {}x{}x{} at ({},{},{}) using {}", sx, sy, sz, x, y, z, material),
                });
            } else {
                state.receipts.push(Receipt {
                    kind: "reject".into(),
                    detail: "build_box out of bounds".into(),
                });
            }
        }
        CommandEnvelope::SpawnAgent { id, x, y, z } => {
            let in_bounds = (x as usize) < WORLD_X && (y as usize) < WORLD_Y && (z as usize) < WORLD_Z;
            if in_bounds && state.agents.len() < MAX_AGENTS {
                state.agents.push(AgentState { id: id.clone(), x, y, z, mode: "idle".into() });
                state.receipts.push(Receipt {
                    kind: "spawn_agent".into(),
                    detail: format!("spawned {} at ({},{},{})", id, x, y, z),
                });
            } else {
                state.receipts.push(Receipt {
                    kind: "reject".into(),
                    detail: "spawn_agent invalid bounds or cap reached".into(),
                });
            }
        }
        CommandEnvelope::MoveAgent { id, x, y, z } => {
            if let Some(agent) = state.agents.iter_mut().find(|a| a.id == id) {
                agent.x = x;
                agent.y = y;
                agent.z = z;
                state.receipts.push(Receipt {
                    kind: "move_agent".into(),
                    detail: format!("moved {} to ({},{},{})", id, x, y, z),
                });
            } else {
                state.receipts.push(Receipt {
                    kind: "reject".into(),
                    detail: format!("unknown agent {}", id),
                });
            }
        }
        CommandEnvelope::QueueMediaJob { prompt } => {
            state.media_jobs.push(MediaJob { prompt: prompt.clone(), status: "queued".into() });
            state.receipts.push(Receipt {
                kind: "media_job".into(),
                detail: prompt,
            });
        }
        CommandEnvelope::ChangePhase { phase } => {
            state.phase = phase;
            state.receipts.push(Receipt {
                kind: "change_phase".into(),
                detail: "phase updated".into(),
            });
        }
    }
}
