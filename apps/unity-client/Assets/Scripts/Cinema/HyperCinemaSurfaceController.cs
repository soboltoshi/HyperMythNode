using LastExperiments.Core;
using UnityEngine;

namespace LastExperiments.Cinema
{
    /// <summary>
    /// First cinema surface controller for the Quest 3 client.
    ///
    /// Responsibilities:
    ///   - On boot: optionally fetch the service manifest and surface studio/style options.
    ///   - Expose CreateJobFromContext() so VR interactions (wrist menu, gesture, etc.)
    ///     can trigger job creation without needing direct access to HyperCinemaClient.
    ///   - Notify the kernel truth layer via KernelClient /command when a job is ready.
    ///   - Expose inspector-visible fields for the currently loaded manifest and job.
    ///
    /// Scene wiring:
    ///   Suggested object: "HyperCinemaBridge"
    ///   Attach: HyperCinemaSurfaceController + HyperCinemaClient
    ///   Optional attach: KernelClient (shared with QuestStageController or its own)
    /// </summary>
    public class HyperCinemaSurfaceController : MonoBehaviour
    {
        [Header("Dependencies")]
        [SerializeField] private HyperCinemaClient cinemaClient;
        [SerializeField] private KernelClient kernelClient;

        [Header("Boot behaviour")]
        [SerializeField] private bool fetchManifestOnBoot = true;
        [SerializeField] private string defaultStudio = "HashCinema";
        [SerializeField] private string defaultStylePreset = "hyperflow_assembly";

        [Header("State (read-only in inspector)")]
        [SerializeField] private string surfaceStatus = "idle";
        [SerializeField] private string loadedAdapter = "none";
        [SerializeField] private int studioCount = 0;
        [SerializeField] private string currentJobId = "none";
        [SerializeField] private string currentJobTitle = "none";
        [SerializeField] private int currentSceneCount = 0;
        [SerializeField] private string currentJobSummary = "";

        public HyperCinemaJob CurrentJob { get; private set; }
        public HyperCinemaServiceManifest ServiceManifest { get; private set; }

        private void Awake()
        {
            if (cinemaClient == null)
            {
                cinemaClient = FindFirstObjectByType<HyperCinemaClient>();
            }

            if (kernelClient == null)
            {
                kernelClient = FindFirstObjectByType<KernelClient>();
            }
        }

        private void Start()
        {
            if (fetchManifestOnBoot)
            {
                LoadManifest();
            }
        }

        // ---- Manifest ----

        [ContextMenu("Load Service Manifest")]
        public void LoadManifest()
        {
            if (cinemaClient == null)
            {
                surfaceStatus = "missing cinema client";
                Debug.LogError("HyperCinemaSurfaceController requires a HyperCinemaClient.");
                return;
            }

            surfaceStatus = "loading manifest";

            cinemaClient.FetchServiceManifest(
                HandleManifestLoaded,
                HandleError);
        }

        private void HandleManifestLoaded(HyperCinemaServiceManifest manifest)
        {
            ServiceManifest = manifest;
            loadedAdapter = manifest.adapter ?? "unknown";
            studioCount = manifest.studios?.Length ?? 0;
            surfaceStatus = $"manifest loaded — {studioCount} studios";

            Debug.Log(
                $"HyperCinemaSurface manifest loaded. Adapter: {loadedAdapter}. " +
                $"Studios: {studioCount}. Payment: {manifest.payment_mode}.");
        }

        // ---- Job creation ----

        /// <summary>
        /// Create a job using the default studio and style, driven by a single core idea string.
        /// Useful for wrist-menu or gesture-triggered quick-creates from VR.
        /// </summary>
        [ContextMenu("Create Quick Job (Default Studio)")]
        public void CreateQuickJobFromContext()
        {
            CreateJobFromContext(defaultStudio, "Quick VR test job assembled from Quest 3.");
        }

        public void CreateJobFromContext(string coreIdea)
        {
            CreateJobFromContext(defaultStudio, coreIdea);
        }

        public void CreateJobFromContext(string studio, string coreIdea)
        {
            if (cinemaClient == null)
            {
                Debug.LogError("Cannot create a HyperCinema job without a HyperCinemaClient.");
                return;
            }

            var request = HyperCinemaJobRequest.QuickCreate(
                string.IsNullOrWhiteSpace(studio) ? defaultStudio : studio,
                coreIdea);
            request.style_preset = defaultStylePreset;

            surfaceStatus = $"creating job — {request.studio}";

            cinemaClient.CreateJob(request, HandleJobCreated, HandleError);
        }

        public void CreateJob(HyperCinemaJobRequest request)
        {
            if (cinemaClient == null)
            {
                Debug.LogError("Cannot create a HyperCinema job without a HyperCinemaClient.");
                return;
            }

            surfaceStatus = $"creating job — {request.studio}";
            cinemaClient.CreateJob(request, HandleJobCreated, HandleError);
        }

        private void HandleJobCreated(HyperCinemaJob job)
        {
            CurrentJob = job;
            currentJobId = job.job_id;
            currentJobTitle = job.project_title;
            currentSceneCount = job.scene_cards?.Length ?? 0;
            currentJobSummary = job.summary;
            surfaceStatus = $"job ready — {job.job_id}";

            Debug.Log(
                $"HyperCinemaSurface job created: {job.job_id} / {job.project_title} " +
                $"({currentSceneCount} scene cards, studio {job.studio}).");

            NotifyKernelJobReady(job);
        }

        // ---- Kernel notification ----

        private void NotifyKernelJobReady(HyperCinemaJob job)
        {
            if (kernelClient == null)
            {
                return;
            }

            var command = new KernelCommandRequest
            {
                kind = "hypercinema.job.ready",
                payload = new KernelCommandPayload
                {
                    surface = "hypercinema",
                    mode = Application.isEditor ? "editor" : "device",
                    intent = "job-ready",
                    gesture = "none",
                    anchor = "hypercinema-surface",
                    focus = new[] { 0f, 0f, 0f },
                    note = $"HyperCinema job {job.job_id} assembled: {job.project_title}",
                }
            };

            kernelClient.SendCommand(
                command,
                receipt => Debug.Log($"Kernel acknowledged HyperCinema job ready: {receipt.receipt}"),
                error => Debug.LogWarning($"Kernel notification failed (non-critical): {error}"));
        }

        // ---- Report fetch ----

        public void FetchCurrentReport()
        {
            if (CurrentJob == null)
            {
                Debug.LogWarning("No current job to fetch a report for.");
                return;
            }

            FetchReport(CurrentJob.job_id);
        }

        public void FetchReport(string jobId)
        {
            if (cinemaClient == null)
            {
                Debug.LogError("Cannot fetch a report without a HyperCinemaClient.");
                return;
            }

            cinemaClient.FetchReport(
                jobId,
                report =>
                {
                    Debug.Log($"HyperCinemaSurface report for {report.job_id}: {report.summary}");
                    foreach (var card in report.scene_cards ?? System.Array.Empty<HyperCinemaSceneCard>())
                    {
                        Debug.Log($"  Scene {card.index}: {card.beat} | cam: {card.camera_motion}");
                    }
                },
                HandleError);
        }

        // ---- Error handling ----

        private void HandleError(string error)
        {
            surfaceStatus = "error";
            Debug.LogError(error);
        }
    }
}
