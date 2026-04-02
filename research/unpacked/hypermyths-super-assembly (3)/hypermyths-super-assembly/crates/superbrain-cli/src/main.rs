use std::{fs, path::PathBuf};

use anyhow::Result;
use clap::{Parser, Subcommand};
use superbrain_core::{load_whitelist_from_path, SuperbrainRuntime};

#[derive(Debug, Parser)]
#[command(name = "superbrain")]
#[command(about = "AsiMOG computation market CLI for HyperMyths Super Assembly")]
struct Cli {
    #[arg(long)]
    whitelist: Option<PathBuf>,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Status,
    Agents,
    Nodes,
    Jobs,
    Quotes,
    Fills,
    Settlements,
    Loop { #[arg(long, default_value_t = 5)] ticks: u64 },
    Export { path: PathBuf, #[arg(long, default_value_t = 5)] ticks: u64 },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let whitelist = match cli.whitelist {
        Some(path) => Some(load_whitelist_from_path(&path).map_err(|e| anyhow::anyhow!(e.to_string()))?),
        None => None,
    };

    let runtime = SuperbrainRuntime::new("mythiv-local-market").with_whitelist(whitelist);

    match cli.command {
        Commands::Status => print_json(&runtime.snapshot())?,
        Commands::Agents => {
            let snapshot = runtime.snapshot();
            print_json(&serde_json::json!({
                "asimog": snapshot.asimog,
                "clawmog": snapshot.clawmog,
                "policy": snapshot.policy,
            }))?
        }
        Commands::Nodes => print_json(&runtime.snapshot().nodes)?,
        Commands::Jobs => print_json(&runtime.snapshot().jobs)?,
        Commands::Quotes => print_json(&runtime.snapshot().quotes)?,
        Commands::Fills => print_json(&runtime.snapshot().fills)?,
        Commands::Settlements => print_json(&runtime.snapshot().settlements)?,
        Commands::Loop { ticks } => print_json(&runtime.run_loop(ticks))?,
        Commands::Export { path, ticks } => {
            let body = serde_json::to_string_pretty(&runtime.run_loop(ticks))?;
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
