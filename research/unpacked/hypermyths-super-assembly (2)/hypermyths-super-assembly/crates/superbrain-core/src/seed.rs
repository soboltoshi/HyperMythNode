use chrono::Utc;

use crate::types::*;

pub fn seed_market() -> MarketSnapshot {
    MarketSnapshot {
        market_id: "mythiv-local-market".to_string(),
        quote_currency: "COMPUTE_CREDIT".to_string(),
        generated_at: Utc::now(),
        node_count: 0,
        job_count: 0,
        quote_count: 0,
        fill_count: 0,
        settlement_total: 0.0,
        policy: BrainPolicy {
            mode: "private-superbrain".to_string(),
            private_bias: 0.10,
            urgency_multiplier_high: 1.35,
            urgency_multiplier_normal: 1.00,
            urgency_multiplier_low: 0.92,
            reliability_weight: 0.55,
        },
        nodes: vec![
            ComputeNode {
                id: "node-alpha".to_string(),
                role: NodeRole::Builder,
                available_minutes: 180,
                price_floor_per_minute: 0.28,
                reliability: 0.97,
                trust: TrustLevel::Private,
            },
            ComputeNode {
                id: "node-beta".to_string(),
                role: NodeRole::Solver,
                available_minutes: 240,
                price_floor_per_minute: 0.22,
                reliability: 0.91,
                trust: TrustLevel::Public,
            },
            ComputeNode {
                id: "node-gamma".to_string(),
                role: NodeRole::Research,
                available_minutes: 140,
                price_floor_per_minute: 0.31,
                reliability: 0.94,
                trust: TrustLevel::Private,
            },
            ComputeNode {
                id: "node-delta".to_string(),
                role: NodeRole::Render,
                available_minutes: 320,
                price_floor_per_minute: 0.19,
                reliability: 0.88,
                trust: TrustLevel::Public,
            },
        ],
        jobs: vec![
            ComputeJob {
                id: "job-001".to_string(),
                owner: "agent-mesh".to_string(),
                desired_role: NodeRole::Builder,
                requested_minutes: 45,
                max_budget: 18.0,
                urgency: Urgency::High,
                required_trust: TrustLevel::Private,
            },
            ComputeJob {
                id: "job-002".to_string(),
                owner: "world-directory".to_string(),
                desired_role: NodeRole::Research,
                requested_minutes: 30,
                max_budget: 12.0,
                urgency: Urgency::Normal,
                required_trust: TrustLevel::Private,
            },
            ComputeJob {
                id: "job-003".to_string(),
                owner: "hashmedia".to_string(),
                desired_role: NodeRole::Render,
                requested_minutes: 60,
                max_budget: 16.0,
                urgency: Urgency::Low,
                required_trust: TrustLevel::Public,
            },
        ],
        quotes: vec![],
        fills: vec![],
        settlements: vec![],
        events: vec![
            MarketEvent {
                at: Utc::now(),
                kind: EventKind::PolicyApplied,
                message: "Private superbrain policy seeded.".to_string(),
            },
        ],
    }
}
