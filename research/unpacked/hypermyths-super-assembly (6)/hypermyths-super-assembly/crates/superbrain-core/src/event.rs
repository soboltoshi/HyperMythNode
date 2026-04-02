use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub at: DateTime<Utc>,
    pub kind: EventKind,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventKind {
    Heartbeat,
    TaskQueued,
    TaskCompleted,
    GovernanceDecision,
    Warning,
}
