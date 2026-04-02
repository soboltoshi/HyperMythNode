use std::{fs, path::PathBuf};

use anyhow::Result;
use clap::{Parser, Subcommand};
use superbrain_core::SuperbrainRuntime;

#[derive(Debug, Parser)]
#[command(name = "superbrain")]
#[command(about = "Computation market CLI for HyperMyths Super Assembly")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Status,
    Nodes,
    Jobs,
    Quotes,
    Fills,
    Settlements,
    Export { path: PathBuf },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let runtime = SuperbrainRuntime::new("mythiv-local-market");
    let snapshot = runtime.snapshot();

    match cli.command {
        Commands::Status => print_json(&snapshot)?,
        Commands::Nodes => print_json(&snapshot.nodes)?,
        Commands::Jobs => print_json(&snapshot.jobs)?,
        Commands::Quotes => print_json(&snapshot.quotes)?,
        Commands::Fills => print_json(&snapshot.fills)?,
        Commands::Settlements => print_json(&snapshot.settlements)?,
        Commands::Export { path } => {
            let body = serde_json::to_string_pretty(&snapshot)?;
            fs::write(&path, body)?;
            println!("exported snapshot to {}", path.display());
        }
    }

    Ok(())
}

fn print_json<T: serde::Serialize>(value: &T) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(value)?);
    Ok(())
}
