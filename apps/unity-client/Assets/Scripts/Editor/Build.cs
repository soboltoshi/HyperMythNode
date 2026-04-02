using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace LastExperiments.Editor
{
    public static class Build
    {
        private const string DefaultApkName = "LastExperiments-Quest3.apk";
        private const string DefaultBundleId = "com.LastExperiments.Quest3";

        /// <summary>
        /// Called by build-apk.ps1 via -executeMethod.
        /// Reads -customBuildPath from the command-line args or falls back to build/apk/.
        /// </summary>
        public static void BuildQuest3Release()
        {
            var apkPath = GetCommandLineArg("-customBuildPath")
                          ?? Path.Combine(GetRepoRoot(), "build", "apk", DefaultApkName);

            Debug.Log($"[Build] Target APK: {apkPath}");

            // Ensure output directory exists
            var dir = Path.GetDirectoryName(apkPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            // Gather scenes that are enabled in Build Settings, or fall back to all scenes in Assets/Scenes
            var scenes = EditorBuildSettings.scenes
                .Where(s => s.enabled)
                .Select(s => s.path)
                .ToArray();

            if (scenes.Length == 0)
            {
                // Fallback: find all .unity files under Assets/Scenes
                scenes = AssetDatabase.FindAssets("t:Scene", new[] { "Assets/Scenes" })
                    .Select(AssetDatabase.GUIDToAssetPath)
                    .ToArray();
            }

            if (scenes.Length == 0)
            {
                Debug.LogError("[Build] No scenes found. Add at least one scene to Assets/Scenes/.");
                EditorApplication.Exit(1);
                return;
            }

            Debug.Log($"[Build] Scenes: {string.Join(", ", scenes)}");

            // Configure player settings for Quest 3
            ConfigureQuest3PlayerSettings();

            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = apkPath,
                target = BuildTarget.Android,
                options = BuildOptions.None
            };

            var report = BuildPipeline.BuildPlayer(options);

            if (report.summary.result != BuildResult.Succeeded)
            {
                Debug.LogError($"[Build] Build failed: {report.summary.result}");
                foreach (var step in report.steps)
                {
                    foreach (var msg in step.messages)
                    {
                        if (msg.type == LogType.Error || msg.type == LogType.Warning)
                            Debug.LogError($"  [{step.name}] {msg.content}");
                    }
                }
                EditorApplication.Exit(1);
                return;
            }

            Debug.Log($"[Build] Success! APK size: {report.summary.totalSize / 1024}KB");
        }

        private static void ConfigureQuest3PlayerSettings()
        {
            // Bundle identifier
            PlayerSettings.SetApplicationIdentifier(
                UnityEditor.Build.NamedBuildTarget.Android, DefaultBundleId);

            // Target Android 10+ (API 29) — minimum for Quest 3
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevel32;

            // ARM64 only (Quest 3 is arm64)
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;

            // IL2CPP for release builds
            PlayerSettings.SetScriptingBackend(
                UnityEditor.Build.NamedBuildTarget.Android,
                ScriptingImplementation.IL2CPP);

            // Texture compression — ASTC is optimal for Quest 3
            EditorUserBuildSettings.androidBuildSubtarget = MobileTextureSubtarget.ASTC;

            // Landscape left orientation (standard for VR)
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;

            // Company / product
            PlayerSettings.companyName = "Last Experiments";
            PlayerSettings.productName = "Last Experiments";

            Debug.Log("[Build] Quest 3 player settings configured.");
        }

        private static string GetCommandLineArg(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length - 1; i++)
            {
                if (args[i] == name)
                    return args[i + 1];
            }
            return null;
        }

        private static string GetRepoRoot()
        {
            // Walk up from Assets/ to find repository root
            var projectDir = Directory.GetParent(Application.dataPath)?.FullName ?? ".";
            return Directory.GetParent(projectDir)?.Parent?.FullName ?? projectDir;
        }
    }
}
