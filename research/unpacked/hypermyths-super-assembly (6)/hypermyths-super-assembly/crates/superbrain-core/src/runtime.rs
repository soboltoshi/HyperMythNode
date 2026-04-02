use chrono::Utc;

use crate::{Event, EventKind, NodeState, ServiceHealth, Task, TaskState};

#[derive(Debug, Clone)]
pub struct SuperbrainRuntime {
    node_name: String,
}

impl SuperbrainRuntime {
    pub fn new(node_name: impl Into<String>) -> Self {
        Self {
            node_name: node_name.into(),
        }
    }

    pub fn snapshot(&self) -> NodeState {
        NodeState {
            node_name: self.node_name.clone(),
            mode: "private-superbrain".to_string(),
            heartbeat_count: 42,
            status: "healthy".to_string(),
            services: vec![
                ServiceHealth {
                    name: "core-runtime".to_string(),
                    status: "up".to_string(),
                    detail: "Heartbeat loop active".to_string(),
                },
                ServiceHealth {
                    name: "solana-adapter".to_string(),
                    status: "stub".to_string(),
                    detail: "RPC integration not added yet".to_string(),
                },
                ServiceHealth {
                    name: "governance-shell".to_string(),
                    status: "warming".to_string(),
                    detail: "ASIMOG decision loop placeholder".to_string(),
                },
            ],
            tasks: vec![
                Task {
                    id: 1,
                    name: "index-local-wallet-state".to_string(),
                    owner: "builder-agent".to_string(),
                    state: TaskState::Running,
                },
                Task {
                    id: 2,
                    name: "quote-compute-minute".to_string(),
                    owner: "market-engine".to_string(),
                    state: TaskState::Pending,
                },
                Task {
                    id: 3,
                    name: "verify-operator-session".to_string(),
                    owner: "asimog-shell".to_string(),
                    state: TaskState::Completed,
                },
            ],
        }
    }

    pub fn recent_events(&self) -> Vec<Event> {
        vec![
            Event {
                at: Utc::now(),
                kind: EventKind::Heartbeat,
                message: "Heartbeat accepted for private superbrain".to_string(),
            },
            Event {
                at: Utc::now(),
                kind: EventKind::TaskQueued,
                message: "Queued compute quote task".to_string(),
            },
            Event {
                at: Utc::now(),
                kind: EventKind::GovernanceDecision,
                message: "ASIMOG retained local-first execution policy".to_string(),
            },
        ]
    }
}
