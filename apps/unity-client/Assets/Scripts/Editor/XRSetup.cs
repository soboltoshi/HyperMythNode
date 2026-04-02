using UnityEditor;
using UnityEngine;

namespace LastExperiments.Editor
{
    /// <summary>
    /// One-time XR project setup helper. Run via menu: Last Experiments > Setup Quest 3 XR.
    /// Configures XR Plugin Management and OpenXR settings for Meta Quest 3.
    /// </summary>
    public static class XRSetup
    {
        [MenuItem("Last Experiments/Setup Quest 3 XR")]
        public static void SetupQuest3XR()
        {
            Debug.Log("[XRSetup] Configuring project for Meta Quest 3...");

            // Set Android as the active build target
            EditorUserBuildSettings.SwitchActiveBuildTarget(
                BuildTargetGroup.Android, BuildTarget.Android);

            // Configure player settings
            PlayerSettings.SetApplicationIdentifier(
                UnityEditor.Build.NamedBuildTarget.Android,
                "com.LastExperiments.Quest3");

            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevel32;
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;

            PlayerSettings.SetScriptingBackend(
                UnityEditor.Build.NamedBuildTarget.Android,
                ScriptingImplementation.IL2CPP);

            // Linear color space for VR
            PlayerSettings.colorSpace = ColorSpace.Linear;

            // Active Input Handling: Input System (New)
            // This is set in ProjectSettings.asset activeInputHandler: 2

            // Texture compression
            EditorUserBuildSettings.androidBuildSubtarget = MobileTextureSubtarget.ASTC;

            Debug.Log("[XRSetup] Quest 3 configuration complete.");
            Debug.Log("[XRSetup] Open Window > XR Plugin Management to enable OpenXR and Meta Quest feature group.");
            Debug.Log("[XRSetup] Then open the project in Unity and use Last Experiments > Setup Quest 3 XR.");
        }
    }
}
