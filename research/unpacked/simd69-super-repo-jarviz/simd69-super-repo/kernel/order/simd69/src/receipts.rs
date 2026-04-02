use crate::types::Receipt;

pub fn make_receipt(intent_id: &str, tick: u64, score: i64) -> Receipt {
    Receipt {
        receipt_id: format!("rcpt:{}:{}", tick, intent_id),
        intent_id: intent_id.to_string(),
        tick,
        score,
    }
}
