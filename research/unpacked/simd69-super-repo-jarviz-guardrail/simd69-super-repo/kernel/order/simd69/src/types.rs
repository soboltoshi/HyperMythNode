use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum IntentKind {
    World,
    Agent,
    Compute,
    Market,
    Shell,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderingIntent {
    pub id: String,
    pub kind: IntentKind,
    pub actor_id: String,
    pub created_at_ms: u64,
    pub priority_fee: i64,
    pub urgency: i64,
    pub fairness_weight: i64,
    pub compute_cost: i64,
    pub world_impact: i64,
    pub dependencies: Vec<String>,
    pub cooldown_key: Option<String>,
    pub payload: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Rejection {
    pub id: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Receipt {
    pub receipt_id: String,
    pub intent_id: String,
    pub tick: u64,
    pub score: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct OrderingDecision {
    pub accepted_now: Vec<String>,
    pub queued: Vec<String>,
    pub rejected: Vec<Rejection>,
    pub fallback_order: Vec<String>,
    pub receipts: Vec<Receipt>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningContext {
    pub tick: u64,
    pub max_compute_budget: i64,
    pub active_cooldowns: HashMap<String, u64>,
}
