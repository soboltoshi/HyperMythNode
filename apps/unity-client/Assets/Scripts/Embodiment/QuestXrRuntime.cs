using System.Collections.Generic;
using LastExperiments.Core;
using LastExperiments.Voxel;
using UnityEngine;
using UnityEngine.XR;

namespace LastExperiments.Embodiment
{
    /// <summary>
    /// Minimal Quest runtime rig and interaction loop for scenes that do not yet use XR prefabs.
    /// Creates head/hand anchors and forwards basic controller intents to QuestStageController.
    /// </summary>
    public class QuestXrRuntime : MonoBehaviour
    {
        [SerializeField] private QuestStageController stageController;
        [SerializeField] private Transform rigRoot;
        [SerializeField] private Transform headAnchor;
        [SerializeField] private Transform leftHandAnchor;
        [SerializeField] private Transform rightHandAnchor;

        [Header("XR Inputs")]
        [SerializeField] private bool sendPreviewOnRightSecondary = true;
        [SerializeField] private bool sendAnchorOnLeftPrimary = true;

        [Header("Voxel Stack")]
        [SerializeField] private VoxelWorldRuntime voxelWorld;
        [SerializeField] private VoxelCreatorController creatorController;
        [SerializeField] private VoxelHologramPreview hologramPreview;
        [SerializeField] private VoxelWristMenu wristMenu;
        [SerializeField] private VoxelFloatingTerminal floatingTerminal;
        [SerializeField] private VoxelLuaBridge luaBridge;
        [SerializeField] private VoxelLocomotionController locomotionController;
        [SerializeField] private QuestVoiceBridge voiceBridge;
        [SerializeField] private QuestXriStackBootstrap xriStackBootstrap;

        private readonly List<InputDevice> headDevices = new();
        private readonly List<InputDevice> leftDevices = new();
        private readonly List<InputDevice> rightDevices = new();

        private bool rightTriggerDown;
        private bool rightGripDown;
        private bool leftPrimaryDown;
        private bool leftSecondaryDown;
        private bool leftGripDown;
        private bool rightPrimaryDown;
        private bool rightSecondaryDown;

        public Transform HeadAnchor => headAnchor;
        public Transform LeftHandAnchor => leftHandAnchor;
        public Transform RightHandAnchor => rightHandAnchor;

        private void Awake()
        {
            if (stageController == null)
            {
                stageController = GetComponent<QuestStageController>();
            }

            BuildRuntimeRig();
            EnsureVoxelStack();
        }

        private void Update()
        {
            UpdateAnchors();

            if (creatorController != null)
            {
                creatorController.UpdatePreview(rightHandAnchor != null ? rightHandAnchor : headAnchor);
            }

            UpdateInteractionLoop();
        }

        private void BuildRuntimeRig()
        {
            if (rigRoot == null)
            {
                var rig = new GameObject("XRRuntimeRig");
                rig.transform.SetParent(transform, false);
                rigRoot = rig.transform;
            }

            if (headAnchor == null)
            {
                var head = new GameObject("HeadAnchor");
                head.transform.SetParent(rigRoot, false);
                var camera = head.AddComponent<Camera>();
                camera.nearClipPlane = 0.03f;
                camera.farClipPlane = 300f;
                head.AddComponent<AudioListener>();
                head.tag = "MainCamera";
                headAnchor = head.transform;
            }

            if (leftHandAnchor == null)
            {
                var left = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                left.name = "LeftHandAnchor";
                left.transform.SetParent(rigRoot, false);
                left.transform.localScale = Vector3.one * 0.05f;
                Destroy(left.GetComponent<Collider>());
                leftHandAnchor = left.transform;
            }

            if (rightHandAnchor == null)
            {
                var right = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                right.name = "RightHandAnchor";
                right.transform.SetParent(rigRoot, false);
                right.transform.localScale = Vector3.one * 0.05f;
                Destroy(right.GetComponent<Collider>());
                var renderer = right.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = new Color(0.95f, 0.38f, 0.18f, 1f);
                }
                rightHandAnchor = right.transform;
            }
        }

