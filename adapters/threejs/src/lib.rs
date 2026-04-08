use serde::{Deserialize, Serialize};

/// Three.js scene/card descriptor adapter.
/// Ported from the Unity-side `ThreeJsVideoAdapter.cs`.
/// Emits deterministic payloads for downstream rendering — no truth ownership.

const DEFAULT_STYLE_PRESET: &str = "hyperflow_assembly";
const DEFAULT_SCENE_PROFILE: &str = "voxel_cinematic";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardDescriptorRequest {
    pub token_address: String,
    #[serde(default = "default_style")]
    pub style_preset: String,
    pub world_size: [u32; 3],
    #[serde(default)]
    pub request_summary: String,
}

fn default_style() -> String {
    DEFAULT_STYLE_PRESET.to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeJsCardDescriptor {
    pub adapter: String,
    pub upstream: String,
    pub token_address: String,
    pub style_preset: String,
    pub scene_profile: String,
    pub card_mode: String,
    pub random_seed: i32,
    pub world_size: [u32; 3],
    pub card_layers: Vec<String>,
    pub video_layers: Vec<String>,
}

/// Derive a deterministic seed from token, style, and request summary using FNV-1a.
pub fn derive_seed(token_address: &str, style_preset: &str, request_summary: &str) -> i32 {
    let material = format!("{token_address}|{style_preset}|{request_summary}");
    let mut hash: u32 = 2_166_136_261;
    for ch in material.chars() {
        hash ^= ch as u32;
        hash = hash.wrapping_mul(16_777_619);
    }
    (hash & 0x7FFF_FFFF) as i32
}

/// Build a card descriptor from the request. Pure function, deterministic.
pub fn build_card_descriptor(request: &CardDescriptorRequest) -> ThreeJsCardDescriptor {
    let token = if request.token_address.trim().is_empty() {
        "unknown-token"
    } else {
        request.token_address.trim()
    };

    let style = if request.style_preset.trim().is_empty() {
        DEFAULT_STYLE_PRESET
    } else {
        request.style_preset.trim()
    };

    let seed = derive_seed(token, style, &request.request_summary);

    ThreeJsCardDescriptor {
        adapter: "ThreeJsVideoAdapter".to_string(),
        upstream: "https://github.com/mrdoob/three.js/".to_string(),
        token_address: token.to_string(),
        style_preset: style.to_string(),
        scene_profile: DEFAULT_SCENE_PROFILE.to_string(),
        card_mode: "in_game_and_video".to_string(),
        random_seed: seed,
        world_size: request.world_size,
        card_layers: vec![
            "token-title".to_string(),
            "market-sparkline".to_string(),
            "shader-grid".to_string(),
            "voxel-volume-preview".to_string(),
            "camera-orbit".to_string(),
        ],
        video_layers: vec![
            "opening-logo".to_string(),
            "token-card-hero".to_string(),
            "voxel-flythrough".to_string(),
            "data-overlays".to_string(),
            "closing-signature".to_string(),
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_descriptor_basic() {
        let req = CardDescriptorRequest {
            token_address: "SOL123abc".to_string(),
            style_preset: "hyperflow_assembly".to_string(),
            world_size: [42, 16, 42],
            request_summary: String::new(),
        };
        let desc = build_card_descriptor(&req);
        assert_eq!(desc.token_address, "SOL123abc");
        assert_eq!(desc.card_mode, "in_game_and_video");
        assert_eq!(desc.card_layers.len(), 5);
        assert_eq!(desc.video_layers.len(), 5);
    }

    #[test]
    fn deterministic_seed() {
        let a = derive_seed("token1", "style1", "");
        let b = derive_seed("token1", "style1", "");
        assert_eq!(a, b);
        assert_ne!(a, derive_seed("token2", "style1", ""));
    }

    #[test]
    fn empty_token_defaults() {
        let req = CardDescriptorRequest {
            token_address: "  ".to_string(),
            style_preset: String::new(),
            world_size: [42, 42, 42],
            request_summary: String::new(),
        };
        let desc = build_card_descriptor(&req);
        assert_eq!(desc.token_address, "unknown-token");
        assert_eq!(desc.style_preset, DEFAULT_STYLE_PRESET);
    }
}
