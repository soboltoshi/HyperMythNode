mod state;
mod commands;

use std::{net::SocketAddr, sync::{Arc, Mutex}};
use axum::{extract::State, routing::{get, post}, Json, Router};
use commands::{apply_command, CommandEnvelope};
use state::AppState;

#[derive(Clone)]
struct SharedState(Arc<Mutex<AppState>>);

#[tokio::main]
async fn main() {
    let app_state = SharedState(Arc::new(Mutex::new(AppState::new())));

    let app = Router::new()
        .route("/health", get(health))
        .route("/snapshot", get(snapshot))
        .route("/command", post(command))
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8787));
    println!("HyperMythX kernel listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind TCP listener");

    axum::serve(listener, app)
        .await
        .expect("server failed");
}

async fn health() -> &'static str {
    "ok"
}

async fn snapshot(State(shared): State<SharedState>) -> Json<AppState> {
    let state = shared.0.lock().expect("state lock poisoned");
    Json(state.clone())
}

async fn command(
    State(shared): State<SharedState>,
    Json(cmd): Json<CommandEnvelope>,
) -> Json<AppState> {
    let mut state = shared.0.lock().expect("state lock poisoned");
    apply_command(&mut state, cmd);
    Json(state.clone())
}
