using System;

namespace LastExperiments.Core
{
    [Serializable]
    public class KernelHealthResponse
    {
        public bool ok;
        public string product;
        public string release_focus;
    }

    [Serializable]
    public class KernelSnapshotResponse
    {
        public string world_name;
        public int[] world_bounds;
        public int active_agents;
        public string release_focus;
        public KernelSurfaces surfaces;
        public KernelExperimentRecord[] experiments;
        public KernelExperimentRecord LastExperiment;
        public KernelAgentResult[] agent_results;
    }

    [Serializable]
    public class KernelAgentResult
    {
        public string task_id;
        public string role;
        public string result_type;
        public string data;
        public string timestamp;
    }

    [Serializable]
    public class KernelSurfaces
    {
        public KernelSurfaceStatus vr;
        public KernelSurfaceStatus web;
        public KernelSurfaceStatus mobile;
    }

    [Serializable]
    public class KernelSurfaceStatus
    {
        public string name;
        public string status;
    }

    [Serializable]
    public class KernelExperimentRecord
    {
        public string experiment_id;
        public string experiment_type;
        public string token_address;
        public string status;
        public string video_url;
    }

    [Serializable]
    public class KernelCommandPayload
    {
        public string surface;
        public string mode;
        public string intent;
        public string gesture;
        public string anchor;
        public float[] focus;
        public string note;
        public string transcript;
        public float confidence;
        public string source;
        public string route;
        public string channel;
        public string pattern;
        public float intensity;
        public int duration_ms;
        public string token_address;
        public string chain;
        public string package_type;
        public string style_preset;
        public string creative_prompt;
        public string payment_route;
    }

    [Serializable]
    public class KernelCommandRequest
    {
        public string kind;
        public KernelCommandPayload payload;
    }

    [Serializable]
    public class KernelCommandReceipt
    {
        public bool accepted;
        public string command_kind;
        public string receipt;
        public string note;
    }
}
