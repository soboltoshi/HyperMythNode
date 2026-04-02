use chrono::Utc;

use crate::{
    seed_market, EventKind, MarketEngine, MarketEvent, MarketSnapshot, SettlementReceipt,
    WhitelistConfig,
};

#[derive(Debug, Clone)]
pub struct LocalExchange {
    snapshot: MarketSnapshot,
}

impl LocalExchange {
    pub fn new(market_id: impl Into<String>, whitelist: Option<WhitelistConfig>) -> Self {
        let mut snapshot = seed_market();
        snapshot.market_id = market_id.into();
        snapshot.whitelist = whitelist;
        snapshot.whitelist_enabled = snapshot.whitelist.as_ref().map(|w| w.enabled).unwrap_or(false);
        snapshot.whitelisted_trader_count = snapshot
            .whitelist
            .as_ref()
            .map(|w| w.allowed_trader_addresses.len())
            .unwrap_or(0);
        Self { snapshot }
    }

    pub fn tick(&mut self) {
        self.snapshot.current_tick += 1;
        self.snapshot.generated_at = Utc::now();

        if self.snapshot.whitelist_enabled {
            self.snapshot.events.push(MarketEvent {
                at: Utc::now(),
                kind: EventKind::WhitelistApplied,
                message: format!(
                    "Whitelist active: {} traders, {} node operators.",
                    self.snapshot.whitelist.as_ref().map(|w| w.allowed_trader_addresses.len()).unwrap_or(0),
                    self.snapshot.whitelist.as_ref().map(|w| w.allowed_node_operator_addresses.len()).unwrap_or(0),
                ),
            });
        }

        let quotes = MarketEngine::generate_quotes(&self.snapshot);
        let fills = MarketEngine::select_best_fills(&quotes, self.snapshot.current_tick);
        let settlements = MarketEngine::prepare_settlements(
            &fills,
            &self.snapshot.quote_currency,
            self.snapshot.current_tick,
        );

        self.apply_fills(&quotes, &fills);
        self.record_events(&quotes, &fills, &settlements);

        self.snapshot.quote_count = quotes.len();
        self.snapshot.fill_count = fills.len();
        self.snapshot.node_count = self.snapshot.nodes.len();
        self.snapshot.job_count = self.snapshot.jobs.len();
        self.snapshot.settlement_total = settlements.iter().map(|s| s.amount).sum();
        self.snapshot.quotes = quotes;
        self.snapshot.fills = fills;
        self.snapshot.settlements = settlements;
    }

    pub fn run_ticks(&mut self, ticks: u64) {
        for _ in 0..ticks {
            self.tick();
        }
    }

    pub fn snapshot(&self) -> MarketSnapshot {
        self.snapshot.clone()
    }

    fn apply_fills(&mut self, quotes: &[crate::Quote], fills: &[crate::Fill]) {
        for fill in fills {
            if let Some(job) = self.snapshot.jobs.iter_mut().find(|j| j.id == fill.job_id) {
                job.requested_minutes = 0;
            }

            let minutes = quotes
                .iter()
                .find(|q| q.quote_id_matches(fill))
                .map(|q| q.minutes)
                .unwrap_or(0);

            if let Some(node) = self.snapshot.nodes.iter_mut().find(|n| n.id == fill.node_id) {
                node.available_minutes = node.available_minutes.saturating_sub(minutes);
            }
        }

        self.snapshot.jobs.retain(|j| j.requested_minutes > 0);
    }

    fn record_events(&mut self, quotes: &[crate::Quote], fills: &[crate::Fill], settlements: &[SettlementReceipt]) {
        self.snapshot.events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::TickAdvanced,
            message: format!("Advanced local exchange to tick {}.", self.snapshot.current_tick),
        });
        self.snapshot.events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::QuoteCreated,
            message: format!("Generated {} quotes.", quotes.len()),
        });
        self.snapshot.events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::FillCreated,
            message: format!("Created {} matched fills.", fills.len()),
        });
        self.snapshot.events.push(MarketEvent {
            at: Utc::now(),
            kind: EventKind::SettlementPrepared,
            message: format!("Prepared {} local settlement receipts.", settlements.len()),
        });
    }
}

trait QuoteMinutesLookup {
    fn quote_id_matches(&self, fill: &crate::Fill) -> bool;
}

impl QuoteMinutesLookup for crate::Quote {
    fn quote_id_matches(&self, fill: &crate::Fill) -> bool {
        self.id == fill.quote_id
    }
}
