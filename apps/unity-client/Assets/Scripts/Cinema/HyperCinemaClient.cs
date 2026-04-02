using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace LastExperiments.Cinema
{
    /// <summary>
    /// HTTP client for the HyperCinema adapter endpoints on the lx-core kernel.
    /// Mirrors the pattern established by KernelClient: coroutine-based requests,
    /// configurable base URL, optional traffic logging.
    ///
    /// Attach to any GameObject. Reference from HyperCinemaSurfaceController.
    /// </summary>
    public class HyperCinemaClient : MonoBehaviour
    {
        [SerializeField] private string baseUrl = "http://127.0.0.1:8787";
        [SerializeField] private bool logTraffic = true;
        [SerializeField] private string playerPrefsUrlKey = "lastexperiments.kernel.url";
        [SerializeField] private string environmentVariableKey = "LAST_EXPERIMENTS_KERNEL_URL";

        public string BaseUrl => baseUrl;
        public HyperCinemaServiceManifest LatestManifest { get; private set; }
        public HyperCinemaJob LastCreatedJob { get; private set; }

        private void Awake()
        {
            ResolveBaseUrlOverrides();

            if (Application.isMobilePlatform && baseUrl.Contains("127.0.0.1"))
            {
                Debug.LogWarning(
                    "HyperCinemaClient is using loopback on a mobile platform. " +
                    "For Quest 3 hardware, switch Base Url to the host LAN IP " +
                    "or use 'adb reverse tcp:8787 tcp:8787' during debug sessions.");
            }
        }

        // ---- Service manifest ----

        [ContextMenu("Fetch Service Manifest")]
        public void FetchServiceManifestFromContext()
        {
            FetchServiceManifest(
                manifest => Debug.Log($"HyperCinema manifest loaded: {manifest.adapter} — {manifest.studios?.Length ?? 0} studios."),
                error => Debug.LogError(error));
        }

        public void FetchServiceManifest(
            Action<HyperCinemaServiceManifest> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(FetchManifestRoutine(onSuccess, onError));
        }

        private IEnumerator FetchManifestRoutine(
            Action<HyperCinemaServiceManifest> onSuccess,
            Action<string> onError)
        {
            using var request = UnityWebRequest.Get(BuildUrl("/api/service"));
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"HyperCinema manifest request failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var manifest = JsonUtility.FromJson<HyperCinemaServiceManifest>(body);
            LatestManifest = manifest;

            if (logTraffic)
            {
                Debug.Log($"HyperCinema manifest body: {body}");
            }

            onSuccess?.Invoke(manifest);
        }

        // ---- Job list ----

        [ContextMenu("Fetch Jobs")]
        public void FetchJobsFromContext()
        {
            FetchJobs(
                response => Debug.Log($"HyperCinema jobs loaded: {response.jobs?.Length ?? 0} jobs."),
                error => Debug.LogError(error));
        }

        public void FetchJobs(
            Action<HyperCinemaJobListResponse> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(FetchJobsRoutine(onSuccess, onError));
        }

        private IEnumerator FetchJobsRoutine(
            Action<HyperCinemaJobListResponse> onSuccess,
            Action<string> onError)
        {
            using var request = UnityWebRequest.Get(BuildUrl("/api/jobs"));
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"HyperCinema job list request failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var response = JsonUtility.FromJson<HyperCinemaJobListResponse>(body);

            if (logTraffic)
            {
                Debug.Log($"HyperCinema jobs body: {body}");
            }

            onSuccess?.Invoke(response);
        }

        // ---- Single job ----

        public void FetchJob(
            string jobId,
            Action<HyperCinemaJob> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(FetchJobRoutine(jobId, onSuccess, onError));
        }

        private IEnumerator FetchJobRoutine(
            string jobId,
            Action<HyperCinemaJob> onSuccess,
            Action<string> onError)
        {
            using var request = UnityWebRequest.Get(BuildUrl($"/api/jobs/{jobId}"));
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"HyperCinema job '{jobId}' request failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var job = JsonUtility.FromJson<HyperCinemaJob>(body);

            if (logTraffic)
            {
                Debug.Log($"HyperCinema job body: {body}");
            }

            onSuccess?.Invoke(job);
        }

        // ---- Create job ----

        [ContextMenu("Create Quick HashCinema Job")]
        public void CreateQuickJobFromContext()
        {
            var req = HyperCinemaJobRequest.QuickCreate("HashCinema", "A quick test job from Unity context menu.");
            CreateJob(
                req,
                job => Debug.Log($"HyperCinema job created: {job.job_id} — {job.project_title}"),
                error => Debug.LogError(error));
        }

        public void CreateJob(
            HyperCinemaJobRequest jobRequest,
            Action<HyperCinemaJob> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(CreateJobRoutine(jobRequest, onSuccess, onError));
        }

        private IEnumerator CreateJobRoutine(
            HyperCinemaJobRequest jobRequest,
            Action<HyperCinemaJob> onSuccess,
            Action<string> onError)
        {
            var json = JsonUtility.ToJson(jobRequest);
            var bytes = Encoding.UTF8.GetBytes(json);

            using var request = new UnityWebRequest(BuildUrl("/api/jobs"), UnityWebRequest.kHttpVerbPOST);
            request.uploadHandler = new UploadHandlerRaw(bytes);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"HyperCinema create job request failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var job = JsonUtility.FromJson<HyperCinemaJob>(body);
            LastCreatedJob = job;

            if (logTraffic)
            {
                Debug.Log($"HyperCinema create job request: {json}");
                Debug.Log($"HyperCinema create job response: {body}");
            }

            onSuccess?.Invoke(job);
        }

        // ---- Report ----

        public void FetchReport(
            string jobId,
            Action<HyperCinemaReportResponse> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(FetchReportRoutine(jobId, onSuccess, onError));
        }

        private IEnumerator FetchReportRoutine(
            string jobId,
            Action<HyperCinemaReportResponse> onSuccess,
            Action<string> onError)
        {
            using var request = UnityWebRequest.Get(BuildUrl($"/api/report/{jobId}"));
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"HyperCinema report '{jobId}' request failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var report = JsonUtility.FromJson<HyperCinemaReportResponse>(body);

            if (logTraffic)
            {
                Debug.Log($"HyperCinema report body: {body}");
            }

            onSuccess?.Invoke(report);
        }

        // ---- Helpers ----

        private string BuildUrl(string path)
        {
            return $"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}";
        }

        public void SetBaseUrl(string url, bool persistToPrefs = true)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return;
            }

            baseUrl = url.Trim().TrimEnd('/');

            if (persistToPrefs)
            {
                PlayerPrefs.SetString(playerPrefsUrlKey, baseUrl);
                PlayerPrefs.Save();
            }
        }

        private void ResolveBaseUrlOverrides()
        {
            if (PlayerPrefs.HasKey(playerPrefsUrlKey))
            {
                baseUrl = PlayerPrefs.GetString(playerPrefsUrlKey).Trim().TrimEnd('/');
                return;
            }

            var envValue = Environment.GetEnvironmentVariable(environmentVariableKey);
            if (!string.IsNullOrWhiteSpace(envValue))
            {
                baseUrl = envValue.Trim().TrimEnd('/');
            }
        }
    }
}
