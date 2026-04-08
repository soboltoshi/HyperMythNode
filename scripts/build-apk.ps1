#Requires -Version 5.1
<#!
.SYNOPSIS
    Build a Quest 3 APK from the Last Experiments Unity project.

.DESCRIPTION
    Invokes the Unity Editor in batch mode to produce an Android APK.

.PARAMETER UnityPath
    Full path to the Unity Editor executable.

.PARAMETER OutputDir
    Directory where the APK will be written.

.PARAMETER BuildMethod
    Unity static build method to invoke.
#>

param(
    [string]$UnityPath   = "D:\UNITY\6000.3.12f1\Editor\Unity.exe",
    [string]$OutputDir   = "",
    [string]$BuildMethod = "LastExperiments.Editor.Build.BuildQuest3Release"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ProjectDir = Join-Path $RepoRoot "apps\unity-client"
$LogDir = Join-Path $RepoRoot "build\logs"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $RepoRoot "build\apk"
}

if (-not (Test-Path -LiteralPath $UnityPath)) {
    throw "Unity Editor not found at '$UnityPath'. Re-run with -UnityPath pointing to your Unity Editor executable."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectDir "Assets"))) {
    throw "Unity project not found at '$ProjectDir'."
}

$unityEditorDir = Split-Path -Parent $UnityPath
$unityPackageManagerExe = Join-Path $unityEditorDir "Data\Resources\PackageManager\Server\UnityPackageManager.exe"
if (-not (Test-Path -LiteralPath $unityPackageManagerExe)) {
    throw (
        "Unity installation is incomplete. Missing: '$unityPackageManagerExe'. " +
        "Open Unity Hub and repair/reinstall the selected editor with required modules " +
        "(Android Build Support + Package Manager files)."
    )
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$ApkPath = Join-Path $OutputDir "LastExperiments-Quest3.apk"
$LogPath = Join-Path $LogDir ("build-apk-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

Write-Host ""
Write-Host "=== Last Experiments | Quest 3 APK Build ===" -ForegroundColor Cyan
Write-Host "  Unity:    $UnityPath"
Write-Host "  Project:  $ProjectDir"
Write-Host "  Output:   $ApkPath"
Write-Host "  Log:      $LogPath"
Write-Host "  Method:   $BuildMethod"
Write-Host ""

$unityArgs = @()
$unityArgs += "-quit"
$unityArgs += "-batchmode"
$unityArgs += "-nographics"
$unityArgs += "-projectPath"
$unityArgs += $ProjectDir
$unityArgs += "-buildTarget"
$unityArgs += "Android"
$unityArgs += "-executeMethod"
$unityArgs += $BuildMethod
$unityArgs += "-customBuildPath"
$unityArgs += $ApkPath
$unityArgs += "-logFile"
$unityArgs += $LogPath

Write-Host "Starting Unity batch build..." -ForegroundColor Yellow
$process = Start-Process -FilePath $UnityPath -ArgumentList $unityArgs -NoNewWindow -PassThru -Wait

if ($process.ExitCode -ne 0) {
    throw "Unity build failed with exit code $($process.ExitCode). See log: $LogPath"
}

if (-not (Test-Path -LiteralPath $ApkPath)) {
    throw "Build completed but APK not found at expected path '$ApkPath'."
}

$ApkSizeKb = [math]::Round((Get-Item -LiteralPath $ApkPath).Length / 1KB, 1)

Write-Host ""
Write-Host "=== Build successful ===" -ForegroundColor Green
Write-Host "  APK:  $ApkPath"
Write-Host "  Size: $ApkSizeKb KB"
Write-Host ""
Write-Host "Next step: sideload to Quest 3"
Write-Host "  .\scripts\sideload-quest.ps1 -ApkPath `"$ApkPath`""
Write-Host ""
