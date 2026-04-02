use crate::types::OrderingIntent;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

fn stable_hash(input: &str) -> u64 {
    let mut h = DefaultHasher::new();
    input.hash(&mut h);
    h.finish()
}

pub fn fallback_order(intents: &[OrderingIntent]) -> Vec<String> {
    let mut cloned = intents.to_vec();
    cloned.sort_by_key(|i| (i.created_at_ms, stable_hash(&i.id)));
    cloned.into_iter().map(|i| i.id).collect()
}
