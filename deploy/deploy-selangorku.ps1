param(
  [string]$Zip
)

$ErrorActionPreference = 'Stop'

$siteRoot = 'C:\sites\selangorku-org'
$sitesRoot = 'C:\sites\'
$taskName = 'Selangorku Next.js'
$zipPath = $null
$expectedBuild = $null
$siteBuild = Join-Path $siteRoot '.next'
$stage = Join-Path $sitesRoot ('.selangorku-stage-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$backupPath = $null
$siteStopped = $false

function Assert-InSites([string]$path) {
  $base = [IO.Path]::GetFullPath($sitesRoot).TrimEnd('\') + '\'
  $full = [IO.Path]::GetFullPath($path)
  if (-not $full.StartsWith($base, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Path is outside C:\sites: $full"
  }
}

function Get-Sha256([string]$path) {
  $hasher = [Security.Cryptography.SHA256]::Create()
  $stream = [IO.File]::OpenRead($path)
  try {
    return [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-', '')
  } finally {
    $stream.Dispose()
    $hasher.Dispose()
  }
}

function Stop-RemainingSiteProcess {
  $listener = Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -eq $listener) { return }
  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
  if ($null -eq $process -or $process.CommandLine -notlike '*selangorku-org*') {
    throw 'Port 3100 belongs to an unexpected process. Deployment stopped.'
  }
  Stop-Process -Id $listener.OwningProcess -Force
}

try {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Right-click deploy-selangorku.bat and choose Run as administrator.'
  }
  Assert-InSites $siteRoot
  Assert-InSites $stage
  if ([string]::IsNullOrWhiteSpace($Zip)) {
    $releases = @(Get-ChildItem -LiteralPath $PSScriptRoot -Filter 'selangorku-update-*.zip' -File)
    if ($releases.Count -ne 1) {
      throw "Keep exactly one selangorku-update-*.zip beside the BAT, or drag the desired ZIP onto the BAT. Found $($releases.Count)."
    }
    $zipPath = $releases[0].FullName
  } elseif ([IO.Path]::IsPathRooted($Zip)) {
    $zipPath = [IO.Path]::GetFullPath($Zip)
  } else {
    $zipPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $Zip))
  }
  if (-not (Test-Path -LiteralPath $zipPath)) { throw "ZIP not found beside this script: $zipPath" }
  if (-not (Test-Path -LiteralPath $siteBuild)) { throw "Current build not found: $siteBuild" }
  if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'node_modules\next\dist\bin\next'))) {
    throw 'Next.js is not installed in C:\sites\selangorku-org\node_modules.'
  }
  [void](Get-ScheduledTask -TaskName $taskName)
  if (Test-Path -LiteralPath $stage) { throw "Staging path already exists: $stage" }

  $actualHash = Get-Sha256 $zipPath
  Write-Host "Release ZIP: $zipPath"
  Write-Host "SHA256: $actualHash"

  Write-Host 'Extracting and checking the new release...'
  Expand-Archive -LiteralPath $zipPath -DestinationPath $stage
  $stageBuild = Join-Path $stage '.next'
  if (-not (Test-Path -LiteralPath $stageBuild)) { throw 'The ZIP does not contain .next.' }
  $expectedBuild = (Get-Content -LiteralPath (Join-Path $stageBuild 'BUILD_ID') -Raw).Trim()
  if ($expectedBuild -notmatch '^[A-Za-z0-9_-]{8,}$') { throw 'The ZIP contains an invalid Next.js build ID.' }
  foreach ($relative in @('public\rumah-selangorku-logo.png', 'app\icon.png', 'app\apple-icon.png')) {
    if (-not (Test-Path -LiteralPath (Join-Path $stage $relative))) { throw "Missing asset: $relative" }
  }
  $stageHtml = Get-Content -LiteralPath (Join-Path $stageBuild 'server\app\index.html') -Raw
  if ($stageHtml.Contains('Lengkapkan jumlah pendapatan untuk melihat anggaran.') -or
      $stageHtml.Contains('Anggaran DSR anda') -or
      -not $stageHtml.Contains('rumah-selangorku-logo.png')) {
    throw 'The staged page does not have the expected logo and hidden DSR result.'
  }

  Write-Host 'Updating source files and logo...'
  $stagePrefix = [IO.Path]::GetFullPath($stage).TrimEnd('\') + '\'
  $sitePrefix = [IO.Path]::GetFullPath($siteRoot).TrimEnd('\') + '\'
  foreach ($file in Get-ChildItem -LiteralPath $stage -Recurse -File -Force) {
    $relative = $file.FullName.Substring($stagePrefix.Length)
    if ($relative.StartsWith('.next\', [StringComparison]::OrdinalIgnoreCase)) { continue }
    $destination = [IO.Path]::GetFullPath((Join-Path $siteRoot $relative))
    if (-not $destination.StartsWith($sitePrefix, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Unsafe ZIP path: $relative"
    }
    [void](New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force)
    Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
  }

  Write-Host 'Switching the production build...'
  $task = Get-ScheduledTask -TaskName $taskName
  if ($task.State -eq 'Running') { Stop-ScheduledTask -TaskName $taskName }
  $siteStopped = $true
  Start-Sleep -Seconds 2
  Stop-RemainingSiteProcess
  for ($attempt = 0; $attempt -lt 10; $attempt++) {
    if (-not (Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue)) { break }
    Start-Sleep -Milliseconds 500
  }
  if (Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Port 3100 did not become free.'
  }

  $backupName = '.next-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
  $backupPath = Join-Path $siteRoot $backupName
  Assert-InSites $backupPath
  Rename-Item -LiteralPath $siteBuild -NewName $backupName
  Move-Item -LiteralPath $stageBuild -Destination $siteBuild
  Start-ScheduledTask -TaskName $taskName

  $response = $null
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Seconds 1
    try {
      $response = Invoke-WebRequest 'http://127.0.0.1:3100/' -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -eq 200) { break }
    } catch { $response = $null }
  }
  if ($null -eq $response) { throw 'Next.js did not respond on port 3100.' }
  if ($response.Content.Contains('Lengkapkan jumlah pendapatan untuk melihat anggaran.') -or
      $response.Content.Contains('Anggaran DSR anda')) {
    throw 'Port 3100 still serves the old DSR page.'
  }
  if (-not $response.Content.Contains($expectedBuild)) { throw 'Port 3100 is serving a different build.' }
  if (-not $response.Content.Contains('rumah-selangorku-logo.png')) { throw 'The new logo is missing from the page.' }
  if ((Invoke-WebRequest 'http://127.0.0.1:3100/icon.png' -UseBasicParsing -TimeoutSec 5).StatusCode -ne 200) {
    throw 'The favicon did not load.'
  }
  Write-Host "SUCCESS: build $expectedBuild, new DSR, logo and favicon are live on port 3100."
  Write-Host "Old build backup: $backupPath"
  exit 0
} catch {
  Write-Host "DEPLOYMENT FAILED: $($_.Exception.Message)" -ForegroundColor Red
  if ($siteStopped) {
    try {
      $task = Get-ScheduledTask -TaskName $taskName
      if ($task.State -eq 'Running') { Stop-ScheduledTask -TaskName $taskName }
      Start-Sleep -Seconds 1
      Stop-RemainingSiteProcess
      if ($backupPath -and (Test-Path -LiteralPath $backupPath)) {
        if (Test-Path -LiteralPath $siteBuild) {
          $failedName = '.next-failed-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
          Assert-InSites (Join-Path $siteRoot $failedName)
          Rename-Item -LiteralPath $siteBuild -NewName $failedName
        }
        Rename-Item -LiteralPath $backupPath -NewName '.next'
        Write-Host 'Previous build restored.'
      }
      Start-ScheduledTask -TaskName $taskName
    } catch {
      Write-Host "Automatic recovery failed: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
  exit 1
}
