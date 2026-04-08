using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using LastExperiments.Core;
using LastExperiments.Voxel;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.XR;

namespace LastExperiments.Embodiment
{
    public class QuestVoiceBridge : MonoBehaviour
    {
        [SerializeField] private QuestStageController stageController;
        [SerializeField] private VoxelFloatingTerminal terminal;
        [SerializeField] private VoxelWristMenu wristMenu;
        [SerializeField] private VoxelLuaBridge luaBridge;
        [SerializeField] private string companionBaseUrl = "http://127.0.0.1:8798";
        [SerializeField] private bool autoRequestPermission = true;
        [SerializeField] private float captureSeconds = 4f;
        [SerializeField] private int sampleRate = 16000;
        [SerializeField] private bool listening;
        [SerializeField] private bool awaitingProposalConfirmation;
        [SerializeField] private KernelProposal pendingProposal;

        private AudioClip recordingClip;
        private float recordingStartedAt;
        private string microphoneDeviceName;
        private readonly List<InputDevice> rightControllers = new();
        private bool confirmButtonDown;
        private bool cancelButtonDown;

        public bool Listening => listening;

        private void Awake()
        {
            if (stageController == null)
            {
                stageController = GetComponent<QuestStageController>();
            }

            if (wristMenu == null)
            {
                wristMenu = GetComponent<VoxelWristMenu>();
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

            if (awaitingProposalConfirmation)
            {
                HandleProposalConfirmationInput();
            }
        }

        public void Initialize(QuestStageController controller, VoxelFloatingTerminal floatingTerminal)
        {
            stageController = controller;
            terminal = floatingTerminal;
            if (luaBridge == null)
            {
                luaBridge = FindFirstObjectByType<VoxelLuaBridge>();
            }
            if (wristMenu == null)
            {
                wristMenu = GetComponent<VoxelWristMenu>();
            }

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
            if (!string.IsNullOrWhiteSpace(response.cami_reply))
            {
                terminal?.Append($"cami: {response.cami_reply}");
            }
            TryHandleProceduralGenerationIntent(response.transcript);

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

            if (response.kernel_proposal != null && response.kernel_proposal.type == "CreateCinemaExperiment")
            {
                BeginProposalConfirmation(response.kernel_proposal);
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

        private void BeginProposalConfirmation(KernelProposal proposal)
        {
            pendingProposal = proposal;
            awaitingProposalConfirmation = true;
            confirmButtonDown = false;
            cancelButtonDown = false;

            var token = string.IsNullOrWhiteSpace(proposal?.token_address) ? "unknown token" : proposal.token_address;
            var prompt = $"Cami wants to generate a cinema video for {token}. Confirm?";
            terminal?.Append($"{prompt} (B/Button Two confirm, A/Button One cancel)");
            wristMenu?.ShowPrompt(prompt, 10f);
        }

        private void CancelProposalConfirmation()
        {
            terminal?.Append("cinema proposal cancelled");
            wristMenu?.ClearPrompt();
            awaitingProposalConfirmation = false;
            pendingProposal = null;
        }

        private void HandleProposalConfirmationInput()
        {
            var confirmPressed = ReadConfirmationButton();
            if (confirmPressed && !confirmButtonDown)
            {
                confirmButtonDown = true;
                if (pendingProposal != null)
                {
                    StartCoroutine(SendProposalConfirmationRoutine(pendingProposal));
                }
                return;
            }
            confirmButtonDown = confirmPressed;

            var cancelPressed = ReadCancelButton();
            if (cancelPressed && !cancelButtonDown)
            {
                cancelButtonDown = true;
                CancelProposalConfirmation();
                return;
            }
            cancelButtonDown = cancelPressed;
        }

        private IEnumerator SendProposalConfirmationRoutine(KernelProposal proposal)
        {
            awaitingProposalConfirmation = false;
            wristMenu?.ShowPrompt("Dispatching cinema proposal...", 4f);

            var payload = new ProposalConfirmRequest
            {
                confirm = true,
                source = "quest3-wrist-confirm",
                route = "cami-proposal-confirmed",
                kernel_proposal = proposal
            };

            var json = JsonUtility.ToJson(payload);
            using var request = new UnityWebRequest(BuildUrl("/proposal/confirm"), UnityWebRequest.kHttpVerbPOST);
            request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("X-Quest-Surface", "quest3");
            request.SetRequestHeader("X-Quest-Source", "quest3-wrist-confirm");

            yield return request.SendWebRequest();
            if (request.result != UnityWebRequest.Result.Success)
            {
                terminal?.Append($"cinema confirm failed: {request.error}");
                wristMenu?.ShowPrompt("Cinema confirm failed", 4f);
                pendingProposal = null;
                yield break;
            }

            var body = request.downloadHandler.text;
            var response = JsonUtility.FromJson<ProposalConfirmResponse>(body);
            if (response == null || !response.ok)
            {
                terminal?.Append("cinema confirm response parse failed");
                wristMenu?.ShowPrompt("Cinema confirm failed", 4f);
                pendingProposal = null;
                yield break;
            }

            if (!string.IsNullOrWhiteSpace(response.kernelReceipt?.receipt))
            {
                terminal?.Append($"cinema experiment accepted: {response.kernelReceipt.receipt}");
            }
            if (!string.IsNullOrWhiteSpace(response.cinemaDispatch?.jobId))
            {
                terminal?.Append($"cinema job: {response.cinemaDispatch.jobId} ({response.cinemaDispatch.status})");
            }

            wristMenu?.ShowPrompt("Cinema proposal confirmed", 4f);
            pendingProposal = null;
        }

        private bool ReadConfirmationButton()
        {
            if (TryReadOvrButtonDown("Two"))
            {
                return true;
            }

            return ReadRightControllerBool(CommonUsages.secondaryButton);
        }

        private bool ReadCancelButton()
        {
            if (TryReadOvrButtonDown("One"))
            {
                return true;
            }

            return ReadRightControllerBool(CommonUsages.primaryButton);
        }

        private bool ReadRightControllerBool(InputFeatureUsage<bool> usage)
        {
            InputDevices.GetDevicesWithCharacteristics(
                InputDeviceCharacteristics.Right | InputDeviceCharacteristics.Controller,
                rightControllers);

            if (rightControllers.Count == 0)
            {
                return false;
            }

            var device = rightControllers[0];
            return device.isValid && device.TryGetFeatureValue(usage, out var value) && value;
        }

        private static bool TryReadOvrButtonDown(string buttonName)
        {
            var ovrInputType = Type.GetType("OVRInput");
            if (ovrInputType == null)
            {
                return false;
            }

            var buttonType = ovrInputType.GetNestedType("Button");
            if (buttonType == null)
            {
                return false;
            }

            object buttonValue;
            try
            {
                buttonValue = Enum.Parse(buttonType, buttonName);
            }
            catch
            {
                return false;
            }

            var getDown = ovrInputType.GetMethod("GetDown", new[] { buttonType });
            if (getDown == null)
            {
                return false;
            }

            try
            {
                return getDown.Invoke(null, new[] { buttonValue }) is bool pressed && pressed;
            }
            catch
            {
                return false;
            }
        }

        private void TryHandleProceduralGenerationIntent(string transcript)
        {
            if (string.IsNullOrWhiteSpace(transcript) || luaBridge == null)
            {
                return;
            }

            var lower = transcript.Trim().ToLowerInvariant();
            var touchedLocalGeneration = false;

            if (lower.Contains("game of life") || lower.Contains("life 42") || lower.Contains("randomize voxels"))
            {
                var seed = Mathf.Abs(transcript.GetHashCode());
                var command = $"life42 7 0.22 {seed}";
                if (luaBridge.TryExecute(command, out var response))
                {
                    terminal?.Append($"local generation: {response}");
                    touchedLocalGeneration = true;
                }
            }

            if (lower.Contains("three js") || lower.Contains("threejs") || lower.Contains("video card"))
            {
                var token = ExtractTokenAddress(transcript);
                if (!string.IsNullOrWhiteSpace(token))
                {
                    var command = $"threecard {token} hyperflow_assembly 7 0.22";
                    if (luaBridge.TryExecute(command, out var response))
                    {
                        terminal?.Append($"three.js request: {response}");
                        touchedLocalGeneration = true;
                    }
                }
            }

            if (lower.Contains("contactway") || lower.Contains("haptic") || lower.Contains("pulse feedback"))
            {
                if (luaBridge.TryExecute("contactway pulse 0.72 240 vr_voice_ack", out var response))
                {
                    terminal?.Append($"contactway request: {response}");
                    touchedLocalGeneration = true;
                }
            }

            if (touchedLocalGeneration)
            {
                wristMenu?.ShowPrompt("Applied local adapter request", 4f);
            }
        }

        private static string ExtractTokenAddress(string transcript)
        {
            if (string.IsNullOrWhiteSpace(transcript))
            {
                return string.Empty;
            }

            var hex = Regex.Match(transcript, @"0x[a-fA-F0-9]{40}");
            if (hex.Success)
            {
                return hex.Value;
            }

            var base58 = Regex.Match(transcript, @"[1-9A-HJ-NP-Za-km-z]{32,48}");
            return base58.Success ? base58.Value : string.Empty;
        }

        [Serializable]
        public class QuestVoiceResponse
        {
            public bool ok;
            public string transcript;
            public float confidence;
            public string route;
            public string cami_reply;
            public KernelProposal kernel_proposal;
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

        [Serializable]
        public class KernelProposal
        {
            public string type;
            public string token_address;
            public string chain;
            public string package_type;
            public string style_preset;
            public string creative_prompt;
            public string payment_route;
        }

        [Serializable]
        public class ProposalConfirmRequest
        {
            public bool confirm;
            public string source;
            public string route;
            public KernelProposal kernel_proposal;
        }

        [Serializable]
        public class ProposalConfirmResponse
        {
            public bool ok;
            public bool cancelled;
            public string experimentId;
            public KernelCommandReceipt kernelReceipt;
            public CinemaDispatchResponse cinemaDispatch;
        }

        [Serializable]
        public class CinemaDispatchResponse
        {
            public string jobId;
            public string status;
            public string videoUrl;
            public string reportUrl;
        }
    }
}
