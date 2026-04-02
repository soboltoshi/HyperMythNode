using System;

// Unity-serializable mirrors of the lx-protocol HyperCinema types.
// Kept flat so JsonUtility can round-trip them without a custom converter.
// Field names match the snake_case JSON keys produced by the Rust kernel.

namespace LastExperiments.Cinema
{
    // ---- Service manifest ----

    [Serializable]
    public class HyperCinemaServiceEndpoints
    {
        public string create_job;
        public string get_job_template;
        public string get_report_template;
        public string get_video_template;
    }

    [Serializable]
    public class HyperCinemaStudioPreset
    {
        public string slug;
        public string title;
        public string description;
        public string route;
        public int duration_seconds;
        public string price_label;
        public bool audio_default;
        public string visual_mode;
    }

    [Serializable]
    public class HyperCinemaStylePreset
    {
        public string slug;
        public string title;
        public string description;
    }

    [Serializable]
    public class HyperCinemaServiceManifest
    {
        public string service;
        public string adapter;
        public string release_focus;
        public string payment_mode;
        public HyperCinemaStudioPreset[] studios;
        public HyperCinemaStylePreset[] style_presets;
        public HyperCinemaServiceEndpoints endpoints;
    }

    // ---- Job request ----

    [Serializable]
    public class HyperCinemaJobRequest
    {
        public string studio;
        public string package_type;
        public string project_title;
        public string core_idea;
        public string story;
        public string characters;
        public string visual_style;
        public string source_material;
        public string lyrics_dialogue;
        public bool audio_on;
        public string requested_prompt;
        public string token_address;
        public string chain;
        public string style_preset;

        /// <summary>Returns a request pre-filled with safe defaults for a quick VR-side job.</summary>
        public static HyperCinemaJobRequest QuickCreate(string studio, string coreIdea)
        {
            return new HyperCinemaJobRequest
            {
                studio = studio,
                package_type = "1d",
                project_title = "",
                core_idea = coreIdea,
                story = "",
                characters = "",
                visual_style = "",
                source_material = "",
                lyrics_dialogue = "",
                audio_on = false,
                requested_prompt = "",
                token_address = "",
                chain = "",
                style_preset = "hyperflow_assembly",
            };
        }
    }

    // ---- Job response ----

    [Serializable]
    public class HyperCinemaSceneCard
    {
        public int index;
        public string title;
        public string beat;
        public string visual_prompt;
        public string camera_motion;
        public string caption;
    }

    [Serializable]
    public class HyperCinemaOutputManifest
    {
        public string render_mode;
        public string preview_url;
        public string report_url;
        public string download_name;
        public string poster_text;
        public string[] gradient_stops;
    }

    [Serializable]
    public class HyperCinemaJob
    {
        public string job_id;
        public string studio;
        public string status;
        public string package_type;
        public int duration_seconds;
        public string project_title;
        public string core_idea;
        public bool audio_on;
        public string style_preset;
        public string created_at;
        public string updated_at;
        public string summary;
        public HyperCinemaSceneCard[] scene_cards;
        public HyperCinemaOutputManifest output;
    }

    // ---- List + report wrappers ----

    [Serializable]
    public class HyperCinemaJobListResponse
    {
        public HyperCinemaJob[] jobs;
    }

    [Serializable]
    public class HyperCinemaReportResponse
    {
        public string job_id;
        public string title;
        public string summary;
        public HyperCinemaSceneCard[] scene_cards;
        public HyperCinemaOutputManifest output;
    }
}
