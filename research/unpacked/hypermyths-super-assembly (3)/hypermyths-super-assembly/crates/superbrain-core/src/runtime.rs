use crate::{LocalExchange, MarketSnapshot, WhitelistConfig};

#[derive(Debug, Clone)]
pub struct SuperbrainRuntime {
    market_id: String,
    whitelist: Option<WhitelistConfig>,
}

impl SuperbrainRuntime {
    pub fn new(market_id: impl Into<String>) -> Self {
        Self {
            market_id: market_id.into(),
            whitelist: None,
        }
    }

    pub fn with_whitelist(mut self, whitelist: Option<WhitelistConfig>) -> Self {
        self.whitelist = whitelist;
        self
    }

    pub fn snapshot(&self) -> MarketSnapshot {
        let mut exchange = LocalExchange::new(self.market_id.clone(), self.whitelist.clone());
        exchange.tick();
        exchange.snapshot()
    }

    pub fn run_loop(&self, ticks: u64) -> MarketSnapshot {
        let mut exchange = LocalExchange::new(self.market_id.clone(), self.whitelist.clone());
        exchange.run_ticks(ticks);
        exchange.snapshot()
    }
}
