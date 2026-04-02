using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

namespace LastExperiments.Voxel
{
    public class VoxelLocomotionController : MonoBehaviour
    {
        [SerializeField] private VoxelWorldRuntime worldRuntime;
        [SerializeField] private Transform rigRoot;
        [SerializeField] private Transform headAnchor;

        [Header("Movement")]
        [SerializeField] private float moveSpeed = 1.8f;
        [SerializeField] private float flySpeed = 2.2f;
        [SerializeField] private float jumpSpeed = 2.8f;
        [SerializeField] private float gravity = -9.81f;
        [SerializeField] private float swimVerticalSpeed = 1.1f;
        [SerializeField] private float bodyRadius = 0.18f;
        [SerializeField] private float bodyHeight = 1.7f;

        [Header("Status")]
        [SerializeField] private bool flyMode;
        [SerializeField] private bool swimMode;
        [SerializeField] private bool grounded;
        [SerializeField] private float verticalVelocity;

        private readonly List<InputDevice> leftControllers = new();
        private readonly List<InputDevice> rightControllers = new();
        private bool leftGripDown;
        private bool leftTriggerDown;

        public void Initialize(VoxelWorldRuntime runtime, Transform rig, Transform head)
        {
            worldRuntime = runtime;
            rigRoot = rig;
            headAnchor = head;
        }

        private void Update()
        {
            if (worldRuntime == null || rigRoot == null || headAnchor == null)
            {
                return;
            }

            InputDevices.GetDevicesWithCharacteristics(
                InputDeviceCharacteristics.Left | InputDeviceCharacteristics.Controller,
                leftControllers);
            InputDevices.GetDevicesWithCharacteristics(
                InputDeviceCharacteristics.Right | InputDeviceCharacteristics.Controller,
                rightControllers);

            var leftAxis = ReadVector2(leftControllers, CommonUsages.primary2DAxis);
            var rightAxis = ReadVector2(rightControllers, CommonUsages.primary2DAxis);
            var leftGrip = ReadBool(leftControllers, CommonUsages.gripButton);
            var leftTrigger = ReadBool(leftControllers, CommonUsages.triggerButton);
            var rightTrigger = ReadBool(rightControllers, CommonUsages.triggerButton);

            if (leftGrip && !leftGripDown)
            {
                flyMode = !flyMode;
            }
            leftGripDown = leftGrip;

            UpdateEnvironmentFlags();
            SimulateMovement(leftAxis, rightAxis, leftTrigger, rightTrigger);
        }

        private void SimulateMovement(Vector2 leftAxis, Vector2 rightAxis, bool jumpOrAscend, bool descend)
        {
            var dt = Time.deltaTime;
            var flatForward = Vector3.ProjectOnPlane(headAnchor.forward, Vector3.up).normalized;
            var flatRight = Vector3.ProjectOnPlane(headAnchor.right, Vector3.up).normalized;
            var horizontalDirection = (flatRight * leftAxis.x) + (flatForward * leftAxis.y);
            if (horizontalDirection.sqrMagnitude > 1f)
            {
                horizontalDirection.Normalize();
            }

            var horizontalSpeed = swimMode ? moveSpeed * 0.67f : moveSpeed;
            var velocity = horizontalDirection * horizontalSpeed;

            if (flyMode)
            {
                var verticalInput = 0f;
                if (jumpOrAscend)
                {
                    verticalInput += 1f;
                }
                if (descend)
                {
                    verticalInput -= 1f;
                }

                velocity.y = verticalInput * flySpeed;
                verticalVelocity = 0f;
            }
            else
            {
                if (grounded && jumpOrAscend && !leftTriggerDown)
                {
                    verticalVelocity = jumpSpeed;
                }
                else if (swimMode && jumpOrAscend)
                {
                    verticalVelocity = swimVerticalSpeed;
                }

                leftTriggerDown = jumpOrAscend;
                verticalVelocity += gravity * dt;

                if (swimMode)
                {
                    verticalVelocity *= 0.67f;
                }

                velocity.y = verticalVelocity;
            }

            var movement = velocity * dt;
            ApplyMovement(movement);

            if (!flyMode)
            {
                grounded = CheckGrounded();
                if (grounded && verticalVelocity < 0f)
                {
                    verticalVelocity = 0f;
                }
            }
            else
            {
                grounded = false;
            }
        }

