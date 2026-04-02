use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketSnapshot {
    pub market_id: String,
    pub quote_currency: String,
    pub generated_at: DateTime<Utc>,
    pub node_count: usize,
    pub job_count: usize,
    pub quote_count: usize,
    pub fill_count: usize,
    pub settlement_total: f64,
    pub policy: BrainPolicy,
    pub nodes: Vec<ComputeNode>,
    pub jobs: Vec<ComputeJob>,
    pub quotes: Vec<Quote>,
    pub fills: Vec<Fill>,
    pub settlements: Vec<SettlementReceipt>,
    pub events: Vec<MarketEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrainPolicy {
    pub mode: String,
    pub private_bias: f64,
    pub urgency_multiplier_high: f64,
    pub urgency_multiplier_normal: f64,
    pub urgency_multiplier_low: f64,
    pub reliability_weight: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputeNode {
    pub id: String,
    pub role: NodeRole,
    pub available_minutes: u32,
    pub price_floor_per_minute: f64,
    pub reliability: f64,
    pub trust: TrustLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputeJob {
    pub id: String,
    pub owner: String,
    pub desired_role: NodeRole,
    pub requested_minutes: u32,
    pub max_budget: f64,
    pub urgency: Urgency,
    pub required_trust: TrustLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quote {
    pub id: String,
    pub job_id: String,
    pub node_id: String,
    pub minutes: u32,
    pub ask_total: f64,
    pub score: f64,
    pub rationale: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fill {
    pub id: String,
    pub quote_id: String,
    pub job_id: String,
    pub node_id: String,
    pub total: f64,
    pub state: FillState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettlementReceipt {
    pub id: String,
    pub fill_id: String,
    pub pay_to_node: String,
    pub amount: f64,
    pub currency: String,
    pub status: SettlementStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketEvent {
    pub at: DateTime<Utc>,
    pub kind: EventKind,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NodeRole {
    Builder,
    Solver,
    Research,
    Render,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum TrustLevel {
    Public,
    Private,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Urgency {
    Low,
    Normal,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FillState {
    Proposed,
    Accepted,
    Settled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SettlementStatus {
    Pending,
    Ready,
    RecordedLocally,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventKind {
    NodeRegistered,
    JobQueued,
    QuoteCreated,
    FillCreated,
    SettlementPrepared,
    PolicyApplied,
}
