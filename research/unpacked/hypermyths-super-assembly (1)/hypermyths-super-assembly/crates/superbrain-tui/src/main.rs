use std::{io, time::Duration};

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
use superbrain_core::SuperbrainRuntime;

fn main() -> Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let runtime = SuperbrainRuntime::new("mythiv-local-market");

    loop {
        let snapshot = runtime.snapshot();

        terminal.draw(|frame| {
            let vertical = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(3),
                    Constraint::Length(6),
                    Constraint::Min(10),
                ])
                .split(frame.area());

            let header = Paragraph::new("HyperMyths Computation Market | Rust TUI | q = quit")
                .block(Block::default().borders(Borders::ALL).title("Operator Console"));
            frame.render_widget(header, vertical[0]);

            let metrics = Paragraph::new(format!(
                "nodes={} jobs={} quotes={} fills={} settlement_total={:.2} {}",
                snapshot.node_count,
                snapshot.job_count,
                snapshot.quote_count,
                snapshot.fill_count,
                snapshot.settlement_total,
                snapshot.quote_currency,
            ))
            .block(Block::default().borders(Borders::ALL).title("Market Summary"));
            frame.render_widget(metrics, vertical[1]);

            let bottom = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([
                    Constraint::Percentage(33),
                    Constraint::Percentage(33),
                    Constraint::Percentage(34),
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

            let jobs = List::new(
                snapshot
                    .jobs
                    .iter()
                    .map(|j| ListItem::new(format!("{} {:?} {}m max {:.2}", j.id, j.desired_role, j.requested_minutes, j.max_budget)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Jobs"));
            frame.render_widget(jobs, bottom[1]);

            let quotes = List::new(
                snapshot
                    .quotes
                    .iter()
                    .take(8)
                    .map(|q| ListItem::new(format!("{} -> {} total {:.2} score {:.4}", q.job_id, q.node_id, q.ask_total, q.score)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Top Quotes"));
            frame.render_widget(quotes, bottom[2]);
        })?;

        if event::poll(Duration::from_millis(250))? {
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
