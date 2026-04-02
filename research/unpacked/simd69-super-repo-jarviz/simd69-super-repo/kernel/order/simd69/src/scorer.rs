use crate::types::OrderingIntent;

pub fn score_intent(intent: &OrderingIntent, cooldown_active: bool) -> i64 {
    let cooldown_penalty = if cooldown_active { 100 } else { 0 };
    let dependency_penalty = if intent.dependencies.is_empty() { 0 } else { 0 };

    intent.urgency * 3
        + intent.fairness_weight * 2
        + intent.world_impact * 2
        + intent.priority_fee
        - intent.compute_cost * 2
        - cooldown_penalty
        - dependency_penalty
}
