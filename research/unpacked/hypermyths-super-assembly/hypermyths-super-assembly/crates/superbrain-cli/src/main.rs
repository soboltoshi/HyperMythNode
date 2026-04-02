use anyhow::Result;
use clap::{Parser, Subcommand};
use superbrain_core::SuperbrainRuntime;
use tracing_subscriber::EnvFilter;

#[derive(Debug, Parser)]
#[command(name = "superbrain")]
#[command(about = "Private superbrain CLI for HyperMyths Super Assembly")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Status,
    Events,
    Tasks,
}

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let cli = Cli::parse();
    let runtime = SuperbrainRuntime::new("MYTHIV-PRIVATE-BRAIN");

    match cli.command {
        Commands::Status => {
            let snapshot = runtime.snapshot();
            println!("{}", serde_json::to_string_pretty(&snapshot)?);
        }
        Commands::Events => {
            let events = runtime.recent_events();
            println!("{}", serde_json::to_string_pretty(&events)?);
        }
        Commands::Tasks => {
            let snapshot = runtime.snapshot();
            println!("{}", serde_json::to_string_pretty(&snapshot.tasks)?);
        }
    }

    Ok(())
}
