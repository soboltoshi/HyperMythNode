using System;
using System.Collections;
using System.IO;
using System.Text;
using LastExperiments.Core;
using LastExperiments.Voxel;
using UnityEngine;
using UnityEngine.Networking;

namespace LastExperiments.Embodiment
{
    public class QuestVoiceBridge : MonoBehaviour
    {
        [SerializeField] private QuestStageController stageController;
        [SerializeField] private VoxelFloatingTerminal terminal;
        [SerializeField] private string companionBaseUrl = "http://127.0.0.1:8798";
        [SerializeField] private bool autoRequestPermission = true;
        [SerializeField] private float captureSeconds = 4f;
        [SerializeField] private int sampleRate = 16000;
        [SerializeField] private bool listening;

        private AudioClip recordingClip;
        private float recordingStartedAt;
        private string microphoneDeviceName;

        public bool Listening => listening;

        private void Awake()
        {
            if (stageController == null)
            {
                stageController = GetComponent<QuestStageController>();
            }
        }

        private void Start()
        {
#if UNITY_ANDROID && !UNITY_EDITOR
            if (autoRequestPermission && !UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Microphone))
            {
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.Microphone);
            }
#endif
        }

        private void Update()
        {
            if (!listening)
            {
                return;
            }

            if (Time.time - recordingStartedAt >= captureSeconds)
            {
                StopListening();
            }
        }

        public void Initialize(QuestStageController controller, VoxelFloatingTerminal floatingTerminal)
        {
            stageController = controller;
            terminal = floatingTerminal;

            if (stageController != null && stageController.KernelClient != null)
            {
                var kernelBaseUrl = stageController.KernelClient.BaseUrl;
                if (string.IsNullOrWhiteSpace(companionBaseUrl) || companionBaseUrl.Contains("127.0.0.1"))
                {
                    companionBaseUrl = kernelBaseUrl.Replace("8787", "8798");
                }
            }
        }

        public void ToggleListening()
        {
            if (listening)
            {
                StopListening();
                return;
            }

            StartListening();
        }

        public void StartListening()
        {
            if (listening)
            {
                return;
            }

            if (autoRequestPermission
#if UNITY_ANDROID && !UNITY_EDITOR
                && !UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Microphone)
#endif
            )
            {
                terminal?.Append("voice permission requested");
#if UNITY_ANDROID && !UNITY_EDITOR
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.Microphone);
#endif
                return;
            }

            microphoneDeviceName = Microphone.devices.Length > 0 ? Microphone.devices[0] : null;
            recordingClip = Microphone.Start(microphoneDeviceName, false, Mathf.CeilToInt(captureSeconds) + 1, sampleRate);
            if (recordingClip == null)
            {
                terminal?.Append("voice recording unavailable");
                return;
            }

            listening = true;
            recordingStartedAt = Time.time;
            terminal?.Append("voice listening started");
        }

        public void StopListening()
        {
            if (!listening)
            {
                return;
            }

            listening = false;
            if (!string.IsNullOrEmpty(microphoneDeviceName))
            {
                Microphone.End(microphoneDeviceName);
            }

            if (recordingClip == null)
            {
                terminal?.Append("voice recording missing clip");
                return;
            }

            StartCoroutine(UploadRecordingRoutine(recordingClip));
            recordingClip = null;
        }

        private IEnumerator UploadRecordingRoutine(AudioClip clip)
        {
            var wavBytes = EncodeAsWav(clip);
            if (wavBytes == null || wavBytes.Length == 0)
            {
                terminal?.Append("voice encoding failed");
                yield break;
            }

            using var request = new UnityWebRequest(BuildUrl("/voice"), UnityWebRequest.kHttpVerbPOST);
            request.uploadHandler = new UploadHandlerRaw(wavBytes);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "audio/wav");
            request.SetRequestHeader("X-Quest-Surface", "quest3");
            request.SetRequestHeader("X-Quest-Mode", "vr");
            request.SetRequestHeader("X-Quest-Source", "quest3-voice");

            terminal?.Append("voice upload started");
            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                terminal?.Append($"voice upload failed: {request.error}");
                yield break;
            }

            var body = request.downloadHandler.text;
            var response = JsonUtility.FromJson<QuestVoiceResponse>(body);
            if (response == null)
            {
                terminal?.Append("voice response parse failed");
                yield break;
            }

            terminal?.Append($"voice transcript: {response.transcript}");
            if (!string.IsNullOrWhiteSpace(response.route))
            {
                terminal?.Append($"route: {response.route}");
            }

            if (stageController != null && !string.IsNullOrWhiteSpace(response.transcript))
            {
                stageController.SendVoiceCommand(
                    response.transcript,
                    response.confidence <= 0f ? 1f : response.confidence,
                    "claw-companion",
                    response.route);
            }

            if (!string.IsNullOrWhiteSpace(response.kernelReceipt?.receipt))
            {
                terminal?.Append($"kernel receipt: {response.kernelReceipt.receipt}");
            }
        }

        private string BuildUrl(string route)
        {
            return $"{companionBaseUrl.TrimEnd('/')}/{route.TrimStart('/')}";
        }

        private static byte[] EncodeAsWav(AudioClip clip)
        {
            if (clip == null)
            {
                return Array.Empty<byte>();
            }

            var samples = new float[clip.samples * clip.channels];
            clip.GetData(samples, 0);
            var pcm16 = new byte[samples.Length * 2];
            var offset = 0;
            for (var i = 0; i < samples.Length; i++)
            {
                var clamped = Mathf.Clamp(samples[i], -1f, 1f);
                var value = (short)Mathf.RoundToInt(clamped * short.MaxValue);
                pcm16[offset++] = (byte)(value & 0xff);
                pcm16[offset++] = (byte)((value >> 8) & 0xff);
            }

            using var stream = new MemoryStream();
            using var writer = new BinaryWriter(stream, Encoding.UTF8, true);
            WriteWavHeader(writer, clip.channels, clip.frequency, pcm16.Length);
            writer.Write(pcm16);
            writer.Flush();
            return stream.ToArray();
        }

        private static void WriteWavHeader(BinaryWriter writer, int channels, int sampleRate, int pcmDataLength)
        {
            writer.Write(Encoding.ASCII.GetBytes("RIFF"));
            writer.Write(36 + pcmDataLength);
            writer.Write(Encoding.ASCII.GetBytes("WAVE"));
            writer.Write(Encoding.ASCII.GetBytes("fmt "));
            writer.Write(16);
            writer.Write((short)1);
            writer.Write((short)channels);
            writer.Write(sampleRate);
            writer.Write(sampleRate * channels * 2);
            writer.Write((short)(channels * 2));
            writer.Write((short)16);
            writer.Write(Encoding.ASCII.GetBytes("data"));
            writer.Write(pcmDataLength);
        }

        [Serializable]
        public class QuestVoiceResponse
        {
            public bool ok;
            public string transcript;
            public float confidence;
            public string route;
            public KernelCommandReceipt kernelReceipt;
            public HermesTaskResponse hermesTask;
        }

        [Serializable]
        public class HermesTaskResponse
        {
            public string id;
            public string role;
            public string instruction;
            public string status;
        }
    }
}