        private void ApplyMovement(Vector3 movement)
        {
            var target = rigRoot.position + movement;
            if (!WouldCollide(target))
            {
                rigRoot.position = target;
                return;
            }

            var horizontal = new Vector3(movement.x, 0f, movement.z);
            if (horizontal.sqrMagnitude > 0f && !WouldCollide(rigRoot.position + horizontal))
            {
                rigRoot.position += horizontal;
            }

            var vertical = new Vector3(0f, movement.y, 0f);
            if (Mathf.Abs(vertical.y) > 0f && !WouldCollide(rigRoot.position + vertical))
            {
                rigRoot.position += vertical;
            }
        }

        private void UpdateEnvironmentFlags()
        {
            var torsoPosition = GetBodyCenterWorld();
            var torsoGrid = worldRuntime.WorldToGrid(torsoPosition);
            if (worldRuntime.TryGetBlock(torsoGrid, out var torsoBlock))
            {
                swimMode = torsoBlock == VoxelBlockType.Water || torsoBlock == VoxelBlockType.Lava;
            }
            else
            {
                swimMode = false;
            }
        }

        private bool CheckGrounded()
        {
            var footCenter = GetFootCenterWorld();
            var sample = footCenter + Vector3.down * 0.08f;
            return IsSolid(sample);
        }

        private bool WouldCollide(Vector3 rigPosition)
        {
            var headOffset = headAnchor.localPosition;
            var bodyCenter = rigPosition + new Vector3(headOffset.x, bodyHeight * 0.5f, headOffset.z);

            var samples = new[]
            {
                bodyCenter + new Vector3(bodyRadius, -bodyHeight * 0.45f, bodyRadius),
                bodyCenter + new Vector3(bodyRadius, -bodyHeight * 0.45f, -bodyRadius),
                bodyCenter + new Vector3(-bodyRadius, -bodyHeight * 0.45f, bodyRadius),
                bodyCenter + new Vector3(-bodyRadius, -bodyHeight * 0.45f, -bodyRadius),
                bodyCenter + new Vector3(bodyRadius, bodyHeight * 0.45f, bodyRadius),
                bodyCenter + new Vector3(bodyRadius, bodyHeight * 0.45f, -bodyRadius),
                bodyCenter + new Vector3(-bodyRadius, bodyHeight * 0.45f, bodyRadius),
                bodyCenter + new Vector3(-bodyRadius, bodyHeight * 0.45f, -bodyRadius)
            };

            foreach (var sample in samples)
            {
                if (IsSolid(sample))
                {
                    return true;
                }
            }

            return false;
        }

        private bool IsSolid(Vector3 worldPosition)
        {
            var grid = worldRuntime.WorldToGrid(worldPosition);
            if (!worldRuntime.InBounds(grid))
            {
                return true;
            }

            if (!worldRuntime.TryGetBlock(grid, out var block))
            {
                return true;
            }

            return VoxelBlockRules.IsCollidable(block);
        }

        private Vector3 GetBodyCenterWorld()
        {
            var headOffset = headAnchor.localPosition;
            return rigRoot.position + new Vector3(headOffset.x, bodyHeight * 0.5f, headOffset.z);
        }

        private Vector3 GetFootCenterWorld()
        {
            var headOffset = headAnchor.localPosition;
            return rigRoot.position + new Vector3(headOffset.x, 0.05f, headOffset.z);
        }

        private static bool ReadBool(List<InputDevice> devices, InputFeatureUsage<bool> usage)
        {
            if (devices.Count == 0)
            {
                return false;
            }

            var device = devices[0];
            return device.isValid && device.TryGetFeatureValue(usage, out var value) && value;
        }

        private static Vector2 ReadVector2(List<InputDevice> devices, InputFeatureUsage<Vector2> usage)
        {
            if (devices.Count == 0)
            {
                return Vector2.zero;
            }

            var device = devices[0];
            if (!device.isValid || !device.TryGetFeatureValue(usage, out var value))
            {
                return Vector2.zero;
            }

            return value;
        }
    }
}