        private void EnsureVoxelStack()
        {
            if (xriStackBootstrap == null)
            {
                xriStackBootstrap = GetComponent<QuestXriStackBootstrap>();
                if (xriStackBootstrap == null)
                {
                    xriStackBootstrap = gameObject.AddComponent<QuestXriStackBootstrap>();
                }
            }
            xriStackBootstrap.EnsureXriRuntimeStack();

            if (voxelWorld == null)
            {
                voxelWorld = GetComponent<VoxelWorldRuntime>();
                if (voxelWorld == null)
                {
                    voxelWorld = gameObject.AddComponent<VoxelWorldRuntime>();
                }
            }
            if (stageController != null)
            {
                voxelWorld.AssignWorldRoot(stageController.WorldRoot);
            }

            if (hologramPreview == null)
            {
                hologramPreview = GetComponent<VoxelHologramPreview>();
                if (hologramPreview == null)
                {
                    hologramPreview = gameObject.AddComponent<VoxelHologramPreview>();
                }
            }

            hologramPreview.Initialize(voxelWorld);

            if (creatorController == null)
            {
                creatorController = GetComponent<VoxelCreatorController>();
                if (creatorController == null)
                {
                    creatorController = gameObject.AddComponent<VoxelCreatorController>();
                }
            }

            creatorController.Initialize(voxelWorld, hologramPreview);

            if (luaBridge == null)
            {
                luaBridge = GetComponent<VoxelLuaBridge>();
                if (luaBridge == null)
                {
                    luaBridge = gameObject.AddComponent<VoxelLuaBridge>();
                }
            }

            if (wristMenu == null)
            {
                wristMenu = GetComponent<VoxelWristMenu>();
                if (wristMenu == null)
                {
                    wristMenu = gameObject.AddComponent<VoxelWristMenu>();
                }
            }
            wristMenu.Initialize(leftHandAnchor, headAnchor, creatorController);

            if (floatingTerminal == null)
            {
                floatingTerminal = GetComponent<VoxelFloatingTerminal>();
                if (floatingTerminal == null)
                {
                    floatingTerminal = gameObject.AddComponent<VoxelFloatingTerminal>();
                }
            }
            floatingTerminal.Initialize(headAnchor, luaBridge);

            if (locomotionController == null)
            {
                locomotionController = GetComponent<VoxelLocomotionController>();
                if (locomotionController == null)
                {
                    locomotionController = gameObject.AddComponent<VoxelLocomotionController>();
                }
            }
            locomotionController.Initialize(voxelWorld, rigRoot, headAnchor);

            if (voiceBridge == null)
            {
                voiceBridge = GetComponent<QuestVoiceBridge>();
                if (voiceBridge == null)
                {
                    voiceBridge = gameObject.AddComponent<QuestVoiceBridge>();
                }
            }
            voiceBridge.Initialize(stageController, floatingTerminal);
        }

        private void UpdateAnchors()
        {
            UpdateDevicePose(InputDeviceCharacteristics.HeadMounted, headDevices, headAnchor);
            UpdateDevicePose(
                InputDeviceCharacteristics.Left | InputDeviceCharacteristics.Controller,
                leftDevices,
                leftHandAnchor);
            UpdateDevicePose(
                InputDeviceCharacteristics.Right | InputDeviceCharacteristics.Controller,
                rightDevices,
                rightHandAnchor);
        }

        private static void UpdateDevicePose(
            InputDeviceCharacteristics characteristics,
            List<InputDevice> devices,
            Transform anchor)
        {
            if (anchor == null)
            {
                return;
            }

            InputDevices.GetDevicesWithCharacteristics(characteristics, devices);
            if (devices.Count == 0)
            {
                return;
            }

            var device = devices[0];
            if (!device.isValid)
            {
                return;
            }

            if (device.TryGetFeatureValue(CommonUsages.devicePosition, out var position))
            {
                anchor.localPosition = position;
            }

            if (device.TryGetFeatureValue(CommonUsages.deviceRotation, out var rotation))
            {
                anchor.localRotation = rotation;
            }
        }

        private void UpdateInteractionLoop()
        {
            if (stageController == null)
            {
                return;
            }

            var rayOrigin = rightHandAnchor != null ? rightHandAnchor : headAnchor;

            var triggerPressed = ReadBoolFeature(rightDevices, CommonUsages.triggerButton);
            if (triggerPressed && !rightTriggerDown)
            {
                if (creatorController != null)
                {
                    creatorController.TryPlace(rayOrigin);
                }
            }
            rightTriggerDown = triggerPressed;

            var gripPressed = ReadBoolFeature(rightDevices, CommonUsages.gripButton);
            if (gripPressed && !rightGripDown)
            {
                creatorController?.TryRemove(rayOrigin);
            }
            rightGripDown = gripPressed;

            var leftGripPressed = ReadBoolFeature(leftDevices, CommonUsages.gripButton);
            if (leftGripPressed && !leftGripDown)
            {
                voiceBridge?.ToggleListening();
            }
            leftGripDown = leftGripPressed;

            var rightPrimaryPressed = ReadBoolFeature(rightDevices, CommonUsages.primaryButton);
            if (rightPrimaryPressed && !rightPrimaryDown)
            {
                creatorController?.CycleSelection(1);
                wristMenu?.RefreshText();
            }
            rightPrimaryDown = rightPrimaryPressed;

            if (sendAnchorOnLeftPrimary)
            {
                var primaryPressed = ReadBoolFeature(leftDevices, CommonUsages.primaryButton);
                if (primaryPressed && !leftPrimaryDown)
                {
                    stageController.SendRoomAnchorCommand();
                    wristMenu?.Toggle();
                }
                leftPrimaryDown = primaryPressed;
            }

            var leftSecondaryPressed = ReadBoolFeature(leftDevices, CommonUsages.secondaryButton);
            if (leftSecondaryPressed && !leftSecondaryDown)
            {
                floatingTerminal?.Toggle();
            }
            leftSecondaryDown = leftSecondaryPressed;

            if (sendPreviewOnRightSecondary)
            {
                var rightSecondaryPressed = ReadBoolFeature(rightDevices, CommonUsages.secondaryButton);
                if (rightSecondaryPressed && !rightSecondaryDown)
                {
                    floatingTerminal?.ExecuteCurrentPreset();
                    stageController.SendBuildPreviewCommand();
                }
                rightSecondaryDown = rightSecondaryPressed;
            }
        }

        private static bool ReadBoolFeature(List<InputDevice> devices, InputFeatureUsage<bool> usage)
        {
            if (devices.Count == 0)
            {
                return false;
            }

            var device = devices[0];
            return device.isValid && device.TryGetFeatureValue(usage, out var value) && value;
        }
    }
}
