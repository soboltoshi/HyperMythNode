use std::{
    fs,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    extract::{Path as AxumPath, State},
    http::StatusCode,
    response::{IntoResponse, Redirect},
    routing::{get, post},
    Json, Router,
};
use contactway_adapter::bridge::ContactwayBridge;
use lx_protocol::{
    AdapterRegistryEntry, AdapterRegistryResponse, AgentResult, CinemaExperimentRecord,
    CommandReceipt, CommandRequest, ContactwayConnectRequest, ContactwayIntentReceipt,
    ContactwayIntentRequest, ContactwayIntentSummary, ContactwayStatusResponse,
    GameOfLifeGenerateRequest, HealthResponse, ServiceEndpoints, ServiceManifestResponse,
    SnapshotResponse, StylePreset, SurfaceStatus, Surfaces, ThreeJsCardRequest,
    VideoGenerationJob, VideoGenerationRequest, VideoJobListResponse, VideoOutputManifest,
    VideoReportResponse, VideoSceneCard, VideoStudioCatalogResponse, VideoStudioPreset,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tower_http::cors::CorsLayer;

const DEFAULT_APP_BASE_URL: &str = "http://127.0.0.1:3000";
const DEFAULT_KERNEL_BASE_URL: &str = "http://127.0.0.1:8787";
const DEFAULT_HERMES_RUNTIME_URL: &str = "http://127.0.0.1:8799";
const DEFAULT_STATE_FILE: &str = "build/kernel/state.json";
const DEFAULT_CONTACTWAY_MODE: &str = "buttplug_ws";
const DEFAULT_CONTACTWAY_BRIDGE_URL: &str = "ws://127.0.0.1:12345";
const KERNEL_BIND: &str = "127.0.0.1:8787";

#[derive(Clone)]
struct AppState {
    app_base_url: String,
    kernel_base_url: String,
    hermes_runtime_url: String,
    manifest: ServiceManifestResponse,
    studios: Vec<VideoStudioPreset>,
    styles: Vec<StylePreset>,
    runtime: Arc<Mutex<KernelRuntime>>,
    state_file: Arc<PathBuf>,
    http_client: Client,
    contactway_default_mode: String,
    contactway_default_bridge_url: String,
    contactway_enabled_by_default: bool,
    contactway_bridge: Arc<tokio::sync::Mutex<ContactwayBridge>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct KernelRuntime {
    jobs: Vec<VideoGenerationJob>,
    cinema_experiments: Vec<CinemaExperimentRecord>,
    command_history: Vec<CommandAudit>,
    next_job_id: u64,
    next_receipt_id: u64,
    #[serde(default)]
    contactway: ContactwayRuntimeState,
    #[serde(default)]
    agent_results: Vec<AgentResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CommandAudit {
    receipt: String,
    command_kind: String,
    accepted: bool,
    note: String,
    created_at: String,
}

#[derive(Debug, Clone, Serialize)]
struct ApiError {
    code: String,
    message: String,
    fields: Vec<ApiFieldIssue>,
}

#[derive(Debug, Clone, Serialize)]
struct ApiFieldIssue {
    field: String,
    issue: String,
}

#[derive(Debug, Clone)]
struct CommandExecution {
    accepted: bool,
    note: String,
    complete_job_id: Option<String>,
    hermes_task: Option<HermesTaskRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HermesTaskRequest {
    role: String,
    instruction: String,
    metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ContactwayRuntimeState {
    enabled: bool,
    connected: bool,
    mode: String,
    bridge_url: String,
    updated_at: String,
    last_error: Option<String>,
    last_intent: Option<ContactwayIntentSummary>,
}

impl Default for ContactwayRuntimeState {
    fn default() -> Self {
        Self {
            enabled: false,
            connected: false,
            mode: DEFAULT_CONTACTWAY_MODE.to_string(),
            bridge_url: DEFAULT_CONTACTWAY_BRIDGE_URL.to_string(),
            updated_at: "0".to_string(),
            last_error: None,
            last_intent: None,
        }
    }
}

#[tokio::main]
async fn main() {
    let app_base_url =
        std::env::var("APP_BASE_URL").unwrap_or_else(|_| DEFAULT_APP_BASE_URL.to_string());
    let kernel_base_url =
        std::env::var("KERNEL_BASE_URL").unwrap_or_else(|_| DEFAULT_KERNEL_BASE_URL.to_string());
    let hermes_runtime_url = std::env::var("HERMES_RUNTIME_URL")
        .unwrap_or_else(|_| DEFAULT_HERMES_RUNTIME_URL.to_string());
    let contactway_default_mode =
        std::env::var("CONTACTWAY_MODE").unwrap_or_else(|_| DEFAULT_CONTACTWAY_MODE.to_string());
    let contactway_default_bridge_url = std::env::var("CONTACTWAY_BRIDGE_URL")
        .unwrap_or_else(|_| DEFAULT_CONTACTWAY_BRIDGE_URL.to_string());
    let contactway_enabled_by_default = env_bool("CONTACTWAY_ENABLED", false);
    let state_file = std::env::var("KERNEL_STATE_FILE")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(DEFAULT_STATE_FILE));

    let studios = hypercinema_studios();
    let styles = style_presets();
    let manifest = service_manifest(&app_base_url, &studios, &styles);

    let mut runtime = load_runtime(&state_file).unwrap_or_else(|error| {
        eprintln!(
            "failed to load state file '{}': {error}",
            state_file.display()
        );
        KernelRuntime::default()
    });
    normalize_runtime_counters(&mut runtime);
    normalize_contactway_runtime(
        &mut runtime,
        &contactway_default_mode,
        &contactway_default_bridge_url,
        contactway_enabled_by_default,
    );

    let state = AppState {
        app_base_url,
        kernel_base_url,
        hermes_runtime_url,
        manifest,
        studios,
        styles,
        runtime: Arc::new(Mutex::new(runtime)),
        state_file: Arc::new(state_file),
        http_client: Client::new(),
        contactway_default_mode,
        contactway_default_bridge_url,
        contactway_enabled_by_default,
        contactway_bridge: Arc::new(tokio::sync::Mutex::new(ContactwayBridge::new())),
    };

    if let Ok(runtime) = with_runtime(&state, |runtime| runtime.clone()) {
        if let Err(error) = persist_state(&state.state_file, &runtime) {
            eprintln!("failed to persist initial kernel state: {error}");
        }
    }

    let app = build_router(state);

    let listener = tokio::net::TcpListener::bind(KERNEL_BIND)
        .await
        .expect("failed to bind kernel listener");

    println!("lx-core listening on http://{KERNEL_BIND}");

    axum::serve(listener, app)
        .await
        .expect("kernel server exited unexpectedly");
}

fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/snapshot", get(snapshot))
        .route("/command", post(command))
        .route("/api/service", get(get_service_manifest))
        .route("/api/studios", get(get_studios))
        .route("/api/jobs", get(list_jobs).post(create_job))
        .route("/api/jobs/{job_id}", get(get_job))
        .route("/api/report/{job_id}", get(get_report))
        .route("/api/video/{job_id}", get(get_video_preview))
        .route("/api/contactway/status", get(get_contactway_status))
        .route("/api/contactway/connect", post(contactway_connect))
        .route("/api/contactway/disconnect", post(contactway_disconnect))
        .route("/api/contactway/intent", post(contactway_intent))
        .route("/api/adapters", get(get_adapters))
        .route(
            "/api/adapters/game-of-life/generate",
            post(adapter_game_of_life_generate),
        )
        .route(
            "/api/adapters/threejs/card-descriptor",
            post(adapter_threejs_card_descriptor),
        )
        .with_state(state)
        .layer(CorsLayer::permissive())
}

async fn health() -> impl IntoResponse {
    Json(HealthResponse {
        ok: true,
        product: "Last Experiments".to_string(),
        release_focus: "Meta Quest 3 proper VR + mixed reality".to_string(),
    })
}

async fn snapshot(State(state): State<AppState>) -> impl IntoResponse {
    let (experiments, agent_results) = with_runtime(&state, |runtime| {
        (
            runtime.cinema_experiments.clone(),
            runtime.agent_results.clone(),
        )
    })
    .unwrap_or_default();

    Json(SnapshotResponse {
        world_name: "Last Experiments".to_string(),
        world_bounds: [42, 42, 16],
        active_agents: 0,
        release_focus: "Meta Quest 3 proper VR + mixed reality".to_string(),
        surfaces: Surfaces {
            vr: SurfaceStatus {
                name: "Quest 3".to_string(),
                status: "priority".to_string(),
            },
            web: SurfaceStatus {
                name: "operator + webcam lab + HyperCinema".to_string(),
                status: "secondary".to_string(),
            },
            mobile: SurfaceStatus {
                name: "companion".to_string(),
                status: "later".to_string(),
            },
        },
        experiments,
        agent_results,
    })
}

async fn get_service_manifest(State(state): State<AppState>) -> impl IntoResponse {
    Json(state.manifest)
}

async fn get_studios(State(state): State<AppState>) -> impl IntoResponse {
    Json(VideoStudioCatalogResponse {
        studios: state.studios,
    })
}

async fn get_contactway_status(
    State(state): State<AppState>,
) -> Result<Json<ContactwayStatusResponse>, StatusCode> {
    with_runtime(&state, |runtime| {
        Json(contactway_status_response(&state, runtime))
    })
}

async fn contactway_connect(
    State(state): State<AppState>,
    Json(request): Json<ContactwayConnectRequest>,
) -> impl IntoResponse {
    let mode = request
        .mode
        .as_deref()
        .unwrap_or(state.contactway_default_mode.as_str())
        .trim()
        .to_lowercase();
    let bridge_url = request
        .bridge_url
        .as_deref()
        .unwrap_or(state.contactway_default_bridge_url.as_str())
        .trim()
        .to_string();
    let enabled = request.enabled.unwrap_or(true);

    if !is_supported_contactway_mode(&mode) {
        let error = ApiError::invalid(
            "invalid_contactway_mode",
            "Unsupported contactway mode.",
            vec![field_issue(
                "mode",
                "must be one of: buttplug_ws, intiface_engine, intiface_central, custom",
            )],
        );
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    if !is_valid_contactway_bridge_url(&bridge_url) {
        let error = ApiError::invalid(
            "invalid_contactway_bridge_url",
            "Bridge URL must include a transport scheme.",
            vec![field_issue(
                "bridge_url",
                "must start with ws://, wss://, http://, or https://",
            )],
        );
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    // Attempt actual WebSocket connection to buttplug server (best-effort)
    let bridge_error = if enabled {
        match state.contactway_bridge.lock().await.connect(&bridge_url).await {
            Ok(()) => None,
            Err(e) => {
                eprintln!("contactway bridge connect warning: {e}");
                Some(e)
            }
        }
    } else {
        None
    };

    match with_runtime_mut(&state, |runtime| {
        runtime.contactway.enabled = enabled;
        runtime.contactway.connected = enabled;
        runtime.contactway.mode = mode.clone();
        runtime.contactway.bridge_url = bridge_url.clone();
        runtime.contactway.last_error = bridge_error;
        runtime.contactway.updated_at = timestamp_string();
        contactway_status_response(&state, runtime)
    }) {
        Ok(status) => (StatusCode::OK, Json(status)).into_response(),
        Err(status) => status.into_response(),
    }
}

async fn contactway_disconnect(State(state): State<AppState>) -> impl IntoResponse {
    let _ = state.contactway_bridge.lock().await.disconnect().await;

    match with_runtime_mut(&state, |runtime| {
        runtime.contactway.connected = false;
        runtime.contactway.enabled = false;
        runtime.contactway.updated_at = timestamp_string();
        contactway_status_response(&state, runtime)
    }) {
        Ok(status) => (StatusCode::OK, Json(status)).into_response(),
        Err(status) => status.into_response(),
    }
}

async fn contactway_intent(
    State(state): State<AppState>,
    Json(request): Json<ContactwayIntentRequest>,
) -> impl IntoResponse {
    if let Some(error) = validate_contactway_intent_request(&request) {
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    let receipt = match with_runtime_mut(&state, |runtime| {
        apply_contactway_intent(runtime, request.clone())
    }) {
        Ok(receipt) => receipt,
        Err(status) => return status.into_response(),
    };

    // Forward accepted intents to the actual buttplug bridge
    if receipt.accepted {
        let bridge_intent = contactway_adapter::ContactwayIntent {
            source_surface: request.source_surface.clone(),
            channel: request.channel.clone(),
            pattern: request.pattern.clone(),
            intensity: request.intensity,
            duration_ms: request.duration_ms,
            context: request.context.clone(),
        };
        let device_result = state
            .contactway_bridge
            .lock()
            .await
            .send_intent(&bridge_intent)
            .await;
        if !device_result.forwarded {
            eprintln!(
                "contactway bridge: intent accepted by kernel but not forwarded to device: {}",
                device_result.note
            );
        }
    }

    let status = if receipt.accepted {
        StatusCode::OK
    } else {
        StatusCode::CONFLICT
    };
    (status, Json(receipt)).into_response()
}

async fn list_jobs(State(state): State<AppState>) -> impl IntoResponse {
    if refresh_job_lifecycle(&state).is_err() {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    match with_runtime(&state, |runtime| runtime.jobs.clone()) {
        Ok(jobs) => Json(VideoJobListResponse { jobs }).into_response(),
        Err(status) => status.into_response(),
    }
}

async fn create_job(
    State(state): State<AppState>,
    Json(request): Json<VideoGenerationRequest>,
) -> impl IntoResponse {
    if let Some(error) = validate_video_request(&request, &state.studios, &state.styles) {
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    let job = match with_runtime_mut(&state, |runtime| {
        let job_index = runtime.next_job_id.max(1);
        runtime.next_job_id = job_index + 1;
        let job = assemble_job(&state, request.clone(), job_index);
        runtime.jobs.insert(0, job.clone());
        job
    }) {
        Ok(job) => job,
        Err(status) => return status.into_response(),
    };

    (StatusCode::CREATED, Json(job)).into_response()
}

async fn get_job(
    State(state): State<AppState>,
    AxumPath(job_id): AxumPath<String>,
) -> Result<Json<VideoGenerationJob>, StatusCode> {
    refresh_job_lifecycle(&state)?;

    with_runtime(&state, |runtime| {
        runtime
            .jobs
            .iter()
            .find(|job| job.job_id == job_id)
            .cloned()
    })?
    .map(Json)
    .ok_or(StatusCode::NOT_FOUND)
}

async fn get_report(
    State(state): State<AppState>,
    AxumPath(job_id): AxumPath<String>,
) -> Result<Json<VideoReportResponse>, StatusCode> {
    refresh_job_lifecycle(&state)?;

    let job = with_runtime(&state, |runtime| {
        runtime
            .jobs
            .iter()
            .find(|job| job.job_id == job_id)
            .cloned()
    })?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(VideoReportResponse {
        job_id: job.job_id.clone(),
        title: job.project_title.clone(),
        summary: job.summary.clone(),
        scene_cards: job.scene_cards.clone(),
        output: job.output.clone(),
    }))
}

async fn get_video_preview(
    State(state): State<AppState>,
    AxumPath(job_id): AxumPath<String>,
) -> Result<Redirect, StatusCode> {
    refresh_job_lifecycle(&state)?;

    let job = with_runtime(&state, |runtime| {
        runtime
            .jobs
            .iter()
            .find(|job| job.job_id == job_id)
            .cloned()
    })?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Redirect::temporary(&job.output.preview_url))
}
// ---------------------------------------------------------------------------
// Adapter endpoints
// ---------------------------------------------------------------------------

async fn get_adapters(State(state): State<AppState>) -> impl IntoResponse {
    let contactway_connected = state.contactway_bridge.lock().await.is_connected().await;
    let contactway_status = if contactway_connected {
        "connected"
    } else {
        "available"
    };

    Json(AdapterRegistryResponse {
        adapters: vec![
            AdapterRegistryEntry {
                name: "GameOfLifeAdapter".to_string(),
                kind: "voxel-generator".to_string(),
                status: "active".to_string(),
                last_call_at: None,
            },
            AdapterRegistryEntry {
                name: "ThreeJsVideoAdapter".to_string(),
                kind: "card-descriptor".to_string(),
                status: "active".to_string(),
                last_call_at: None,
            },
            AdapterRegistryEntry {
                name: "ContactwayAdapter".to_string(),
                kind: "haptics-bridge".to_string(),
                status: contactway_status.to_string(),
                last_call_at: None,
            },
            AdapterRegistryEntry {
                name: "HyperCinemaAdapter".to_string(),
                kind: "video-generation".to_string(),
                status: "active".to_string(),
                last_call_at: None,
            },
            AdapterRegistryEntry {
                name: "SolanaAgentKitAdapter".to_string(),
                kind: "blockchain-bridge".to_string(),
                status: "configured".to_string(),
                last_call_at: None,
            },
        ],
    })
}

async fn adapter_game_of_life_generate(
    Json(request): Json<GameOfLifeGenerateRequest>,
) -> impl IntoResponse {
    let gol_request = game_of_life_adapter::GameOfLifeRequest {
        width: request.width,
        height: request.height,
        depth: request.depth,
        steps: request.steps,
        seed_density: request.seed_density,
        random_seed: request.random_seed,
    };

    let result = game_of_life_adapter::generate(&gol_request);
    Json(result)
}

async fn adapter_threejs_card_descriptor(
    Json(request): Json<ThreeJsCardRequest>,
) -> impl IntoResponse {
    let card_request = threejs_adapter::CardDescriptorRequest {
        token_address: request.token_address,
        style_preset: request.style_preset,
        world_size: request.world_size,
        request_summary: request.request_summary,
    };

    let descriptor = threejs_adapter::build_card_descriptor(&card_request);
    Json(descriptor)
}

// ---------------------------------------------------------------------------
// Command handling
// ---------------------------------------------------------------------------

async fn command(
    State(state): State<AppState>,
    Json(request): Json<CommandRequest>,
) -> impl IntoResponse {
    let command_kind = request.kind.trim().to_string();
    if command_kind.is_empty() {
        let error = ApiError::invalid(
            "invalid_command",
            "Command kind is required.",
            vec![field_issue("kind", "must not be empty")],
        );
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    let payload = match request.payload.as_object() {
        Some(object) => object,
        None => {
            let error = ApiError::invalid(
                "invalid_command",
                "Command payload must be a JSON object.",
                vec![field_issue("payload", "must be an object")],
            );
            return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
        }
    };

    let execution = execute_command(&command_kind, payload);

    let receipt = match with_runtime_mut(&state, |runtime| {
        if let Some(job_id) = execution.complete_job_id.as_ref() {
            mark_job_done(runtime, job_id);
        }

        let mut accepted = execution.accepted;
        let mut note = execution.note.clone();
        if command_kind == "contactway.intent" {
            let contactway_receipt = apply_contactway_intent_from_command(runtime, payload);
            accepted = contactway_receipt.accepted;
            note = contactway_receipt.note;
        }

        let next_receipt_id = runtime.next_receipt_id.max(1);
        let receipt_id = format!("rcpt-{next_receipt_id:06}-{}", timestamp_string());
        runtime.next_receipt_id = next_receipt_id + 1;

        runtime.command_history.insert(
            0,
            CommandAudit {
                receipt: receipt_id.clone(),
                command_kind: command_kind.clone(),
                accepted,
                note: note.clone(),
                created_at: timestamp_string(),
            },
        );

        upsert_cinema_experiment(runtime, &command_kind, payload, &receipt_id, accepted);
        store_agent_result(runtime, &command_kind, payload, accepted);

        CommandReceipt {
            accepted,
            command_kind: command_kind.clone(),
            receipt: receipt_id,
            note,
        }
    }) {
        Ok(receipt) => receipt,
        Err(status) => return status.into_response(),
    };

    if let Some(task_request) = execution.hermes_task.as_ref() {
        if let Err(error) = enqueue_hermes_task(&state, task_request).await {
            eprintln!("failed to enqueue Hermes task: {error}");
        }
    }

    (StatusCode::OK, Json(receipt)).into_response()
}

fn execute_command(kind: &str, payload: &serde_json::Map<String, Value>) -> CommandExecution {
    let surface = payload
        .get("surface")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim();
    let intent = payload
        .get("intent")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim();
    let note = payload
        .get("note")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim();

    match kind {
        "quest3.stage.ready" => {
            if surface != "quest3" {
                return CommandExecution {
                    accepted: false,
                    note: "quest3.stage.ready requires payload.surface = 'quest3'".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            CommandExecution {
                accepted: true,
                note: "Quest stage ready signal accepted.".to_string(),
                complete_job_id: None,
                hermes_task: None,
            }
        }
        "quest3.stage.command" => {
            if surface != "quest3" {
                return CommandExecution {
                    accepted: false,
                    note: "quest3.stage.command requires payload.surface = 'quest3'".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            if intent.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "quest3.stage.command requires payload.intent".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            CommandExecution {
                accepted: true,
                note: format!("Quest stage command accepted for intent '{intent}'."),
                complete_job_id: None,
                hermes_task: None,
            }
        }
        "quest3.voice.command" => {
            if surface != "quest3" {
                return CommandExecution {
                    accepted: false,
                    note: "quest3.voice.command requires payload.surface = 'quest3'".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            let transcript = payload
                .get("transcript")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();

            if transcript.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "quest3.voice.command requires payload.transcript".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            let confidence = payload
                .get("confidence")
                .and_then(Value::as_f64)
                .unwrap_or(1.0);
            let source = payload
                .get("source")
                .and_then(Value::as_str)
                .unwrap_or("quest3-voice");
            let route = payload
                .get("route")
                .and_then(Value::as_str)
                .unwrap_or("voice transcript");

            let instruction = format!(
                "Quest voice instruction from {source}:\n{transcript}\n\nRoute summary:\n{route}"
            );

            CommandExecution {
                accepted: true,
                note: format!("Quest voice command accepted ({confidence:.2} confidence)."),
                complete_job_id: None,
                hermes_task: Some(HermesTaskRequest {
                    role: "interpreter".to_string(),
                    instruction,
                    metadata: serde_json::json!({
                        "surface": "quest3",
                        "source": source,
                        "confidence": confidence,
                        "route": route,
                        "transcript": transcript,
                    }),
                }),
            }
        }
        "CreateCinemaExperiment" => {
            let token_address = payload
                .get("token_address")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let chain = payload
                .get("chain")
                .and_then(Value::as_str)
                .unwrap_or("auto")
                .trim();
            let package_type = payload
                .get("package_type")
                .and_then(Value::as_str)
                .unwrap_or("1d")
                .trim();
            let style_preset = payload
                .get("style_preset")
                .and_then(Value::as_str)
                .unwrap_or("hyperflow_assembly")
                .trim();
            let creative_prompt = payload
                .get("creative_prompt")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let payment_route = payload
                .get("payment_route")
                .and_then(Value::as_str)
                .unwrap_or("sol_direct")
                .trim();

            if token_address.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "CreateCinemaExperiment requires payload.token_address".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            let instruction = format!(
                "Dispatch HyperCinema experiment for token {token_address}\nchain: {chain}\npackage: {package_type}\nstyle: {style_preset}\npayment: {payment_route}\nprompt: {creative_prompt}"
            );

            CommandExecution {
                accepted: true,
                note: format!(
                    "CreateCinemaExperiment accepted for token '{token_address}' ({package_type}, {style_preset})."
                ),
                complete_job_id: None,
                hermes_task: Some(HermesTaskRequest {
                    role: "hypercinema-delegate".to_string(),
                    instruction,
                    metadata: serde_json::json!({
                        "surface": surface,
                        "source": payload.get("source").and_then(Value::as_str).unwrap_or("creator-shell"),
                        "token_address": token_address,
                        "chain": if chain.is_empty() { "auto" } else { chain },
                        "package_type": if package_type == "2d" { "2d" } else { "1d" },
                        "style_preset": if style_preset.is_empty() { "hyperflow_assembly" } else { style_preset },
                        "creative_prompt": creative_prompt,
                        "payment_route": if payment_route == "x402_usdc" { "x402_usdc" } else { "sol_direct" },
                    }),
                }),
            }
        }
        "hypercinema.job.ready" => {
            let complete_job_id = payload
                .get("job_id")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(ToOwned::to_owned);

            let message = if let Some(job_id) = complete_job_id.as_ref() {
                format!("HyperCinema ready signal accepted for {job_id}.")
            } else if !note.is_empty() {
                format!("HyperCinema ready signal accepted ({note}).")
            } else {
                "HyperCinema ready signal accepted.".to_string()
            };

            CommandExecution {
                accepted: true,
                note: message,
                complete_job_id,
                hermes_task: None,
            }
        }
        "contactway.intent" => {
            if surface.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "contactway.intent requires payload.surface".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            let channel = payload
                .get("channel")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let pattern = payload
                .get("pattern")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let intensity = payload
                .get("intensity")
                .and_then(Value::as_f64)
                .unwrap_or(0.6);
            let duration_ms = payload
                .get("duration_ms")
                .and_then(Value::as_u64)
                .unwrap_or(220);

            if channel.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "contactway.intent requires payload.channel".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            if pattern.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "contactway.intent requires payload.pattern".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            if !(0.0..=1.0).contains(&intensity) {
                return CommandExecution {
                    accepted: false,
                    note: "contactway.intent payload.intensity must be between 0.0 and 1.0"
                        .to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            if duration_ms > 20_000 {
                return CommandExecution {
                    accepted: false,
                    note: "contactway.intent payload.duration_ms must be <= 20000".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            CommandExecution {
                accepted: true,
                note: format!(
                    "Contactway intent accepted for channel '{channel}' pattern '{pattern}'."
                ),
                complete_job_id: None,
                hermes_task: None,
            }
        }
        "agent.task.result" => {
            let task_id = payload
                .get("task_id")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let role = payload
                .get("role")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let result_type = payload
                .get("result_type")
                .and_then(Value::as_str)
                .unwrap_or("text")
                .trim();

            if task_id.is_empty() {
                return CommandExecution {
                    accepted: false,
                    note: "agent.task.result requires payload.task_id".to_string(),
                    complete_job_id: None,
                    hermes_task: None,
                };
            }

            CommandExecution {
                accepted: true,
                note: format!("Agent result accepted for task '{task_id}' role '{role}' type '{result_type}'."),
                complete_job_id: None,
                hermes_task: None,
            }
        }
        "adapter.game_of_life.generate" | "adapter.threejs.build_card" => {
            CommandExecution {
                accepted: true,
                note: format!("Adapter command '{kind}' accepted. Use the /api/adapters/ endpoints for direct access."),
                complete_job_id: None,
                hermes_task: None,
            }
        }
        _ => CommandExecution {
            accepted: false,
            note: format!("Unsupported command kind '{kind}'."),
            complete_job_id: None,
            hermes_task: None,
        },
    }
}

async fn enqueue_hermes_task(state: &AppState, request: &HermesTaskRequest) -> Result<(), String> {
    let response = state
        .http_client
        .post(format!(
            "{}/tasks",
            state.hermes_runtime_url.trim_end_matches('/')
        ))
        .json(&serde_json::json!({
            "role": request.role,
            "instruction": request.instruction,
            "metadata": request.metadata,
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Hermes runtime rejected task: {} {}", status, body));
    }

    Ok(())
}

fn mark_job_done(runtime: &mut KernelRuntime, job_id: &str) {
    for job in &mut runtime.jobs {
        if job.job_id == job_id {
            job.status = "done".to_string();
            job.updated_at = timestamp_string();
            if !job.summary.contains("Render complete") {
                job.summary = format!("{} Render complete.", job.summary);
            }
            return;
        }
    }
}

fn upsert_cinema_experiment(
    runtime: &mut KernelRuntime,
    command_kind: &str,
    payload: &serde_json::Map<String, Value>,
    receipt_id: &str,
    accepted: bool,
) {
    if !accepted {
        return;
    }

    match command_kind {
        "CreateCinemaExperiment" => {
            let token_address = payload
                .get("token_address")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();

            if token_address.is_empty() {
                return;
            }

            runtime.cinema_experiments.insert(
                0,
                CinemaExperimentRecord {
                    experiment_id: receipt_id.to_string(),
                    experiment_type: "CinemaExperiment".to_string(),
                    token_address: token_address.to_string(),
                    status: "pending".to_string(),
                    video_url: None,
                    job_id: None,
                },
            );
        }
        "hypercinema.job.ready" => {
            let experiment_id = payload
                .get("experiment_id")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let job_id = payload
                .get("job_id")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let token_address = payload
                .get("token_address")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();
            let video_url = payload
                .get("video_url")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim();

            let target = if !experiment_id.is_empty() {
                runtime
                    .cinema_experiments
                    .iter_mut()
                    .find(|record| record.experiment_id == experiment_id)
            } else if !job_id.is_empty() {
                runtime
                    .cinema_experiments
                    .iter_mut()
                    .find(|record| record.job_id.as_deref() == Some(job_id))
            } else {
                None
            };

            if let Some(record) = target {
                record.status = "complete".to_string();
                if !job_id.is_empty() {
                    record.job_id = Some(job_id.to_string());
                }
                if !video_url.is_empty() {
                    record.video_url = Some(video_url.to_string());
                }
                return;
            }

            runtime.cinema_experiments.insert(
                0,
                CinemaExperimentRecord {
                    experiment_id: if !experiment_id.is_empty() {
                        experiment_id.to_string()
                    } else {
                        receipt_id.to_string()
                    },
                    experiment_type: "CinemaExperiment".to_string(),
                    token_address: token_address.to_string(),
                    status: "complete".to_string(),
                    video_url: if video_url.is_empty() {
                        None
                    } else {
                        Some(video_url.to_string())
                    },
                    job_id: if job_id.is_empty() {
                        None
                    } else {
                        Some(job_id.to_string())
                    },
                },
            );
        }
        _ => {}
    }
}

fn store_agent_result(
    runtime: &mut KernelRuntime,
    command_kind: &str,
    payload: &serde_json::Map<String, Value>,
    accepted: bool,
) {
    if command_kind != "agent.task.result" || !accepted {
        return;
    }

    let task_id = payload
        .get("task_id")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let role = payload
        .get("role")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let result_type = payload
        .get("result_type")
        .and_then(Value::as_str)
        .unwrap_or("text")
        .trim()
        .to_string();
    let data = payload
        .get("data")
        .cloned()
        .unwrap_or(Value::Null);

    runtime.agent_results.insert(
        0,
        AgentResult {
            task_id,
            role,
            result_type,
            data,
            timestamp: timestamp_string(),
        },
    );

    // Keep only the last 50 results
    runtime.agent_results.truncate(50);
}

fn contactway_status_response(
    state: &AppState,
    runtime: &KernelRuntime,
) -> ContactwayStatusResponse {
    let mode = if runtime.contactway.mode.trim().is_empty() {
        state.contactway_default_mode.clone()
    } else {
        runtime.contactway.mode.trim().to_string()
    };
    let bridge_url = if runtime.contactway.bridge_url.trim().is_empty() {
        state.contactway_default_bridge_url.clone()
    } else {
        runtime.contactway.bridge_url.trim().to_string()
    };

    let default_note = if state.contactway_enabled_by_default {
        "Kernel default is to start with contactway enabled."
    } else {
        "Kernel default is to start with contactway disabled."
    };

    ContactwayStatusResponse {
        adapter: "ContactwayAdapter-v1-native".to_string(),
        mode,
        bridge_url,
        enabled: runtime.contactway.enabled,
        connected: runtime.contactway.connected,
        updated_at: runtime.contactway.updated_at.clone(),
        last_error: runtime.contactway.last_error.clone(),
        last_intent: runtime.contactway.last_intent.clone(),
        integration_notes: vec![
            "Native contract over Intiface/Buttplug; no blind import of process injection."
                .to_string(),
            "Desktop/web/VR all route through kernel contactway interfaces.".to_string(),
            "Bridge URL can target Intiface Engine or Intiface Central websocket services."
                .to_string(),
            default_note.to_string(),
        ],
    }
}

fn apply_contactway_intent_from_command(
    runtime: &mut KernelRuntime,
    payload: &serde_json::Map<String, Value>,
) -> ContactwayIntentReceipt {
    match contactway_intent_from_command_payload(payload) {
        Ok(request) => apply_contactway_intent(runtime, request),
        Err(error) => ContactwayIntentReceipt {
            accepted: false,
            note: error,
            applied: None,
        },
    }
}

fn contactway_intent_from_command_payload(
    payload: &serde_json::Map<String, Value>,
) -> Result<ContactwayIntentRequest, String> {
    let source_surface = payload
        .get("surface")
        .or_else(|| payload.get("source_surface"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let channel = payload
        .get("channel")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let pattern = payload
        .get("pattern")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let intensity = payload
        .get("intensity")
        .and_then(Value::as_f64)
        .unwrap_or(0.6) as f32;
    let duration_ms = payload
        .get("duration_ms")
        .and_then(Value::as_u64)
        .unwrap_or(220);
    let context = payload
        .get("context")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned);

    let request = ContactwayIntentRequest {
        source_surface,
        channel,
        pattern,
        intensity,
        duration_ms,
        context,
    };

    if let Some(error) = validate_contactway_intent_request(&request) {
        let field_summary = if error.fields.is_empty() {
            error.message
        } else {
            error
                .fields
                .iter()
                .map(|field| format!("{} {}", field.field, field.issue))
                .collect::<Vec<_>>()
                .join("; ")
        };
        return Err(field_summary);
    }

    Ok(request)
}

fn validate_contactway_intent_request(request: &ContactwayIntentRequest) -> Option<ApiError> {
    let mut issues = Vec::new();

    if request.source_surface.trim().is_empty() {
        issues.push(field_issue("source_surface", "must not be empty"));
    }

    if request.channel.trim().is_empty() {
        issues.push(field_issue("channel", "must not be empty"));
    }

    if request.pattern.trim().is_empty() {
        issues.push(field_issue("pattern", "must not be empty"));
    }

    if !(0.0..=1.0).contains(&request.intensity) {
        issues.push(field_issue("intensity", "must be between 0.0 and 1.0"));
    }

    if request.duration_ms > 20_000 {
        issues.push(field_issue("duration_ms", "must be <= 20000"));
    }

    if issues.is_empty() {
        None
    } else {
        Some(ApiError::invalid(
            "invalid_contactway_intent",
            "Contactway intent validation failed.",
            issues,
        ))
    }
}

fn apply_contactway_intent(
    runtime: &mut KernelRuntime,
    request: ContactwayIntentRequest,
) -> ContactwayIntentReceipt {
    let now = timestamp_string();

    if !runtime.contactway.enabled {
        runtime.contactway.connected = false;
        runtime.contactway.updated_at = now;
        runtime.contactway.last_error =
            Some("contactway adapter is disabled; connect it before sending intents".to_string());
        return ContactwayIntentReceipt {
            accepted: false,
            note: "Contactway adapter disabled.".to_string(),
            applied: None,
        };
    }

    if !runtime.contactway.connected {
        runtime.contactway.updated_at = now;
        runtime.contactway.last_error =
            Some("contactway bridge is not connected; run connect before intent".to_string());
        return ContactwayIntentReceipt {
            accepted: false,
            note: "Contactway bridge is not connected.".to_string(),
            applied: None,
        };
    }

    let summary = ContactwayIntentSummary {
        source_surface: request.source_surface.trim().to_string(),
        channel: request.channel.trim().to_string(),
        pattern: request.pattern.trim().to_string(),
        intensity: request.intensity.clamp(0.0, 1.0),
        duration_ms: request.duration_ms.min(20_000),
        context: request
            .context
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty()),
        created_at: now.clone(),
    };

    runtime.contactway.last_intent = Some(summary.clone());
    runtime.contactway.updated_at = now;
    runtime.contactway.last_error = None;

    ContactwayIntentReceipt {
        accepted: true,
        note: format!(
            "Contactway intent routed: {} / {}",
            summary.channel, summary.pattern
        ),
        applied: Some(summary),
    }
}

fn is_supported_contactway_mode(mode: &str) -> bool {
    matches!(
        mode.trim().to_lowercase().as_str(),
        "buttplug_ws" | "intiface_engine" | "intiface_central" | "custom"
    )
}

fn is_valid_contactway_bridge_url(url: &str) -> bool {
    let trimmed = url.trim().to_lowercase();
    trimmed.starts_with("ws://")
        || trimmed.starts_with("wss://")
        || trimmed.starts_with("http://")
        || trimmed.starts_with("https://")
}

fn validate_video_request(
    request: &VideoGenerationRequest,
    studios: &[VideoStudioPreset],
    styles: &[StylePreset],
) -> Option<ApiError> {
    let mut issues = Vec::new();

    let studio = request.studio.trim();
    if studio.is_empty() {
        issues.push(field_issue("studio", "must not be empty"));
    } else if !studios
        .iter()
        .any(|candidate| candidate.slug.eq_ignore_ascii_case(studio))
    {
        issues.push(field_issue("studio", "unknown studio preset"));
    }

    let package_type = request.package_type.trim();
    if package_type != "1d" && package_type != "2d" {
        issues.push(field_issue("package_type", "must be one of: 1d, 2d"));
    }

    if let Some(duration) = request.duration_seconds {
        if !(5..=600).contains(&duration) {
            issues.push(field_issue(
                "duration_seconds",
                "must be between 5 and 600 when provided",
            ));
        }
    }

    let has_prompt_material = !request.core_idea.trim().is_empty()
        || !request.story.trim().is_empty()
        || !request.requested_prompt.trim().is_empty()
        || !request.token_address.trim().is_empty();

    if !has_prompt_material {
        issues.push(field_issue(
            "core_idea",
            "core_idea, story, requested_prompt, or token_address must be provided",
        ));
    }

    if request.project_title.trim().chars().count() > 120 {
        issues.push(field_issue("project_title", "must be <= 120 characters"));
    }

    if request.core_idea.trim().chars().count() > 600 {
        issues.push(field_issue("core_idea", "must be <= 600 characters"));
    }

    let style = request.style_preset.trim();
    if !style.is_empty()
        && !styles
            .iter()
            .any(|candidate| candidate.slug.eq_ignore_ascii_case(style))
    {
        issues.push(field_issue("style_preset", "unknown style preset"));
    }

    if !request.token_address.trim().is_empty() && request.chain.trim().is_empty() {
        issues.push(field_issue(
            "chain",
            "chain is required when token_address is provided",
        ));
    }

    if issues.is_empty() {
        None
    } else {
        Some(ApiError::invalid(
            "invalid_video_request",
            "VideoGenerationRequest validation failed.",
            issues,
        ))
    }
}

fn field_issue(field: &str, issue: &str) -> ApiFieldIssue {
    ApiFieldIssue {
        field: field.to_string(),
        issue: issue.to_string(),
    }
}

impl ApiError {
    fn invalid(code: &str, message: &str, fields: Vec<ApiFieldIssue>) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
            fields,
        }
    }
}

fn refresh_job_lifecycle(state: &AppState) -> Result<(), StatusCode> {
    with_runtime_mut(state, |runtime| {
        let now = current_timestamp();
        for job in &mut runtime.jobs {
            advance_job_state(job, now);
        }
    })
    .map(|_| ())
}

fn advance_job_state(job: &mut VideoGenerationJob, now_seconds: u64) {
    let created_at = job.created_at.parse::<u64>().unwrap_or(now_seconds);

    match job.status.as_str() {
        "queued" if now_seconds.saturating_sub(created_at) >= 2 => {
            job.status = "running".to_string();
            job.updated_at = now_seconds.to_string();
            if !job.summary.contains("Render started") {
                job.summary = format!("{} Render started.", job.summary);
            }
        }
        "running" if now_seconds.saturating_sub(created_at) >= 6 => {
            job.status = "done".to_string();
            job.updated_at = now_seconds.to_string();
            if !job.summary.contains("Render complete") {
                job.summary = format!("{} Render complete.", job.summary);
            }
        }
        _ => {}
    }
}

fn load_runtime(path: &Path) -> Result<KernelRuntime, String> {
    if !path.exists() {
        return Ok(KernelRuntime::default());
    }

    let content = fs::read_to_string(path)
        .map_err(|error| format!("failed reading state file '{}': {error}", path.display()))?;

    serde_json::from_str::<KernelRuntime>(&content)
        .map_err(|error| format!("failed parsing state file '{}': {error}", path.display()))
}

fn persist_state(path: &Path, runtime: &KernelRuntime) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| {
            format!("failed creating state dir '{}': {error}", parent.display())
        })?;
    }

    let payload = serde_json::to_string_pretty(runtime)
        .map_err(|error| format!("failed serializing state: {error}"))?;
    let temp_path = path.with_extension("json.tmp");

    fs::write(&temp_path, payload).map_err(|error| {
        format!(
            "failed writing temp state '{}': {error}",
            temp_path.display()
        )
    })?;

    fs::rename(&temp_path, path).map_err(|error| {
        format!(
            "failed replacing state file '{}' with '{}': {error}",
            path.display(),
            temp_path.display()
        )
    })
}

fn normalize_runtime_counters(runtime: &mut KernelRuntime) {
    if runtime.next_job_id == 0 {
        runtime.next_job_id = runtime
            .jobs
            .iter()
            .filter_map(|job| {
                job.job_id
                    .strip_prefix("job-")
                    .and_then(|value| value.parse::<u64>().ok())
            })
            .max()
            .unwrap_or(0)
            + 1;
    }

    if runtime.next_receipt_id == 0 {
        runtime.next_receipt_id = runtime.command_history.len() as u64 + 1;
    }
}

fn normalize_contactway_runtime(
    runtime: &mut KernelRuntime,
    default_mode: &str,
    default_bridge_url: &str,
    enabled_by_default: bool,
) {
    if runtime.contactway.mode.trim().is_empty() {
        runtime.contactway.mode = default_mode.to_string();
    }

    if runtime.contactway.bridge_url.trim().is_empty() {
        runtime.contactway.bridge_url = default_bridge_url.to_string();
    }

    let appears_uninitialized =
        runtime.contactway.updated_at.trim().is_empty() || runtime.contactway.updated_at == "0";
    if appears_uninitialized {
        runtime.contactway.enabled = enabled_by_default;
        runtime.contactway.updated_at = timestamp_string();
    }

    if !runtime.contactway.enabled {
        runtime.contactway.connected = false;
    }
}

fn env_bool(key: &str, default: bool) -> bool {
    let value = match std::env::var(key) {
        Ok(value) => value,
        Err(_) => return default,
    };

    match value.trim().to_lowercase().as_str() {
        "1" | "true" | "yes" | "on" => true,
        "0" | "false" | "no" | "off" => false,
        _ => default,
    }
}

fn with_runtime<R>(
    state: &AppState,
    operation: impl FnOnce(&KernelRuntime) -> R,
) -> Result<R, StatusCode> {
    let runtime = state
        .runtime
        .lock()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(operation(&runtime))
}

fn with_runtime_mut<R>(
    state: &AppState,
    operation: impl FnOnce(&mut KernelRuntime) -> R,
) -> Result<R, StatusCode> {
    let mut runtime = state
        .runtime
        .lock()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let output = operation(&mut runtime);

    persist_state(&state.state_file, &runtime).map_err(|error| {
        eprintln!("kernel persistence error: {error}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(output)
}
fn service_manifest(
    app_base_url: &str,
    studios: &[VideoStudioPreset],
    styles: &[StylePreset],
) -> ServiceManifestResponse {
    ServiceManifestResponse {
        service: "HyperCinemaAdapter".to_string(),
        adapter: "HyperCinemaAdapter-v1-local".to_string(),
        release_focus: "Quest-first HyperCinema support surface with local preview rendering"
            .to_string(),
        payment_mode: "disabled in local scaffold; money interfaces remain outside shell/runtime"
            .to_string(),
        studios: studios.to_vec(),
        style_presets: styles.to_vec(),
        endpoints: ServiceEndpoints {
            create_job: "/api/jobs".to_string(),
            get_job_template: "/api/jobs/{jobId}".to_string(),
            get_report_template: "/api/report/{jobId}".to_string(),
            get_video_template: format!("{app_base_url}/hypercinema?job={{jobId}}"),
        },
    }
}

fn hypercinema_studios() -> Vec<VideoStudioPreset> {
    vec![
        VideoStudioPreset {
            slug: "HashCinema".to_string(),
            title: "HashCinema".to_string(),
            description:
                "Generic visual cinema generation for any topic, brand, meme, or story."
                    .to_string(),
            route: "/HashCinema".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: false,
            visual_mode: "clean control-room cinema".to_string(),
        },
        VideoStudioPreset {
            slug: "TrenchCinema".to_string(),
            title: "TrenchCinema".to_string(),
            description:
                "Token-first memecoin trailer generation across Solana, Ethereum, BNB Chain, and Base."
                    .to_string(),
            route: "/TrenchCinema".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: false,
            visual_mode: "market-pressure launch trailer".to_string(),
        },
        VideoStudioPreset {
            slug: "FunCinema".to_string(),
            title: "FunCinema".to_string(),
            description: "Playful video studio for jokes, ideas, experiments, and fast creative tests."
                .to_string(),
            route: "/FunCinema".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: false,
            visual_mode: "bright and kinetic experiment reel".to_string(),
        },
        VideoStudioPreset {
            slug: "FamilyCinema".to_string(),
            title: "FamilyCinema".to_string(),
            description: "Bedtime story studio for gentle, narration-led family shorts.".to_string(),
            route: "/FamilyCinema".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: true,
            visual_mode: "soft illustrated dreamscape".to_string(),
        },
        VideoStudioPreset {
            slug: "MusicVideo".to_string(),
            title: "MusicVideo".to_string(),
            description:
                "Trailer-first music video planning from lyrics, beat sheets, or source embeds."
                    .to_string(),
            route: "/MusicVideo".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: true,
            visual_mode: "beat-synced performance montage".to_string(),
        },
        VideoStudioPreset {
            slug: "Recreator".to_string(),
            title: "Recreator".to_string(),
            description:
                "Scene reinterpretation studio that rebuilds dialogue or transcript beats as a new trailer."
                    .to_string(),
            route: "/Recreator".to_string(),
            duration_seconds: 30,
            price_label: "local preview".to_string(),
            audio_default: true,
            visual_mode: "reframed scene recreation".to_string(),
        },
    ]
}

fn style_presets() -> Vec<StylePreset> {
    vec![
        StylePreset {
            slug: "hyperflow_assembly".to_string(),
            title: "Hyperflow Assembly".to_string(),
            description: "Clean control-room gradients, strong type, and shell-style scene labels."
                .to_string(),
        },
        StylePreset {
            slug: "token_launch".to_string(),
            title: "Token Launch".to_string(),
            description: "Sharper contrast, ticker-card framing, and market-pressure motion."
                .to_string(),
        },
        StylePreset {
            slug: "storybook_gentle".to_string(),
            title: "Storybook Gentle".to_string(),
            description: "Soft palettes, slower moves, and calmer caption language.".to_string(),
        },
        StylePreset {
            slug: "trailer_cut".to_string(),
            title: "Trailer Cut".to_string(),
            description: "Faster beats, bolder camera verbs, and stronger title-card rhythm."
                .to_string(),
        },
    ]
}

fn assemble_job(
    state: &AppState,
    request: VideoGenerationRequest,
    job_index: u64,
) -> VideoGenerationJob {
    let studio = normalize_studio(&request.studio, &state.studios);
    let studio_config = state
        .studios
        .iter()
        .find(|candidate| candidate.slug == studio)
        .cloned()
        .unwrap_or_else(|| state.studios[0].clone());

    let package_type = normalize_package_type(&request.package_type);
    let duration_seconds = request
        .duration_seconds
        .unwrap_or_else(|| package_duration_seconds(&package_type, studio_config.duration_seconds));
    let job_id = format!("job-{job_index:05}");
    let project_title = first_non_empty(&[
        request.project_title.as_str(),
        request.token_address.as_str(),
        request.core_idea.as_str(),
        studio_config.title.as_str(),
    ]);
    let core_idea = first_non_empty(&[
        request.core_idea.as_str(),
        request.requested_prompt.as_str(),
        request.token_address.as_str(),
        "Assemble a short cinematic preview from one strong idea.",
    ]);
    let style_preset = normalize_style_preset(&request.style_preset, &state.styles);
    let scene_cards = build_scene_cards(
        &studio_config,
        &style_preset,
        &request,
        &project_title,
        &core_idea,
    );
    let created_at = timestamp_string();
    let summary = format!(
        "Queued {} second {} brief with {} scene cards and {} audio.",
        duration_seconds,
        studio_config.title,
        scene_cards.len(),
        if request.audio_on {
            "optional"
        } else {
            "silent-first"
        }
    );

    let output = VideoOutputManifest {
        render_mode: "browser_storyboard_preview".to_string(),
        preview_url: format!("{}/hypercinema?job={}", state.app_base_url, job_id),
        report_url: format!("{}/api/report/{}", state.kernel_base_url, job_id),
        download_name: slugify(&project_title),
        poster_text: project_title.clone(),
        gradient_stops: studio_gradient_stops(&studio_config.slug),
    };

    VideoGenerationJob {
        job_id,
        studio,
        status: "queued".to_string(),
        package_type,
        duration_seconds,
        project_title,
        core_idea,
        audio_on: request.audio_on || studio_config.audio_default,
        style_preset,
        created_at: created_at.clone(),
        updated_at: created_at,
        summary,
        scene_cards,
        output,
    }
}

fn build_scene_cards(
    studio: &VideoStudioPreset,
    style_preset: &str,
    request: &VideoGenerationRequest,
    project_title: &str,
    core_idea: &str,
) -> Vec<VideoSceneCard> {
    let mut beats = split_beats(&request.story);

    if beats.is_empty() {
        beats.push(core_idea.to_string());
    }

    if !request.characters.trim().is_empty() {
        beats.push(format!("Introduce {}", request.characters.trim()));
    }

    if !request.source_material.trim().is_empty() {
        beats.push(format!(
            "Fold in source material from {}",
            request.source_material.trim()
        ));
    }

    if !request.lyrics_dialogue.trim().is_empty() {
        beats.push(format!(
            "Land the final beat with dialogue or lyric cue: {}",
            request.lyrics_dialogue.trim()
        ));
    }

    beats.truncate(5);

    let motions = camera_motions_for_studio(&studio.slug);

    beats
        .into_iter()
        .enumerate()
        .map(|(index, beat)| VideoSceneCard {
            index: (index + 1) as u8,
            title: format!("{} beat {}", project_title, index + 1),
            beat: beat.clone(),
            visual_prompt: build_visual_prompt(studio, style_preset, request, &beat, core_idea),
            camera_motion: motions[index % motions.len()].to_string(),
            caption: build_caption(studio, request, &beat),
        })
        .collect()
}

fn split_beats(story: &str) -> Vec<String> {
    story
        .split(['\n', '.', '!', '?'])
        .map(str::trim)
        .filter(|segment| !segment.is_empty())
        .map(ToOwned::to_owned)
        .collect()
}

fn build_visual_prompt(
    studio: &VideoStudioPreset,
    style_preset: &str,
    request: &VideoGenerationRequest,
    beat: &str,
    core_idea: &str,
) -> String {
    let visual_style = if request.visual_style.trim().is_empty() {
        studio.visual_mode.as_str()
    } else {
        request.visual_style.trim()
    };

    format!(
        "{} | style {} | {} | beat {} | focus {}",
        studio.title, style_preset, visual_style, beat, core_idea
    )
}

fn build_caption(
    studio: &VideoStudioPreset,
    request: &VideoGenerationRequest,
    beat: &str,
) -> String {
    if !request.lyrics_dialogue.trim().is_empty() {
        return request.lyrics_dialogue.trim().to_string();
    }

    match studio.slug.as_str() {
        "TrenchCinema" => format!("{} | watch the signal tighten", beat),
        "FamilyCinema" => format!("{} | keep the tone gentle", beat),
        "MusicVideo" => format!("{} | cut on the downbeat", beat),
        "Recreator" => format!("{} | reinterpret the scene, do not imitate it", beat),
        _ => beat.to_string(),
    }
}

fn camera_motions_for_studio(studio_slug: &str) -> &'static [&'static str] {
    match studio_slug {
        "TrenchCinema" => &[
            "fast push-in with ticker parallax",
            "low-angle orbit with launch flare",
            "snap zoom into token card",
        ],
        "FamilyCinema" => &[
            "slow floating pan",
            "soft dolly through illustrated depth",
            "lantern-lit drift",
        ],
        "MusicVideo" => &[
            "beat-synced strobe cut",
            "side-tracking performance glide",
            "tempo-matched crash zoom",
        ],
        "Recreator" => &[
            "dialogue-led push-in",
            "match-cut sidestep",
            "shadowed reverse reveal",
        ],
        _ => &[
            "steady dolly into title card",
            "three-quarter orbit around subject",
            "wide reveal with atmospheric drift",
        ],
    }
}

fn normalize_studio(requested: &str, studios: &[VideoStudioPreset]) -> String {
    let cleaned = requested.trim();
    if cleaned.is_empty() {
        return "HashCinema".to_string();
    }

    studios
        .iter()
        .find(|studio| studio.slug.eq_ignore_ascii_case(cleaned))
        .map(|studio| studio.slug.clone())
        .unwrap_or_else(|| "HashCinema".to_string())
}

fn normalize_package_type(package_type: &str) -> String {
    match package_type.trim() {
        "2d" => "2d".to_string(),
        _ => "1d".to_string(),
    }
}

fn package_duration_seconds(package_type: &str, fallback: u32) -> u32 {
    match package_type {
        "2d" => 60,
        "1d" => 30,
        _ => fallback,
    }
}

fn normalize_style_preset(requested: &str, styles: &[StylePreset]) -> String {
    let cleaned = requested.trim();
    if cleaned.is_empty() {
        return "hyperflow_assembly".to_string();
    }

    styles
        .iter()
        .find(|style| style.slug.eq_ignore_ascii_case(cleaned))
        .map(|style| style.slug.clone())
        .unwrap_or_else(|| "hyperflow_assembly".to_string())
}

fn studio_gradient_stops(studio_slug: &str) -> Vec<String> {
    match studio_slug {
        "TrenchCinema" => vec![
            "#071923".to_string(),
            "#0b3b52".to_string(),
            "#f6a043".to_string(),
        ],
        "FunCinema" => vec![
            "#2f124d".to_string(),
            "#ff6b6b".to_string(),
            "#ffe66d".to_string(),
        ],
        "FamilyCinema" => vec![
            "#10213a".to_string(),
            "#5f7adb".to_string(),
            "#f1d3b3".to_string(),
        ],
        "MusicVideo" => vec![
            "#040814".to_string(),
            "#8d5bff".to_string(),
            "#ff4d8b".to_string(),
        ],
        "Recreator" => vec![
            "#0b0f16".to_string(),
            "#3a4a5f".to_string(),
            "#d1b088".to_string(),
        ],
        _ => vec![
            "#0b0f18".to_string(),
            "#123b4f".to_string(),
            "#ffd08b".to_string(),
        ],
    }
}

fn first_non_empty(candidates: &[&str]) -> String {
    candidates
        .iter()
        .map(|candidate| candidate.trim())
        .find(|candidate| !candidate.is_empty())
        .unwrap_or("Untitled HyperCinema Job")
        .to_string()
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();

    for character in value.chars() {
        if character.is_ascii_alphanumeric() {
            slug.push(character.to_ascii_lowercase());
        } else if (character.is_whitespace() || character == '-' || character == '_')
            && !slug.ends_with('-')
        {
            slug.push('-');
        }
    }

    slug.trim_matches('-').to_string()
}

fn timestamp_string() -> String {
    current_timestamp().to_string()
}

fn current_timestamp() -> u64 {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs(),
        Err(_) => 0,
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    fn test_state() -> AppState {
        let studios = hypercinema_studios();
        let styles = style_presets();
        let manifest = service_manifest(DEFAULT_APP_BASE_URL, &studios, &styles);
        let state_file =
            std::env::temp_dir().join(format!("lx-core-test-{}.json", current_timestamp()));

        AppState {
            app_base_url: DEFAULT_APP_BASE_URL.to_string(),
            kernel_base_url: DEFAULT_KERNEL_BASE_URL.to_string(),
            hermes_runtime_url: DEFAULT_HERMES_RUNTIME_URL.to_string(),
            manifest,
            studios,
            styles,
            runtime: Arc::new(Mutex::new(KernelRuntime {
                next_job_id: 1,
                next_receipt_id: 1,
                ..KernelRuntime::default()
            })),
            state_file: Arc::new(state_file),
            http_client: Client::new(),
            contactway_default_mode: DEFAULT_CONTACTWAY_MODE.to_string(),
            contactway_default_bridge_url: DEFAULT_CONTACTWAY_BRIDGE_URL.to_string(),
            contactway_enabled_by_default: false,
            contactway_bridge: Arc::new(tokio::sync::Mutex::new(ContactwayBridge::new())),
        }
    }

    #[tokio::test]
    async fn create_job_rejects_empty_prompt_material() {
        let app = build_router(test_state());

        let payload = serde_json::json!({
            "studio": "HashCinema",
            "package_type": "1d",
            "duration_seconds": null,
            "project_title": "",
            "core_idea": "",
            "story": "",
            "characters": "",
            "visual_style": "",
            "source_material": "",
            "lyrics_dialogue": "",
            "audio_on": false,
            "requested_prompt": "",
            "token_address": "",
            "chain": "",
            "style_preset": "hyperflow_assembly"
        });

        let request = Request::builder()
            .method("POST")
            .uri("/api/jobs")
            .header("content-type", "application/json")
            .body(Body::from(payload.to_string()))
            .expect("request should build");

        let response = app.oneshot(request).await.expect("router should respond");
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn command_marks_unknown_kind_rejected() {
        let app = build_router(test_state());

        let payload = serde_json::json!({
            "kind": "unknown.command",
            "payload": { "surface": "quest3", "intent": "noop", "note": "test" }
        });

        let request = Request::builder()
            .method("POST")
            .uri("/command")
            .header("content-type", "application/json")
            .body(Body::from(payload.to_string()))
            .expect("request should build");

        let response = app.oneshot(request).await.expect("router should respond");
        assert_eq!(response.status(), StatusCode::OK);

        let body = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("body should decode");
        let receipt: CommandReceipt =
            serde_json::from_slice(&body).expect("receipt JSON should parse");

        assert!(!receipt.accepted);
        assert_eq!(receipt.command_kind, "unknown.command");
    }

    #[tokio::test]
    async fn contactway_intent_requires_connect() {
        let app = build_router(test_state());

        let payload = serde_json::json!({
            "kind": "contactway.intent",
            "payload": {
                "surface": "quest3",
                "channel": "pulse",
                "pattern": "vr_tap",
                "intensity": 0.7,
                "duration_ms": 220
            }
        });

        let request = Request::builder()
            .method("POST")
            .uri("/command")
            .header("content-type", "application/json")
            .body(Body::from(payload.to_string()))
            .expect("request should build");

        let response = app.oneshot(request).await.expect("router should respond");
        assert_eq!(response.status(), StatusCode::OK);

        let body = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("body should decode");
        let receipt: CommandReceipt =
            serde_json::from_slice(&body).expect("receipt JSON should parse");

        assert!(!receipt.accepted);
        assert_eq!(receipt.command_kind, "contactway.intent");
    }

    #[tokio::test]
    async fn contactway_connect_then_intent_succeeds() {
        let app = build_router(test_state());

        let connect_request = Request::builder()
            .method("POST")
            .uri("/api/contactway/connect")
            .header("content-type", "application/json")
            .body(Body::from(
                serde_json::json!({
                    "enabled": true,
                    "mode": "buttplug_ws",
                    "bridge_url": "ws://127.0.0.1:12345"
                })
                .to_string(),
            ))
            .expect("request should build");
        let connect_response = app
            .clone()
            .oneshot(connect_request)
            .await
            .expect("router should respond");
        assert_eq!(connect_response.status(), StatusCode::OK);

        let intent_request = Request::builder()
            .method("POST")
            .uri("/api/contactway/intent")
            .header("content-type", "application/json")
            .body(Body::from(
                serde_json::json!({
                    "source_surface": "quest3",
                    "channel": "pulse",
                    "pattern": "vr_tap",
                    "intensity": 0.65,
                    "duration_ms": 240,
                    "context": "test"
                })
                .to_string(),
            ))
            .expect("request should build");
        let intent_response = app
            .oneshot(intent_request)
            .await
            .expect("router should respond");
        assert_eq!(intent_response.status(), StatusCode::OK);

        let body = axum::body::to_bytes(intent_response.into_body(), usize::MAX)
            .await
            .expect("body should decode");
        let receipt: ContactwayIntentReceipt =
            serde_json::from_slice(&body).expect("receipt JSON should parse");
        assert!(receipt.accepted);
        assert!(receipt.applied.is_some());
    }

    #[test]
    fn execute_voice_command_builds_hermes_task() {
        let payload = serde_json::json!({
            "surface": "quest3",
            "mode": "vr",
            "intent": "voice-command",
            "gesture": "microphone",
            "transcript": "build a stone tower",
            "confidence": 0.96,
            "source": "quest3-voice",
            "route": "command\tbuild\t1\tmirrored"
        });

        let execution = execute_command(
            "quest3.voice.command",
            payload.as_object().expect("payload should be object"),
        );

        assert!(execution.accepted);
        assert!(execution.hermes_task.is_some());
        assert!(execution.note.contains("confidence"));
    }

    #[test]
    fn advance_job_moves_queued_to_done_over_time() {
        let mut job = VideoGenerationJob {
            job_id: "job-00001".to_string(),
            studio: "HashCinema".to_string(),
            status: "queued".to_string(),
            package_type: "1d".to_string(),
            duration_seconds: 30,
            project_title: "Test".to_string(),
            core_idea: "Test".to_string(),
            audio_on: false,
            style_preset: "hyperflow_assembly".to_string(),
            created_at: "10".to_string(),
            updated_at: "10".to_string(),
            summary: "Queued".to_string(),
            scene_cards: vec![],
            output: VideoOutputManifest {
                render_mode: "browser_storyboard_preview".to_string(),
                preview_url: "http://localhost/preview".to_string(),
                report_url: "http://localhost/report".to_string(),
                download_name: "test".to_string(),
                poster_text: "Test".to_string(),
                gradient_stops: vec!["#000".to_string(), "#111".to_string(), "#222".to_string()],
            },
        };

        advance_job_state(&mut job, 13);
        assert_eq!(job.status, "running");

        advance_job_state(&mut job, 17);
        assert_eq!(job.status, "done");
    }
}
