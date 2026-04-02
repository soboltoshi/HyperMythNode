use crate::constraints::{cooldown_is_active, missing_dependencies, validate_intents};
use crate::fallback::fallback_order;
use crate::receipts::make_receipt;
use crate::scorer::score_intent;
use crate::types::{OrderingDecision, OrderingIntent, PlanningContext, Rejection};
use std::collections::HashSet;

pub fn plan_batch(intents: &[OrderingIntent], ctx: &PlanningContext) -> OrderingDecision {
    let mut rejected = validate_intents(intents);
    let rejected_ids: HashSet<String> = rejected.iter().map(|r| r.id.clone()).collect();

    let valid: Vec<OrderingIntent> = intents
        .iter()
        .filter(|i| !rejected_ids.contains(&i.id))
        .cloned()
        .collect();

    let valid_ids: HashSet<String> = valid.iter().map(|i| i.id.clone()).collect();

    let mut scored: Vec<(OrderingIntent, i64)> = Vec::new();

    for intent in valid {
        if missing_dependencies(&intent, &valid_ids) {
            rejected.push(Rejection {
                id: intent.id.clone(),
                reason: "missing_dependency".to_string(),
            });
            continue;
        }

        let score = score_intent(&intent, cooldown_is_active(ctx, &intent.cooldown_key));
        if score < -100 {
            rejected.push(Rejection {
                id: intent.id.clone(),
                reason: "score_below_threshold".to_string(),
            });
            continue;
        }
        scored.push((intent, score));
    }

    scored.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.created_at_ms.cmp(&b.0.created_at_ms)));

    let mut budget_used = 0_i64;
    let mut accepted_now = Vec::new();
    let mut queued = Vec::new();
    let mut receipts = Vec::new();

    for (intent, score) in &scored {
        if budget_used + intent.compute_cost <= ctx.max_compute_budget {
            budget_used += intent.compute_cost;
            accepted_now.push(intent.id.clone());
            receipts.push(make_receipt(&intent.id, ctx.tick, *score));
        } else {
            queued.push(intent.id.clone());
        }
    }

    OrderingDecision {
        accepted_now,
        queued,
        rejected,
        fallback_order: fallback_order(intents),
        receipts,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{IntentKind, PlanningContext};
    use pretty_assertions::assert_eq;
    use serde_json::json;
    use std::collections::HashMap;

    fn sample(id: &str, compute_cost: i64, urgency: i64) -> OrderingIntent {
        OrderingIntent {
            id: id.to_string(),
            kind: IntentKind::Shell,
            actor_id: "actor-1".to_string(),
            created_at_ms: 1,
            priority_fee: 0,
            urgency,
            fairness_weight: 1,
            compute_cost,
            world_impact: 1,
            dependencies: vec![],
            cooldown_key: None,
            payload: json!({"action": "test"}),
        }
    }

    #[test]
    fn accepts_within_budget_and_queues_rest() {
        let intents = vec![sample("a", 2, 5), sample("b", 9, 4), sample("c", 2, 4)];
        let ctx = PlanningContext { tick: 1, max_compute_budget: 4, active_cooldowns: HashMap::new() };
        let decision = plan_batch(&intents, &ctx);
        assert_eq!(decision.accepted_now, vec!["a", "c"]);
        assert_eq!(decision.queued, vec!["b"]);
    }
}
