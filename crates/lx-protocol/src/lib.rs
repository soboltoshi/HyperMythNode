use serde::{Deserialize, Serialize};
use serde_json::Value;

// ---------------------------------------------------------------------------
// Agent results (server-side agent execution -> snapshot delivery)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentResult {
    pub task_id: String,
    pub role: String,
    pub result_type: String,
    pub data: Value,
    pub timestamp: String,
}

// ---------------------------------------------------------------------------
// Adapter registry
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdapterRegistryEntry {
    pub name: String,
    pub kind: String,
    pub status: String,
    pub last_call_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdapterRegistryResponse {
    pub adapters: Vec<AdapterRegistryEntry>,
}

// ---------------------------------------------------------------------------
// Game of Life adapter (kernel-level request/response wrappers)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameOfLifeGenerateRequest {
    #[serde(default = "default_42")]
    pub width: u32,
    #[serde(default = "default_42")]
    pub height: u32,
    #[serde(default = "default_42")]
    pub depth: u32,
    #[serde(default = "default_7")]
    pub steps: u32,
    #[serde(default = "default_density")]
    pub seed_density: f32,
    #[serde(default = "default_seed")]
    pub random_seed: i32,
}

fn default_42() -> u32 { 42 }
fn default_7() -> u32 { 7 }
fn default_density() -> f32 { 0.22 }
fn default_seed() -> i32 { 424242 }

// ---------------------------------------------------------------------------
// ThreeJS card adapter (kernel-level request wrapper)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeJsCardRequest {
    pub token_address: String,
    #[serde(default = "default_style_preset")]
    pub style_preset: String,
    #[serde(default = "default_world_size")]
    pub world_size: [u32; 3],
    #[serde(default)]
    pub request_summary: String,
}

fn default_style_preset() -> String { "hyperflow_assembly".to_string() }
fn default_world_size() -> [u32; 3] { [42, 16, 42] }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub ok: bool,
    pub product: String,
    pub release_focus: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotResponse {
    pub world_name: String,
    pub world_bounds: [u32; 3],
    pub active_agents: u8,
    pub release_focus: String,
    pub surfaces: Surfaces,
    pub experiments: Vec<CinemaExperimentRecord>,
    #[serde(default)]
    pub agent_results: Vec<AgentResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Surfaces {
    pub vr: SurfaceStatus,
    pub web: SurfaceStatus,
    pub mobile: SurfaceStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurfaceStatus {
    pub name: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CinemaExperimentRecord {
    pub experiment_id: String,
    pub experiment_type: String,
    pub token_address: String,
    pub status: String,
    pub video_url: Option<String>,
    pub job_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandRequest {
    pub kind: String,
    pub payload: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandReceipt {
    pub accepted: bool,
    pub command_kind: String,
    pub receipt: String,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayStatusResponse {
    pub adapter: String,
    pub mode: String,
    pub bridge_url: String,
    pub enabled: bool,
    pub connected: bool,
    pub updated_at: String,
    pub last_error: Option<String>,
    pub last_intent: Option<ContactwayIntentSummary>,
    pub integration_notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayConnectRequest {
    pub enabled: Option<bool>,
    pub mode: Option<String>,
    pub bridge_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayIntentRequest {
    pub source_surface: String,
    pub channel: String,
    pub pattern: String,
    pub intensity: f32,
    pub duration_ms: u64,
    pub context: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayIntentSummary {
    pub source_surface: String,
    pub channel: String,
    pub pattern: String,
    pub intensity: f32,
    pub duration_ms: u64,
    pub context: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactwayIntentReceipt {
    pub accepted: bool,
    pub note: String,
    pub applied: Option<ContactwayIntentSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceManifestResponse {
    pub service: String,
    pub adapter: String,
    pub release_focus: String,
    pub payment_mode: String,
    pub studios: Vec<VideoStudioPreset>,
    pub style_presets: Vec<StylePreset>,
    pub endpoints: ServiceEndpoints,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceEndpoints {
    pub create_job: String,
    pub get_job_template: String,
    pub get_report_template: String,
    pub get_video_template: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoStudioCatalogResponse {
    pub studios: Vec<VideoStudioPreset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoStudioPreset {
    pub slug: String,
    pub title: String,
    pub description: String,
    pub route: String,
    pub duration_seconds: u32,
    pub price_label: String,
    pub audio_default: bool,
    pub visual_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StylePreset {
    pub slug: String,
    pub title: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoGenerationRequest {
    pub studio: String,
    pub package_type: String,
    pub duration_seconds: Option<u32>,
    pub project_title: String,
    pub core_idea: String,
    pub story: String,
    pub characters: String,
    pub visual_style: String,
    pub source_material: String,
    pub lyrics_dialogue: String,
    pub audio_on: bool,
    pub requested_prompt: String,
    pub token_address: String,
    pub chain: String,
    pub style_preset: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoJobListResponse {
    pub jobs: Vec<VideoGenerationJob>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoGenerationJob {
    pub job_id: String,
    pub studio: String,
    pub status: String,
    pub package_type: String,
    pub duration_seconds: u32,
    pub project_title: String,
    pub core_idea: String,
    pub audio_on: bool,
    pub style_preset: String,
    pub created_at: String,
    pub updated_at: String,
    pub summary: String,
    pub scene_cards: Vec<VideoSceneCard>,
    pub output: VideoOutputManifest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoSceneCard {
    pub index: u8,
    pub title: String,
    pub beat: String,
    pub visual_prompt: String,
    pub camera_motion: String,
    pub caption: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoOutputManifest {
    pub render_mode: String,
    pub preview_url: String,
    pub report_url: String,
    pub download_name: String,
    pub poster_text: String,
    pub gradient_stops: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoReportResponse {
    pub job_id: String,
    pub title: String,
    pub summary: String,
    pub scene_cards: Vec<VideoSceneCard>,
    pub output: VideoOutputManifest,
}
