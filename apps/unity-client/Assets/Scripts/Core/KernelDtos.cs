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
