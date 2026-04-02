use crate::types::{OrderingIntent, Rejection};

pub fn security_rejection(intent: &OrderingIntent) -> Option<Rejection> {
    if intent.actor_id.trim().is_empty() {
        return Some(Rejection {
            id: intent.id.clone(),
            reason: "missing_actor_id".to_string(),
        });
    }

    if intent.urgency < 0 {
        return Some(Rejection {
            id: intent.id.clone(),
            reason: "negative_urgency".to_string(),
        });
    }

    if intent.payload.get("admin_override").is_some() {
        return Some(Rejection {
            id: intent.id.clone(),
            reason: "forbidden_admin_override".to_string(),
        });
    }

    None
}
