$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$releaseDir = Split-Path $repoRoot -Parent
$previousDirectory = Get-Location

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

try {
  Set-Location -LiteralPath $repoRoot
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Next.js build failed.' }

  $buildId = (Get-Content -LiteralPath '.next\BUILD_ID' -Raw).Trim()
  if ($buildId -notmatch '^[A-Za-z0-9_-]{8,}$') { throw 'Invalid Next.js build ID.' }
  $page = Get-Content -LiteralPath '.next\server\app\index.html' -Raw
  if ($page.Contains('Lengkapkan jumlah pendapatan untuk melihat anggaran.') -or
      $page.Contains('Anggaran DSR anda') -or
      -not $page.Contains('rumah-selangorku-logo.png')) {
    throw 'Build check failed: DSR result or logo is not as expected.'
  }

  $archivePath = Join-Path $releaseDir "selangorku-update-$buildId.zip"
  if (Test-Path -LiteralPath $archivePath) { throw "Release ZIP already exists: $archivePath" }
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $folders = @('.next', 'app', 'components', 'lib', 'public')
  $rootFiles = @('package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json',
    'postcss.config.mjs', 'components.json', 'next-env.d.ts', 'README.md')
  $sourceFiles = @(
    foreach ($folder in $folders) { Get-ChildItem -LiteralPath (Join-Path $repoRoot $folder) -Recurse -File -Force }
    foreach ($file in $rootFiles) { Get-Item -LiteralPath (Join-Path $repoRoot $file) }
  )

  $archive = [IO.Compression.ZipFile]::Open($archivePath, [IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($file in $sourceFiles) {
      $relative = $file.FullName.Substring($repoRoot.Length + 1).Replace('\', '/')
      if ($relative.StartsWith('.next/dev/') -or $relative.StartsWith('.next/cache/')) { continue }
      [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive, $file.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal)
    }
  } finally {
    $archive.Dispose()
  }

  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'deploy-selangorku.bat') -Destination $releaseDir -Force
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'deploy-selangorku.ps1') -Destination $releaseDir -Force
  $hash = Get-Sha256 $archivePath
  Write-Host "Release: $archivePath"
  Write-Host "Build ID: $buildId"
  Write-Host "SHA256: $hash"
  Write-Host 'Copy the ZIP and both deploy-selangorku files to C:\sites on the VPS, then run the BAT as administrator.'
} finally {
  Set-Location -LiteralPath $previousDirectory
}
