#Requires -Version 5.1
<#
.SYNOPSIS
    Clone or update external voxel engine references used by HyperMythsX.

.DESCRIPTION
    Ensures the Blackvoxel and MiniMinecraft repositories exist under external/.
    If repositories already exist, performs fast-forward pulls.
    Optionally attempts a local Blackvoxel build when native toolchain is available.
#>

param(
    [string]$BlackvoxelRepo = "https://github.com/Blackvoxel/Blackvoxel.git",
    [string]$MiniMinecraftRepo = "https://github.com/JocelynWSJ/MiniMinecraft.git",
    [switch]$BuildBlackvoxel
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$externalRoot = Join-Path $repoRoot "external"

New-Item -ItemType Directory -Force -Path $externalRoot | Out-Null

function Ensure-GitRepo {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$RemoteUrl
    )

    if (Test-Path -LiteralPath (Join-Path $Path ".git")) {
        Write-Host "Updating $Path" -ForegroundColor Yellow
        git -C $Path fetch --all --prune
        git -C $Path pull --ff-only
        return
    }

    if (Test-Path -LiteralPath $Path) {
        throw "Path '$Path' exists but is not a git repository."
    }

    Write-Host "Cloning $RemoteUrl -> $Path" -ForegroundColor Yellow
    git clone $RemoteUrl $Path
}

$blackvoxelPath = Join-Path $externalRoot "Blackvoxel"
$miniMinecraftPath = Join-Path $externalRoot "MiniMinecraft"

Ensure-GitRepo -Path $blackvoxelPath -RemoteUrl $BlackvoxelRepo
Ensure-GitRepo -Path $miniMinecraftPath -RemoteUrl $MiniMinecraftRepo

if ($BuildBlackvoxel) {
    $makeCommand = Get-Command make -ErrorAction SilentlyContinue
    if ($null -eq $makeCommand) {
        Write-Warning "make not found in PATH. Skipping Blackvoxel build."
    }
    else {
        Write-Host "Building Blackvoxel..." -ForegroundColor Yellow
        Push-Location $blackvoxelPath
        try {
            & $makeCommand.Source
        }
        finally {
            Pop-Location
        }
    }
}

Write-Host ""
Write-Host "External voxel engines are ready:" -ForegroundColor Green
Write-Host "  Blackvoxel:    $blackvoxelPath"
Write-Host "  MiniMinecraft: $miniMinecraftPath"
