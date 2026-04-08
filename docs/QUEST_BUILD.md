# Quest 3 APK Build and Sideload

How to build the Last Experiments Unity project into an APK and install it on a Meta Quest 3 headset from a Windows machine.

---

## Prerequisites

### Unity

| Requirement | Detail |
|---|---|
| Editor | Unity 2022.3 LTS (or newer) |
| Module | Android Build Support (includes Android SDK, NDK, OpenJDK) |
| XR Plugins | Meta XR SDK / OpenXR Plugin |

Install via Unity Hub > Installs > (your version) > Add Modules.

### Android SDK / ADB

`adb` (Android Debug Bridge) is required for sideloading.

Typical path from Android Studio:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
```

---

## Build the APK

```powershell
cd C:\hypermythsX
.\scripts\build-apk.ps1
```

Optional overrides:

```powershell
.\scripts\build-apk.ps1 -UnityPath "D:\UNITY\6000.3.12f1\Editor\Unity.exe"
.\scripts\build-apk.ps1 -OutputDir "D:\builds\apk"
```

Output APK:

```text
build\apk\LastExperiments-Quest3.apk
```

Build logs:

```text
build\logs\build-apk-<timestamp>.log

Preflight checks now included in the script:

- Unity editor executable exists
- Unity project path exists
- `UnityPackageManager.exe` exists under the selected Unity install

If `UnityPackageManager.exe` is missing, the script exits early with a repair/reinstall message.
```

### Unity build method

The script defaults to:

```text
LastExperiments.Editor.Build.BuildQuest3Release
```

That method is already scaffolded in:

```text
apps/unity-client/Assets/Scripts/Editor/Build.cs
```

Only override `-BuildMethod` if you want a different build entrypoint.

---

## Sideload to Quest 3

```powershell
.\scripts\sideload-quest.ps1
```

This will:
1. Confirm a Quest 3 device is connected and authorized.
2. Install the APK with `adb install -r`.
3. Set up `adb reverse tcp:8787 tcp:8787` so Unity on device can reach `lx-core` running on the host machine.

Options:

```powershell
.\scripts\sideload-quest.ps1 -ApkPath "D:\builds\apk\my-build.apk"
.\scripts\sideload-quest.ps1 -SkipInstall
.\scripts\sideload-quest.ps1 -ReverseKernelPort:$false
```

---

## Kernel connection on device

`KernelClient` and `HyperCinemaClient` default to `http://127.0.0.1:8787`.
On Quest hardware, loopback does not resolve to the host. Use one of these:

| Method | When to use |
|---|---|
| adb reverse (default) | USB debug sessions (`sideload-quest.ps1` sets it automatically). |
| LAN IP | Wireless testing. Set inspector `Base Url` to `http://<host-LAN-IP>:8787` or set PlayerPrefs key `lastexperiments.kernel.url`. |

---

## Useful ADB commands

```powershell
adb devices
adb logcat -s Unity
adb shell am start -n com.LastExperiments.Quest3/com.unity3d.player.UnityPlayerActivity
adb reverse --remove tcp:8787
adb uninstall com.LastExperiments.Quest3
```

---

## Local limits summary

| Tool | Status | Required for |
|---|---|---|
| Unity Editor | Not verified - install via Unity Hub | APK build |
| Android SDK / adb | Not verified - install via Android Studio or platform tools | Sideload |
| Meta XR SDK | Must be imported into the Unity project | Quest 3 VR/MR features |
| Java / NDK | Bundled with Unity Android module | APK build |

The Rust kernel (`lx-core`) and Next.js web app can be developed without a headset.
