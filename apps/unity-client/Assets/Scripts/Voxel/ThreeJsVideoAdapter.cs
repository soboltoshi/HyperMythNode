using System;
using UnityEngine;

namespace LastExperiments.Voxel
{
    [Serializable]
    public class ThreeJsCardDescriptor
    {
        public string adapter = "ThreeJsVideoAdapter";
        public string upstream = "https://github.com/mrdoob/three.js/";
        public string token_address;
        public string style_preset;
        public string scene_profile;
        public string card_mode;
        public int random_seed;
        public int[] world_size;
        public string[] card_layers;
        public string[] video_layers;
    }

    /// <summary>
    /// Adapter facade for three.js-backed card/video scene descriptors.
    /// This does not own rendering truth; it emits deterministic payloads for downstream use.
    /// </summary>
    public class ThreeJsVideoAdapter : MonoBehaviour
    {
        [SerializeField] private string defaultStylePreset = "hyperflow_assembly";
        [SerializeField] private string defaultSceneProfile = "voxel_cinematic";
        [SerializeField] private bool verboseLogs = true;

        public ThreeJsCardDescriptor BuildCardDescriptor(
            string tokenAddress,
            string stylePreset,
            Vector3Int worldSize,
            string requestSummary = "")
        {
            var normalizedToken = string.IsNullOrWhiteSpace(tokenAddress)
                ? "unknown-token"
                : tokenAddress.Trim();
            var style = string.IsNullOrWhiteSpace(stylePreset) ? defaultStylePreset : stylePreset.Trim();
            var scene = defaultSceneProfile;
            var seed = DeriveSeed(normalizedToken, style, requestSummary);

            var descriptor = new ThreeJsCardDescriptor
            {
                token_address = normalizedToken,
                style_preset = style,
                scene_profile = scene,
                card_mode = "in_game_and_video",
                random_seed = seed,
                world_size = new[] { worldSize.x, worldSize.y, worldSize.z },
                card_layers = new[]
                {
                    "token-title",
                    "market-sparkline",
                    "shader-grid",
                    "voxel-volume-preview",
                    "camera-orbit"
                },
                video_layers = new[]
                {
                    "opening-logo",
                    "token-card-hero",
                    "voxel-flythrough",
                    "data-overlays",
                    "closing-signature"
                }
            };

            if (verboseLogs)
            {
                Debug.Log(
                    $"ThreeJsVideoAdapter descriptor built for {normalizedToken} " +
                    $"style={style} seed={seed} world={worldSize.x}x{worldSize.y}x{worldSize.z}");
            }

            return descriptor;
        }

        public int DeriveSeed(string tokenAddress, string stylePreset, string requestSummary = "")
        {
            var material = $"{tokenAddress}|{stylePreset}|{requestSummary}";
            unchecked
            {
                uint hash = 2166136261u;
                for (var i = 0; i < material.Length; i++)
                {
                    hash ^= material[i];
                    hash *= 16777619u;
                }

                return (int)(hash & 0x7fffffffu);
            }
        }
    }
}
