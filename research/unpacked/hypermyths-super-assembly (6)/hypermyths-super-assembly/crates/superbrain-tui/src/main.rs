use std::io;

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

    let runtime = SuperbrainRuntime::new("MYTHIV-PRIVATE-BRAIN");
    let snapshot = runtime.snapshot();
    let events = runtime.recent_events();

    loop {
        terminal.draw(|frame| {
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(3),
                    Constraint::Length(8),
                    Constraint::Min(10),
                ])
                .split(frame.area());

            let header = Paragraph::new(
                "HyperMyths Super Assembly | Private Superbrain | q = quit",
            )
            .block(Block::default().borders(Borders::ALL).title("Operator Console"));
            frame.render_widget(header, chunks[0]);

            let services_text = snapshot
                .services
                .iter()
                .map(|s| format!("{} [{}] - {}", s.name, s.status, s.detail))
                .collect::<Vec<_>>()
                .join("\n");

            let services = Paragraph::new(services_text)
                .block(Block::default().borders(Borders::ALL).title("Services"));
            frame.render_widget(services, chunks[1]);

            let bottom = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([Constraint::Percentage(50), Constraint::Percentage(50)])
                .split(chunks[2]);

            let tasks = List::new(
                snapshot
                    .tasks
                    .iter()
                    .map(|t| ListItem::new(format!("#{} {} ({})", t.id, t.name, t.owner)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Tasks"));
            frame.render_widget(tasks, bottom[0]);

            let event_list = List::new(
                events
                    .iter()
                    .map(|e| ListItem::new(format!("{:?}: {}", e.kind, e.message)))
                    .collect::<Vec<_>>(),
            )
            .block(Block::default().borders(Borders::ALL).title("Recent Events"));
            frame.render_widget(event_list, bottom[1]);
        })?;

        if event::poll(std::time::Duration::from_millis(250))? {
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
