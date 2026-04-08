using System.Collections;
using System.IO;
using LastExperiments.Core;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.Video;

namespace LastExperiments.Embodiment
{
    public class CinemaScreenDisplay : MonoBehaviour
    {
        [SerializeField] private KernelClient kernelClient;
        [SerializeField] private Vector3 _screenWorldPosition = new(28f, 2.2f, 20f);
        [SerializeField] private VideoPlayer _videoPlayer;
        [SerializeField] private RawImage _screenSurface;
        [SerializeField] private TextMeshPro _experimentLabel;
        [SerializeField] private bool autoPollSnapshots = true;
        [SerializeField] private float snapshotPollIntervalSeconds = 8f;

        private Coroutine _pollRoutine;
        private string _currentExperimentId;
        private string _currentTokenAddress;
        private float _originalAmbientIntensity = -1f;
        private Color _originalAmbientLight = Color.white;

        private void Awake()
        {
            if (kernelClient == null)
            {
                kernelClient = FindFirstObjectByType<KernelClient>();
            }

            if (_videoPlayer == null)
            {
                _videoPlayer = GetComponentInChildren<VideoPlayer>();
            }
        }

        private void Start()
        {
            if (_videoPlayer != null)
            {
                _videoPlayer.playOnAwake = false;
                _videoPlayer.isLooping = false;
                _videoPlayer.loopPointReached += HandlePlaybackStopped;
            }

            if (_screenSurface != null)
            {
                _screenSurface.transform.position = _screenWorldPosition;
            }
            else if (_videoPlayer != null)
            {
                _videoPlayer.transform.position = _screenWorldPosition;
            }

            UpdateLabel();
        }

        private void OnEnable()
        {
            if (autoPollSnapshots && kernelClient != null)
            {
                _pollRoutine = StartCoroutine(SnapshotPollLoop());
            }
        }

        private void OnDisable()
        {
            if (_pollRoutine != null)
            {
                StopCoroutine(_pollRoutine);
                _pollRoutine = null;
            }

            RestoreAmbientLighting();
        }

        private void OnDestroy()
        {
            if (_videoPlayer != null)
            {
                _videoPlayer.loopPointReached -= HandlePlaybackStopped;
            }
        }

        public void LoadExperiment(string videoUrl, string experimentId, string tokenAddress)
        {
            StartCoroutine(LoadExperimentRoutine(videoUrl, experimentId, tokenAddress));
        }

        private IEnumerator SnapshotPollLoop()
        {
            while (enabled)
            {
                var done = false;
                kernelClient.FetchSnapshot(
                    snapshot =>
                    {
                        done = true;
                        TryLoadLatestCinemaExperiment(snapshot);
                    },
                    _ => { done = true; });

                while (!done)
                {
                    yield return null;
                }

                yield return new WaitForSeconds(snapshotPollIntervalSeconds);
            }
        }

        private void TryLoadLatestCinemaExperiment(KernelSnapshotResponse snapshot)
        {
            if (snapshot == null)
            {
                return;
            }

            KernelExperimentRecord candidate = null;

            if (snapshot.experiments != null)
            {
                for (var i = snapshot.experiments.Length - 1; i >= 0; i--)
                {
                    var item = snapshot.experiments[i];
                    if (item == null)
                    {
                        continue;
                    }

                    if (!string.Equals(item.experiment_type, "CinemaExperiment") &&
                        !string.Equals(item.experiment_type, "CreateCinemaExperiment"))
                    {
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(item.video_url))
                    {
                        continue;
                    }

                    candidate = item;
                    break;
                }
            }

            if (candidate == null && snapshot.LastExperiment != null)
            {
                var last = snapshot.LastExperiment;
                if (!string.IsNullOrWhiteSpace(last.video_url) &&
                    (string.Equals(last.experiment_type, "CinemaExperiment") ||
                     string.Equals(last.experiment_type, "CreateCinemaExperiment")))
                {
                    candidate = last;
                }
            }

            if (candidate == null || string.IsNullOrWhiteSpace(candidate.experiment_id))
            {
                return;
            }

            if (_currentExperimentId == candidate.experiment_id)
            {
                return;
            }

            LoadExperiment(candidate.video_url, candidate.experiment_id, candidate.token_address);
        }

        private IEnumerator LoadExperimentRoutine(string videoUrl, string experimentId, string tokenAddress)
        {
            if (_videoPlayer == null || string.IsNullOrWhiteSpace(videoUrl))
            {
                yield break;
            }

            var cachedPath = Path.Combine(
                Application.temporaryCachePath,
                $"cinema-{Sanitize(experimentId)}{GuessVideoExtension(videoUrl)}");

            if (!File.Exists(cachedPath))
            {
                using var request = UnityWebRequest.Get(videoUrl);
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError($"CinemaScreenDisplay download failed: {request.error}");
                    yield break;
                }

                File.WriteAllBytes(cachedPath, request.downloadHandler.data);
            }

            _currentExperimentId = experimentId;
            _currentTokenAddress = tokenAddress;
            UpdateLabel();

            _videoPlayer.source = VideoSource.Url;
            _videoPlayer.url = cachedPath;
            _videoPlayer.Prepare();

            while (!_videoPlayer.isPrepared)
            {
                yield return null;
            }

            if (_screenSurface != null)
            {
                if (_videoPlayer.targetTexture == null)
                {
                    var renderTexture = new RenderTexture(1920, 1080, 0);
                    _videoPlayer.targetTexture = renderTexture;
                }

                _screenSurface.texture = _videoPlayer.targetTexture;
            }

            DimAmbientLighting();
            _videoPlayer.Play();
        }

        private void HandlePlaybackStopped(VideoPlayer _)
        {
            RestoreAmbientLighting();
        }

        private void DimAmbientLighting()
        {
            if (_originalAmbientIntensity < 0f)
            {
                _originalAmbientIntensity = RenderSettings.ambientIntensity;
                _originalAmbientLight = RenderSettings.ambientLight;
            }

            RenderSettings.ambientIntensity = _originalAmbientIntensity * 0.6f;
            RenderSettings.ambientLight = _originalAmbientLight * 0.6f;
        }

        private void RestoreAmbientLighting()
        {
            if (_originalAmbientIntensity < 0f)
            {
                return;
            }

            RenderSettings.ambientIntensity = _originalAmbientIntensity;
            RenderSettings.ambientLight = _originalAmbientLight;
        }

        private void UpdateLabel()
        {
            if (_experimentLabel == null)
            {
                return;
            }

            var experimentText = string.IsNullOrWhiteSpace(_currentExperimentId) ? "none" : _currentExperimentId;
            var tokenText = string.IsNullOrWhiteSpace(_currentTokenAddress) ? "unknown token" : _currentTokenAddress;
            _experimentLabel.text = $"Experiment: {experimentText}\nToken: {tokenText}";
        }

        private static string GuessVideoExtension(string videoUrl)
        {
            var lower = (videoUrl ?? string.Empty).ToLowerInvariant();
            if (lower.Contains(".webm"))
            {
                return ".webm";
            }
            if (lower.Contains(".mov"))
            {
                return ".mov";
            }
            return ".mp4";
        }

        private static string Sanitize(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "experiment";
            }

            foreach (var invalid in Path.GetInvalidFileNameChars())
            {
                value = value.Replace(invalid, '-');
            }

            return value;
        }
    }
}
