using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace LastExperiments.Core
{
    public class KernelClient : MonoBehaviour
    {
        [SerializeField] private string baseUrl = "http://127.0.0.1:8787";
        [SerializeField] private bool logTraffic = true;
        [SerializeField] private string playerPrefsUrlKey = "lastexperiments.kernel.url";
        [SerializeField] private string environmentVariableKey = "LAST_EXPERIMENTS_KERNEL_URL";

        public string BaseUrl => baseUrl;
        public KernelSnapshotResponse LatestSnapshot { get; private set; }
        public KernelCommandReceipt LastReceipt { get; private set; }

        private void Awake()
        {
            ResolveBaseUrlOverrides();

            if (Application.isMobilePlatform && baseUrl.Contains("127.0.0.1"))
            {
                Debug.LogWarning(
                    "KernelClient is using loopback on a mobile platform. " +
                    "For Quest 3 hardware, switch Base Url to the host LAN IP or use adb reverse for tcp:8787.");
            }
        }

        [ContextMenu("Fetch Snapshot")]
        public void FetchSnapshotFromContext()
        {
            FetchSnapshot(
                snapshot => Debug.Log($"Kernel snapshot received for {snapshot.world_name}."),
                error => Debug.LogError(error));
        }

        [ContextMenu("Send Ready Command")]
        public void SendReadyCommandFromContext()
        {
            var request = new KernelCommandRequest
            {
                kind = "quest3.stage.ready",
                payload = new KernelCommandPayload
                {
                    surface = "quest3",
                    mode = Application.isEditor ? "editor" : "device",
                    intent = "bootstrap",
                    gesture = "none",
                    anchor = "stage-root",
                    focus = new[] { 0f, 0f, 0f },
                    note = "Context menu ready ping."
                }
            };

            SendCommand(
                request,
                receipt => Debug.Log($"Kernel receipt: {receipt.receipt}"),
                error => Debug.LogError(error));
        }

        public void FetchSnapshot(Action<KernelSnapshotResponse> onSuccess, Action<string> onError = null)
        {
            StartCoroutine(FetchSnapshotRoutine(onSuccess, onError));
        }

        public void SendCommand(
            KernelCommandRequest command,
            Action<KernelCommandReceipt> onSuccess = null,
            Action<string> onError = null)
        {
            StartCoroutine(SendCommandRoutine(command, onSuccess, onError));
        }

        private IEnumerator FetchSnapshotRoutine(Action<KernelSnapshotResponse> onSuccess, Action<string> onError)
        {
            using var request = UnityWebRequest.Get(BuildUrl("/snapshot"));
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                var message = $"Kernel snapshot request failed: {request.error}";
                onError?.Invoke(message);
                yield break;
            }

            var body = request.downloadHandler.text;
            var snapshot = JsonUtility.FromJson<KernelSnapshotResponse>(body);
            LatestSnapshot = snapshot;

            if (logTraffic)
            {
                Debug.Log($"Kernel snapshot body: {body}");
            }

            onSuccess?.Invoke(snapshot);
        }

        private IEnumerator SendCommandRoutine(
            KernelCommandRequest command,
            Action<KernelCommandReceipt> onSuccess,
            Action<string> onError)
        {
            var json = JsonUtility.ToJson(command);
            var bytes = Encoding.UTF8.GetBytes(json);

            using var request = new UnityWebRequest(BuildUrl("/command"), UnityWebRequest.kHttpVerbPOST);
            request.uploadHandler = new UploadHandlerRaw(bytes);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Accept", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                var message = $"Kernel command request failed: {request.error}";
                onError?.Invoke(message);
                yield break;
            }

            var body = request.downloadHandler.text;
            var receipt = JsonUtility.FromJson<KernelCommandReceipt>(body);
            LastReceipt = receipt;

            if (logTraffic)
            {
                Debug.Log($"Kernel command body: {json}");
                Debug.Log($"Kernel receipt body: {body}");
            }

            onSuccess?.Invoke(receipt);
        }

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
