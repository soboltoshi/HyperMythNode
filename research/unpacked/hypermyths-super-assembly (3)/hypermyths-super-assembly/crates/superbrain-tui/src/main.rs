use std::{io, path::Path, time::Duration};

use anyhow::Result;
use crossterm::{
    event::{self, Event as CEvent, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    widgets::{Block, Borders, List, ListItem, Paragraph},
    Terminal,
};
use superbrain_core::{load_whitelist_from_path, LocalExchange, WhitelistConfig};

fn main() -> Result<()> {
    let whitelist = load_default_whitelist();

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut exchange = LocalExchange::new("mythiv-local-market", whitelist);

    loop {
        exchange.tick();
        let snapshot = exchange.snapshot();

        terminal.draw(|frame| {
            let vertical = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(3),
                    Constraint::Length(8),
                    Constraint::Min(10),
                ])
                .split(frame.area());

            let header = Paragraph::new("HyperMyths Compute Market | AsiMOG brain | ClawMOG shell | q = quit")
                .block(Block::default().borders(Borders::ALL).title("Operator Console"));
            frame.render_widget(header, vertical[0]);

            let metrics = Paragraph::new(format!(
                "tick={} whitelist={} traders={} nodes={} jobs={} quotes={} fills={} total={:.2} {}\nAsiMOG={} | ClawMOG={}\ncharter={}",
                snapshot.current_tick,
                snapshot.whitelist_enabled,
                snapshot.whitelisted_trader_count,
                snapshot.node_count,
                snapshot.job_count,
                snapshot.quote_count,
                snapshot.fill_count,
                snapshot.settlement_total,
                snapshot.quote_currency,
                snapshot.asimog.private_brain_role,
                snapshot.clawmog.frontend_role,
                snapshot.asimog.market_charter,
            ))
            .block(Block::default().borders(Borders::ALL).title("Market Summary"));
            frame.render_widget(metrics, vertical[1]);

            let bottom = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([
                    Constraint::Percentage(34),
                    Constraint::Percentage(33),
                    Constraint::Percentage(33),
                ])
                .split(vertical[2]);

            let nodes = List::new(
                snapshot
                    .nodes
                    .iter()
                    .map(|n| ListItem::new(format!("{} {:?} {}m @ {:.2}", n.id, n.role, n.available_minutes, n.price_floor_per_minute)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Nodes"));
            frame.render_widget(nodes, bottom[0]);

            let fills = List::new(
                snapshot
                    .fills
                    .iter()
                    .take(8)
                    .map(|f| ListItem::new(format!("{} -> {} total {:.2}", f.job_owner_address, f.node_operator_address, f.total)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Matched Fills"));
            frame.render_widget(fills, bottom[1]);

            let settlements = List::new(
                snapshot
                    .settlements
                    .iter()
                    .take(8)
                    .map(|s| ListItem::new(format!("{} pays {} {:.2}", s.payer, s.pay_to_node, s.amount)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Settlement Receipts"));
            frame.render_widget(settlements, bottom[2]);
        })?;

        if event::poll(Duration::from_millis(700))? {
            if let CEvent::Key(key) = event::read()? {
                if key.code == KeyCode::Char('q') {
                    break;
                }
            }
        }
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

fn load_default_whitelist() -> Option<WhitelistConfig> {
    let path = Path::new("data/solana_whitelist.example.json");
    load_whitelist_from_path(path).ok()
}
