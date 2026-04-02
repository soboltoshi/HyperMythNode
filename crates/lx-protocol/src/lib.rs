use serde::{Deserialize, Serialize};
use serde_json::Value;

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
