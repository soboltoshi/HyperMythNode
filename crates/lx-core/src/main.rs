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
use reqwest::Client;
use lx_protocol::{
    CommandReceipt, CommandRequest, HealthResponse, ServiceEndpoints, ServiceManifestResponse,
    SnapshotResponse, StylePreset, SurfaceStatus, Surfaces, VideoGenerationJob,
    VideoGenerationRequest, VideoJobListResponse, VideoOutputManifest, VideoReportResponse,
    VideoSceneCard, VideoStudioCatalogResponse, VideoStudioPreset,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tower_http::cors::CorsLayer;

const DEFAULT_APP_BASE_URL: &str = "http://127.0.0.1:3000";
const DEFAULT_KERNEL_BASE_URL: &str = "http://127.0.0.1:8787";
const DEFAULT_HERMES_RUNTIME_URL: &str = "http://127.0.0.1:8799";
const DEFAULT_STATE_FILE: &str = "build/kernel/state.json";
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct KernelRuntime {
    jobs: Vec<VideoGenerationJob>,
    command_history: Vec<CommandAudit>,
    next_job_id: u64,
    next_receipt_id: u64,
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

#[tokio::main]
async fn main() {
    let app_base_url =
        std::env::var("APP_BASE_URL").unwrap_or_else(|_| DEFAULT_APP_BASE_URL.to_string());
    let kernel_base_url =
        std::env::var("KERNEL_BASE_URL").unwrap_or_else(|_| DEFAULT_KERNEL_BASE_URL.to_string());
    let hermes_runtime_url = std::env::var("HERMES_RUNTIME_URL")
        .unwrap_or_else(|_| DEFAULT_HERMES_RUNTIME_URL.to_string());
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

async fn snapshot() -> impl IntoResponse {
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

        let next_receipt_id = runtime.next_receipt_id.max(1);
        let receipt_id = format!("rcpt-{next_receipt_id:06}-{}", timestamp_string());
        runtime.next_receipt_id = next_receipt_id + 1;

        runtime.command_history.insert(
            0,
            CommandAudit {
                receipt: receipt_id.clone(),
                command_kind: command_kind.clone(),
                accepted: execution.accepted,
                note: execution.note.clone(),
                created_at: timestamp_string(),
            },
        );

        CommandReceipt {
            accepted: execution.accepted,
            command_kind: command_kind.clone(),
            receipt: receipt_id,
            note: execution.note.clone(),
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
        .post(format!("{}/tasks", state.hermes_runtime_url.trim_end_matches('/')))
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
