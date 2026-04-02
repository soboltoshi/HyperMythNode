use crate::types::*;

pub struct MarketEngine;

impl MarketEngine {
    pub fn generate_quotes(snapshot: &MarketSnapshot) -> Vec<Quote> {
        let mut quotes = Vec::new();

        for job in &snapshot.jobs {
            if let Some(whitelist) = &snapshot.whitelist {
                if !whitelist.allows_trader(&job.owner_address) {
                    continue;
                }
            }

            for node in &snapshot.nodes {
                if let Some(whitelist) = &snapshot.whitelist {
                    if !whitelist.allows_node(&node.operator_address) {
                        continue;
                    }
                }

                if node.role != job.desired_role {
                    continue;
                }
                if node.available_minutes < job.requested_minutes {
                    continue;
                }
                if node.trust < job.required_trust {
                    continue;
                }

                let urgency_multiplier = match job.urgency {
                    Urgency::High => snapshot.policy.urgency_multiplier_high,
                    Urgency::Normal => snapshot.policy.urgency_multiplier_normal,
                    Urgency::Low => snapshot.policy.urgency_multiplier_low,
                };

                let mut ask_total = node.price_floor_per_minute * f64::from(job.requested_minutes);
                ask_total *= urgency_multiplier;

                let private_bonus = match node.trust {
                    TrustLevel::Private => snapshot.policy.private_bias,
                    TrustLevel::Public => 0.0,
                };

                let affordability = if ask_total <= job.max_budget { 1.0 } else { 0.25 };
                let score = (node.reliability * snapshot.policy.reliability_weight)
                    + affordability
                    + private_bonus
                    - (ask_total / (job.max_budget.max(1.0) * 10.0));

                quotes.push(Quote {
                    id: format!("quote-{}-{}", job.id, node.id),
                    job_id: job.id.clone(),
                    job_owner_address: job.owner_address.clone(),
                    node_id: node.id.clone(),
                    node_operator_address: node.operator_address.clone(),
                    minutes: job.requested_minutes,
                    ask_total: round2(ask_total),
                    score: round4(score),
                    rationale: format!(
                        "role match, trust ok, urgency {:?}, reliability {:.2}",
                        job.urgency, node.reliability
                    ),
                });
            }
        }

        quotes.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        quotes
    }

    pub fn select_best_fills(quotes: &[Quote], tick: u64) -> Vec<Fill> {
        let mut fills = Vec::new();
        let mut used_jobs: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
        let mut used_nodes: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();

        for quote in quotes {
            if used_jobs.contains(&quote.job_id) || used_nodes.contains(&quote.node_id) {
                continue;
            }

            used_jobs.insert(quote.job_id.clone());
            used_nodes.insert(quote.node_id.clone());

            fills.push(Fill {
                id: format!("fill-{}-{:03}", tick, fills.len() + 1),
                quote_id: quote.id.clone(),
                job_id: quote.job_id.clone(),
                job_owner_address: quote.job_owner_address.clone(),
                node_id: quote.node_id.clone(),
                node_operator_address: quote.node_operator_address.clone(),
                total: quote.ask_total,
                tick_created: tick,
                state: FillState::Accepted,
            });
        }

        fills
    }

    pub fn prepare_settlements(fills: &[Fill], currency: &str, tick: u64) -> Vec<SettlementReceipt> {
        fills
            .iter()
            .enumerate()
            .map(|(idx, fill)| SettlementReceipt {
                id: format!("settlement-{}-{:03}", tick, idx + 1),
                fill_id: fill.id.clone(),
                pay_to_node: fill.node_operator_address.clone(),
                payer: fill.job_owner_address.clone(),
                amount: fill.total,
                currency: currency.to_string(),
                tick_prepared: tick,
                status: SettlementStatus::RecordedLocally,
            })
            .collect()
    }
}

fn round2(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

fn round4(value: f64) -> f64 {
    (value * 10000.0).round() / 10000.0
}
