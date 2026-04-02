use crate::security::security_rejection;
use crate::types::{OrderingIntent, PlanningContext, Rejection};
use std::collections::HashSet;

pub fn validate_intents(intents: &[OrderingIntent]) -> Vec<Rejection> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();

    for intent in intents {
        if intent.id.trim().is_empty() {
            out.push(Rejection {
                id: intent.id.clone(),
                reason: "missing_id".to_string(),
            });
        }
        if !seen.insert(intent.id.clone()) {
            out.push(Rejection {
                id: intent.id.clone(),
                reason: "duplicate_id".to_string(),
            });
        }
        if intent.compute_cost < 0 {
            out.push(Rejection {
                id: intent.id.clone(),
                reason: "negative_compute_cost".to_string(),
            });
        }
        if let Some(rejection) = security_rejection(intent) {
            out.push(rejection);
        }
    }

    out
}

pub fn cooldown_is_active(ctx: &PlanningContext, key: &Option<String>) -> bool {
    match key {
        Some(k) => ctx.active_cooldowns.get(k).map(|until| *until > ctx.tick).unwrap_or(false),
        None => false,
    }
}

pub fn missing_dependencies(intent: &OrderingIntent, existing_ids: &HashSet<String>) -> bool {
    intent.dependencies.iter().any(|dep| !existing_ids.contains(dep))
}
