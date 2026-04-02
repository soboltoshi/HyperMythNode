use chrono::Utc;

use crate::{seed_market, MarketEngine, MarketEvent, MarketSnapshot, EventKind};

#[derive(Debug, Clone)]
pub struct SuperbrainRuntime {
    market_id: String,
}

impl SuperbrainRuntime {
    pub fn new(market_id: impl Into<String>) -> Self {
        Self {
            market_id: market_id.into(),
        }
    }

    pub fn snapshot(&self) -> MarketSnapshot {
        let mut snapshot = seed_market();
        snapshot.market_id = self.market_id.clone();

        let quotes = MarketEngine::generate_quotes(&snapshot);
        let fills = MarketEngine::create_fills(&quotes);
        let settlements = MarketEngine::prepare_settlements(&fills, &snapshot.quote_currency);

        let mut events = snapshot.events.clone();
        events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::QuoteCreated,
            message: format!("Generated {} quotes.", quotes.len()),
        });
        events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::FillCreated,
            message: format!("Accepted {} fills.", fills.len()),
        });
        events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::SettlementPrepared,
            message: format!("Prepared {} local settlement receipts.", settlements.len()),
        });

        snapshot.quote_count = quotes.len();
        snapshot.fill_count = fills.len();
        snapshot.node_count = snapshot.nodes.len();
        snapshot.job_count = snapshot.jobs.len();
        snapshot.settlement_total = settlements.iter().map(|s| s.amount).sum();
        snapshot.quotes = quotes;
        snapshot.fills = fills;
        snapshot.settlements = settlements;
        snapshot.events = events;
        snapshot.generated_at = Utc::now();
        snapshot
    }
}
