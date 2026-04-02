using LastExperiments.Core;
using LastExperiments.World;
using UnityEngine;

namespace LastExperiments.Embodiment
{
    public class QuestStageController : MonoBehaviour
    {
        [SerializeField] private KernelClient kernelClient;
        [SerializeField] private WorldBoundsRenderer boundsRenderer;
        [SerializeField] private Transform worldRoot;
        [SerializeField] private float cellSizeMeters = 0.08f;
        [SerializeField] private bool mixedRealityMode = true;
        [SerializeField] private bool sendReadyCommandOnBoot = true;

        [SerializeField] private string stageStatus = "idle";
        [SerializeField] private string lastReceipt = "none";

        public KernelClient KernelClient => kernelClient;
        public Transform WorldRoot => worldRoot != null ? worldRoot : transform;

        private void Awake()
        {
            if (kernelClient == null)
            {
                kernelClient = FindFirstObjectByType<KernelClient>();
            }

            if (boundsRenderer == null)
            {
                boundsRenderer = FindFirstObjectByType<WorldBoundsRenderer>();
            }
        }

        private void Start()
        {
            BootstrapStage();
        }

        [ContextMenu("Bootstrap Stage")]
        public void BootstrapStage()
        {
            stageStatus = "requesting snapshot";

            if (kernelClient == null)
            {
                stageStatus = "missing kernel client";
                Debug.LogError("QuestStageController requires a KernelClient.");
                return;
            }

            kernelClient.FetchSnapshot(HandleSnapshot, HandleKernelError);
        }

        [ContextMenu("Refresh Snapshot")]
        public void RefreshSnapshot()
        {
            BootstrapStage();
        }

        [ContextMenu("Send Room Anchor Command")]
        public void SendRoomAnchorCommand()
        {
            SendStageCommand("room-anchor", "none", "Quest room anchor requested.");
        }

        [ContextMenu("Send Build Preview Command")]
        public void SendBuildPreviewCommand()
        {
            SendStageCommand("build-preview", "pinch", "Quest build preview requested.");
        }

        [ContextMenu("Send Voice Command")]
        public void SendVoiceCommand()
        {
            SendVoiceCommand("voice command", 1f, "quest3-voice");
        }

        public void SendVoiceCommand(string transcript, float confidence, string source, string routeSummary = "")
        {
            SendStageCommand(
                "voice-command",
                "microphone",
                $"Voice transcript from {source}: {transcript}",
                transcript,
                confidence,
                source,
                routeSummary);
        }

        private void HandleSnapshot(KernelSnapshotResponse snapshot)
        {
            stageStatus = $"snapshot loaded: {snapshot.world_name}";

            if (boundsRenderer != null)
            {
                var parent = worldRoot != null ? worldRoot : transform;
                boundsRenderer.RenderBounds(snapshot.world_bounds, cellSizeMeters, parent);
            }

            Debug.Log(
                $"Quest stage booted from kernel. Focus: {snapshot.release_focus}. " +
                $"VR surface: {snapshot.surfaces?.vr?.name} ({snapshot.surfaces?.vr?.status}).");

            if (sendReadyCommandOnBoot)
            {
                SendStageCommand("bootstrap", "none", "Quest stage finished initial snapshot bootstrap.");
            }
        }

        private void HandleKernelError(string error)
        {
            stageStatus = "kernel error";
            Debug.LogError(error);
        }

        private void SendStageCommand(
            string intent,
            string gesture,
            string note,
            string transcript = "",
            float confidence = 1f,
            string source = "",
            string routeSummary = "")
        {
            if (kernelClient == null)
            {
                Debug.LogError("Cannot send a stage command without a KernelClient.");
                return;
            }

            var focus = worldRoot != null ? worldRoot.position : transform.position;
            var request = new KernelCommandRequest
            {
                kind = "quest3.stage.command",
                payload = new KernelCommandPayload
                {
                    surface = "quest3",
                    mode = mixedRealityMode ? "mr" : "vr",
                    intent = intent,
                    gesture = gesture,
                    anchor = mixedRealityMode ? "room-space" : "headlocked-shell",
                    focus = new[] { focus.x, focus.y, focus.z },
                    note = routeSummary.Length > 0 ? $"{note} | route: {routeSummary}" : note,
                    transcript = transcript,
                    confidence = confidence,
                    source = source,
                    route = routeSummary
                }
            };

            stageStatus = $"sending {intent}";

            kernelClient.SendCommand(
                request,
                receipt =>
                {
                    lastReceipt = receipt.receipt;
                    stageStatus = receipt.accepted ? "kernel acknowledged" : "kernel rejected";
                    Debug.Log($"Quest stage command receipt: {receipt.receipt} / {receipt.note}");
                },
                HandleKernelError);
        }
    }
}
