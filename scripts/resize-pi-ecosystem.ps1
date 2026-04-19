<#
  Resize images for Pi Developer Portal → Ecosystem assets.

  Requirements: Windows PowerShell + .NET (default on Windows 10).

  Usage (from repo root):
    .\scripts\resize-pi-ecosystem.ps1 -IntroPath ".\ecosystem-source\my-logo.png" -PreviewPath ".\ecosystem-source\my-screenshot.png"

  Output (creates folder ecosystem-output):
    pi-intro-400.jpg       — square, min 400×400 (exact 400×400), ≤ ~950KB target
    pi-preview-750x1500.jpg — portrait min 750×1500 (exact 750×1500), ≤ ~950KB target

  If output > 1MB, lower JPEG quality in the script ($jpegQuality).
#>

param(
  [Parameter(Mandatory = $true)][string]$IntroPath,
  [Parameter(Mandatory = $true)][string]$PreviewPath,
  [int]$JpegQuality = 88
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-BitmapFromFile([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) { throw "File not found: $path" }
  return [System.Drawing.Image]::FromFile((Resolve-Path $path))
}

function Save-Jpeg([System.Drawing.Image]$img, [string]$outPath, [int]$quality) {
  $dir = Split-Path -Parent $outPath
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]$quality
  )
  $img.Save($outPath, $codec, $encParams)
}

function Resize-Cover([System.Drawing.Image]$src, [int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $scale = [Math]::Max($w / $src.Width, $h / $src.Height)
  $nw = [int][Math]::Ceiling($src.Width * $scale)
  $nh = [int][Math]::Ceiling($src.Height * $scale)
  $dx = [int](($w - $nw) / 2)
  $dy = [int](($h - $nh) / 2)
  $g.Clear([System.Drawing.Color]::White)
  $g.DrawImage($src, $dx, $dy, $nw, $nh)
  $g.Dispose()
  return $bmp
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $repoRoot "ecosystem-output"
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$introOut = Join-Path $outDir "pi-intro-400.jpg"
$previewOut = Join-Path $outDir "pi-preview-750x1500.jpg"

$introSrc = $null
$previewSrc = $null
$introBmp = $null
$previewBmp = $null

try {
  $introSrc = New-BitmapFromFile $IntroPath
  $previewSrc = New-BitmapFromFile $PreviewPath

  $introBmp = Resize-Cover $introSrc 400 400
  $previewBmp = Resize-Cover $previewSrc 750 1500

  Save-Jpeg $introBmp $introOut $JpegQuality
  Save-Jpeg $previewBmp $previewOut $JpegQuality

  Write-Host "OK: $introOut"
  Write-Host "OK: $previewOut"

  foreach ($p in @($introOut, $previewOut)) {
    $len = (Get-Item $p).Length
    Write-Host ("Size: {0:N2} MB — {1}" -f ($len / 1MB), (Split-Path $p -Leaf))
    if ($len -gt 1MB) {
      Write-Warning "File exceeds 1MB. Re-run with lower quality, e.g. -JpegQuality 78"
    }
  }
}
finally {
  if ($introSrc) { $introSrc.Dispose() }
  if ($previewSrc) { $previewSrc.Dispose() }
  if ($introBmp) { $introBmp.Dispose() }
  if ($previewBmp) { $previewBmp.Dispose() }
}
