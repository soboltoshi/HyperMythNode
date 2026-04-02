using System;
using System.IO;
using UnityEngine;

namespace LastExperiments.Embodiment
{
    public class QuestXriStackBootstrap : MonoBehaviour
    {
        [SerializeField] private bool ensureXriOriginOnAwake = true;
        [SerializeField] private string xriActionAssetPath = "Assets/XR/QuestXriActions.inputactions";
        [SerializeField] private bool verboseLogging = true;

        private void Awake()
        {
            if (ensureXriOriginOnAwake)
            {
                EnsureXriRuntimeStack();
            }
        }

        [ContextMenu("Ensure XRI Runtime Stack")]
        public void EnsureXriRuntimeStack()
        {
            EnsureXriOrigin();
            EnsureInteractionManager();
            VerifyActionAsset();
        }

        private void EnsureXriOrigin()
        {
            var xriOriginType = Type.GetType("Unity.XR.CoreUtils.XROrigin, Unity.XR.CoreUtils");
            if (xriOriginType == null)
            {
                if (verboseLogging)
                {
                    Debug.LogWarning("XROrigin type unavailable. Check com.unity.xr.core-utils package.");
                }
                return;
            }

            var allBehaviours = FindObjectsByType<MonoBehaviour>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (var behaviour in allBehaviours)
            {
                if (behaviour != null && xriOriginType.IsInstanceOfType(behaviour))
                {
                    if (verboseLogging)
                    {
                        Debug.Log($"XRI origin already present on object '{behaviour.gameObject.name}'.");
                    }
                    return;
                }
            }

            var originObject = new GameObject("XROrigin");
            var originComponent = originObject.AddComponent(xriOriginType);

            var cameraOffset = new GameObject("Camera Offset");
            cameraOffset.transform.SetParent(originObject.transform, false);

            var mainCameraObject = new GameObject("Main Camera");
            mainCameraObject.tag = "MainCamera";
            mainCameraObject.transform.SetParent(cameraOffset.transform, false);
            var cameraComponent = mainCameraObject.AddComponent<Camera>();
            mainCameraObject.AddComponent<AudioListener>();

            var cameraProperty = xriOriginType.GetProperty("Camera");
            cameraProperty?.SetValue(originComponent, cameraComponent);

            var floorOffsetProperty = xriOriginType.GetProperty("CameraFloorOffsetObject");
            floorOffsetProperty?.SetValue(originComponent, cameraOffset.transform);

            if (verboseLogging)
            {
                Debug.Log("Created runtime XROrigin + camera hierarchy.");
            }
        }

        private void EnsureInteractionManager()
        {
            var managerType = Type.GetType("UnityEngine.XR.Interaction.Toolkit.XRInteractionManager, Unity.XR.Interaction.Toolkit");
            if (managerType == null)
            {
                if (verboseLogging)
                {
                    Debug.LogWarning("XRInteractionManager type unavailable. Check com.unity.xr.interaction.toolkit package.");
                }
                return;
            }

            var allBehaviours = FindObjectsByType<MonoBehaviour>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (var behaviour in allBehaviours)
            {
                if (behaviour != null && managerType.IsInstanceOfType(behaviour))
                {
                    return;
                }
            }

            var managerObject = new GameObject("XRInteractionManager");
            managerObject.AddComponent(managerType);
            if (verboseLogging)
            {
                Debug.Log("Created XRInteractionManager.");
            }
        }

        private void VerifyActionAsset()
        {
            var projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? ".";
            var normalizedPath = xriActionAssetPath.Replace('/', Path.DirectorySeparatorChar);
            var absolute = Path.Combine(projectRoot, normalizedPath);
            if (File.Exists(absolute))
            {
                return;
            }

            Debug.LogWarning($"XRI action asset missing at '{absolute}'.");
        }
    }
}
