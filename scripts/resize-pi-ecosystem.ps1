<#
  Pi Ecosystem image resize (intro 400x400, preview 750x1500). ASCII only.

  Give at least one of: -IntroPath, -PreviewPath (can give both).

  Both (same as before):
    .\scripts\resize-pi-ecosystem.ps1 `
      -IntroPath "C:\Users\littl\Desktop\2.png" `
      -PreviewPath "C:\Users\littl\Desktop\1.png"

  Intro only, custom output name:
    .\scripts\resize-pi-ecosystem.ps1 -IntroPath "C:\Users\littl\Desktop\3.png" -IntroOutFile "pi-intro-400-3.jpg"

  Preview only, custom output name:
    .\scripts\resize-pi-ecosystem.ps1 -PreviewPath "C:\Users\littl\Desktop\5.png" -PreviewOutFile "pi-preview-750-5.jpg"

  If output > 1MB: add -JpegQuality 78
#>

param(
  [string]$IntroPath = "",
  [string]$PreviewPath = "",
  [string]$IntroOutFile = "pi-intro-400.jpg",
  [string]$PreviewOutFile = "pi-preview-750x1500.jpg",
  [int]$JpegQuality = 88
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$doIntro = -not [string]::IsNullOrWhiteSpace($IntroPath)
$doPreview = -not [string]::IsNullOrWhiteSpace($PreviewPath)

if (-not $doIntro -and -not $doPreview) {
  throw "Provide -IntroPath and/or -PreviewPath."
}

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

$introOut = if ($doIntro) { Join-Path $outDir $IntroOutFile } else { $null }
$previewOut = if ($doPreview) { Join-Path $outDir $PreviewOutFile } else { $null }

$introSrc = $null
$previewSrc = $null
$introBmp = $null
$previewBmp = $null

try {
  if ($doIntro) {
    $introSrc = New-BitmapFromFile $IntroPath
    $introBmp = Resize-Cover $introSrc 400 400
    Save-Jpeg $introBmp $introOut $JpegQuality
    Write-Host "OK: $introOut"
  }

  if ($doPreview) {
    $previewSrc = New-BitmapFromFile $PreviewPath
    $previewBmp = Resize-Cover $previewSrc 750 1500
    Save-Jpeg $previewBmp $previewOut $JpegQuality
    Write-Host "OK: $previewOut"
  }

  $reportPaths = @()
  if ($introOut) { $reportPaths += $introOut }
  if ($previewOut) { $reportPaths += $previewOut }
  foreach ($p in $reportPaths) {
    $len = (Get-Item $p).Length
    $name = Split-Path $p -Leaf
    Write-Host ("Size: {0:N2} MB - {1}" -f ($len / 1MB), $name)
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
