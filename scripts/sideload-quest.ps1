#Requires -Version 5.1
<#
.SYNOPSIS
    Sideload the Last Experiments APK to a connected Meta Quest 3 via ADB.

.DESCRIPTION
    Uses the Android Debug Bridge (adb) to install the APK on a Quest 3 device.
    Developer mode must be enabled on the headset and the device must be
    connected via USB and authorized.

    Optionally sets up adb reverse port forwarding for tcp:8787 so the
    Unity client can reach the lx-core kernel running on the host machine.

.PARAMETER ApkPath
    Path to the APK file to install.
    Defaults to: <repo-root>\build\apk\LastExperiments-Quest3.apk

.PARAMETER AdbPath
    Path to adb executable.
    Defaults to searching PATH, then the Android SDK platform-tools default.

.PARAMETER ReverseKernelPort
    If set, run 'adb reverse tcp:8787 tcp:8787' after install so the device
    can reach the kernel over USB. Enabled by default.

.PARAMETER SkipInstall
    Skip APK install; only set up port forwarding. Useful during iteration.

.EXAMPLE
    .\sideload-quest.ps1
    .\sideload-quest.ps1 -ApkPath "D:\builds\apk\my-build.apk"
    .\sideload-quest.ps1 -SkipInstall   # port-forward only
#>

param(
    [string]$ApkPath            = "",
    [string]$AdbPath            = "",
    [switch]$ReverseKernelPort  = $true,
    [switch]$SkipInstall        = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---- Resolve paths ----

$RepoRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($ApkPath)) {
    $ApkPath = Join-Path $RepoRoot "build\apk\LastExperiments-Quest3.apk"
}

# ---- Locate adb ----

function Find-Adb {
    param([string]$Hint)

    if (-not [string]::IsNullOrWhiteSpace($Hint) -and (Test-Path $Hint)) {
        return $Hint
    }

    $fromPath = Get-Command "adb" -ErrorAction SilentlyContinue
    if ($fromPath) {
        return $fromPath.Source
    }

    $sdkDefault = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $sdkDefault) {
        return $sdkDefault
    }

    return $null
}

$adb = Find-Adb -Hint $AdbPath

if (-not $adb) {
    Write-Error @"
adb not found. Install the Android SDK platform-tools and ensure adb is in PATH.

Quick install options:
  - Android Studio: installs SDK + adb automatically.
  - Standalone: https://developer.android.com/tools/releases/platform-tools
  - Or pass the explicit path: .\sideload-quest.ps1 -AdbPath "C:\...\adb.exe"
"@
    exit 1
}

Write-Host ""
Write-Host "=== Last Experiments — Quest 3 Sideload ===" -ForegroundColor Cyan
Write-Host "  adb:    $adb"
if (-not $SkipInstall) {
    Write-Host "  APK:    $ApkPath"
}
Write-Host ""

# ---- Check for connected device ----

Write-Host "Checking for connected Quest 3 device…" -ForegroundColor Yellow
$devices = & $adb devices 2>&1 | Select-String -Pattern "^\S+\s+device$"

if (-not $devices) {
    Write-Error @"
No authorized Quest 3 device found.

Checklist:
  1. Enable Developer Mode in the Meta Quest mobile app (Account > Headset Settings > Developer Mode).
  2. Connect headset to PC with a USB cable.
  3. Put on the headset and tap 'Allow' on the USB debugging authorization prompt.
  4. Re-run this script.

Diagnose with:  adb devices
"@
    exit 1
}

Write-Host "Device found: $($devices -join ', ')" -ForegroundColor Green

# ---- Install APK ----

if (-not $SkipInstall) {
    if (-not (Test-Path $ApkPath)) {
        Write-Error "APK not found at: $ApkPath`nRun .\build-apk.ps1 first."
        exit 1
    }

    $ApkSizeKb = [math]::Round((Get-Item $ApkPath).Length / 1KB, 1)
    Write-Host ""
    Write-Host "Installing APK ($ApkSizeKb KB)…" -ForegroundColor Yellow

    $installResult = & $adb install -r $ApkPath 2>&1

    if ($LASTEXITCODE -ne 0 -or ($installResult | Select-String "Failure")) {
        Write-Error "ADB install failed:`n$($installResult | Out-String)"
        exit 1
    }

    Write-Host "APK installed successfully." -ForegroundColor Green
}

# ---- adb reverse for kernel port ----

if ($ReverseKernelPort) {
    Write-Host ""
    Write-Host "Setting up adb reverse for kernel port tcp:8787…" -ForegroundColor Yellow
    $reverseResult = & $adb reverse tcp:8787 tcp:8787 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "adb reverse failed (non-fatal): $reverseResult"
        Write-Warning "The app will not reach the kernel unless you set KernelClient Base Url to the host LAN IP."
    } else {
        Write-Host "Port forward active: Quest tcp:8787 -> host tcp:8787" -ForegroundColor Green
    }
}

# ---- Launch app ----

Write-Host ""
Write-Host "=== Sideload complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To launch the app directly:"
Write-Host "  adb shell am start -n com.LastExperiments.Quest3/com.unity3d.player.UnityPlayerActivity"
Write-Host ""
Write-Host "To stream logs during a session:"
Write-Host "  adb logcat -s Unity"
Write-Host ""
Write-Host "To reset port forwarding after disconnect:"
Write-Host "  adb reverse --remove tcp:8787"
Write-Host ""
