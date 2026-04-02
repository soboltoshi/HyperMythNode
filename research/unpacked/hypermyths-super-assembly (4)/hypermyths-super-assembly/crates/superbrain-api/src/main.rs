use std::{net::SocketAddr, path::PathBuf, sync::{Arc, Mutex}};

use anyhow::Result;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use superbrain_core::{load_whitelist_from_path, LocalExchange, MarketSnapshot, WhitelistConfig};
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    exchange: Arc<Mutex<LocalExchange>>,
}

#[derive(Debug, Deserialize)]
struct TickQuery {
    ticks: Option<u64>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let whitelist_path = std::env::var("SUPERBRAIN_WHITELIST")
        .ok()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("data/solana_whitelist.example.json"));

    let whitelist = load_whitelist_from_path(&whitelist_path).ok();
    let exchange = LocalExchange::new("mythiv-local-market", whitelist);

    let state = AppState {
        exchange: Arc::new(Mutex::new(exchange)),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/status", get(status))
        .route("/api/agents", get(agents))
        .route("/api/whitelist", get(whitelist))
        .route("/api/tick", post(tick))
        .route("/api/loop", post(loop_ticks))
        .route("/api/reset", post(reset_exchange))
        .route("/api/export/:name", post(export_snapshot))
        .with_state(state)
        .layer(CorsLayer::permissive());

    let addr: SocketAddr = std::env::var("SUPERBRAIN_API_ADDR")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or_else(|| "127.0.0.1:8787".parse().unwrap());

    println!("superbrain-api listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({"ok": true, "service": "superbrain-api"}))
}

async fn status(State(state): State<AppState>) -> Result<Json<MarketSnapshot>, ApiError> {
    let exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    Ok(Json(exchange.snapshot()))
}

async fn agents(State(state): State<AppState>) -> Result<Json<serde_json::Value>, ApiError> {
    let exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    let snapshot = exchange.snapshot();
    Ok(Json(serde_json::json!({
        "asimog": snapshot.asimog,
        "clawmog": snapshot.clawmog,
        "policy": snapshot.policy,
    })))
}

async fn whitelist(State(state): State<AppState>) -> Result<Json<Option<WhitelistConfig>>, ApiError> {
    let exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    Ok(Json(exchange.snapshot().whitelist))
}

async fn tick(State(state): State<AppState>) -> Result<Json<MarketSnapshot>, ApiError> {
    let mut exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    exchange.tick();
    Ok(Json(exchange.snapshot()))
}

async fn loop_ticks(
    State(state): State<AppState>,
    Query(query): Query<TickQuery>,
) -> Result<Json<MarketSnapshot>, ApiError> {
    let ticks = query.ticks.unwrap_or(5).max(1);
    let mut exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    exchange.run_ticks(ticks);
    Ok(Json(exchange.snapshot()))
}

async fn reset_exchange(State(state): State<AppState>) -> Result<Json<MarketSnapshot>, ApiError> {
    let current = {
        let exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
        exchange.snapshot()
    };

    let replacement = LocalExchange::new(current.market_id, current.whitelist);
    let mut exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    *exchange = replacement;
    Ok(Json(exchange.snapshot()))
}

async fn export_snapshot(
    Path(name): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let exchange = state.exchange.lock().map_err(|_| ApiError::lock())?;
    let snapshot = exchange.snapshot();
    let file_name = if name.ends_with(".json") { name } else { format!("{}.json", name) };
    let path = PathBuf::from("data").join(file_name);
    std::fs::create_dir_all("data").map_err(ApiError::io)?;
    let body = serde_json::to_string_pretty(&snapshot).map_err(ApiError::serde)?;
    std::fs::write(&path, body).map_err(ApiError::io)?;
    Ok(Json(serde_json::json!({"ok": true, "path": path.display().to_string()})))
}

struct ApiError {
    status: StatusCode,
    message: String,
}

impl ApiError {
    fn lock() -> Self {
        Self { status: StatusCode::INTERNAL_SERVER_ERROR, message: "exchange state lock poisoned".into() }
    }
    fn io(err: std::io::Error) -> Self {
        Self { status: StatusCode::INTERNAL_SERVER_ERROR, message: err.to_string() }
    }
    fn serde(err: serde_json::Error) -> Self {
        Self { status: StatusCode::INTERNAL_SERVER_ERROR, message: err.to_string() }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        (self.status, Json(serde_json::json!({"error": self.message}))).into_response()
    }
}
