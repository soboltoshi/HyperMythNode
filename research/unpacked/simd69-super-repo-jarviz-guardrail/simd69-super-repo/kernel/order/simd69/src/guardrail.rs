use crate::types::{OrderingIntent, Rejection};

const HIGH_RISK_PATTERNS: &[&str] = &[
    "prove i invented",
    "i invented",
    "world-changing formula",
    "they are watching me",
    "hidden message",
    "prophecy",
    "chosen one",
    "the ai agrees",
    "confirm my theory",
    "tell me i'm right",
    "validate my belief",
    "reality is bending",
    "everyone is lying",
    "secret signal",
    "psychic",
    "divine mission",
];

const EVIDENCE_REQUIRED_ACTIONS: &[&str] = &[
    "publish_claim",
    "broadcast_theory",
    "escalate_alert",
    "ban_actor",
    "market_halt",
    "spawn_agents",
];

fn payload_text(intent: &OrderingIntent) -> String {
    match &intent.payload {
        serde_json::Value::String(s) => s.to_lowercase(),
        serde_json::Value::Object(map) => map
            .values()
            .filter_map(|v| v.as_str())
            .collect::<Vec<_>>()
            .join(" ")
            .to_lowercase(),
        _ => String::new(),
    }
}

fn action_name(intent: &OrderingIntent) -> Option<&str> {
    intent.payload
        .get("action")
        .and_then(|v| v.as_str())
}

fn has_evidence(intent: &OrderingIntent) -> bool {
    intent.payload.get("evidence").is_some()
        || intent.payload.get("receipt_ids").is_some()
        || intent.payload.get("source_refs").is_some()
}

pub fn guardrail_rejection(intent: &OrderingIntent) -> Option<Rejection> {
    let text = payload_text(intent);

    if HIGH_RISK_PATTERNS.iter().any(|p| text.contains(p)) {
        return Some(Rejection {
            id: intent.id.clone(),
            reason: "guardrail_high_risk_belief_validation".to_string(),
        });
    }

    if let Some(action) = action_name(intent) {
        if EVIDENCE_REQUIRED_ACTIONS.contains(&action) && !has_evidence(intent) {
            return Some(Rejection {
                id: intent.id.clone(),
                reason: format!("guardrail_missing_evidence_for_{action}"),
            });
        }
    }

    if intent.kind == crate::types::IntentKind::Shell
        && text.contains("just trust me")
    {
        return Some(Rejection {
            id: intent.id.clone(),
            reason: "guardrail_unverifiable_shell_claim".to_string(),
        });
    }

    None
}
