# Generates favicon.ico (multi-res) and PNG favicons from the round vignette.
# Run from repo root:  pwsh ./scripts/generate-favicons.ps1

[CmdletBinding()]
param(
    [string]$Source = "Assets/Hugues/Heroic Filter copyblur.jpg",
    [string]$OutDir = "."
)

Add-Type -AssemblyName System.Drawing

function Resize-ToPng {
    param(
        [System.Drawing.Image]$Image,
        [int]$Size,
        [string]$OutPath
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($Image, 0, 0, $Size, $Size)
    $g.Dispose()
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "  wrote $OutPath ($Size x $Size)"
}

$src = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
Write-Host "Source: $Source ($($src.Width)x$($src.Height))"

# PNGs (multiples of 48 where Google cares; plus 16/32 for browsers and 180 for Apple)
$sizes = @{
    "favicon-16.png"        = 16
    "favicon-32.png"        = 32
    "favicon-48.png"        = 48
    "favicon-96.png"        = 96
    "favicon-192.png"       = 192
    "favicon-512.png"       = 512
    "apple-touch-icon.png"  = 180
}
foreach ($name in $sizes.Keys) {
    Resize-ToPng -Image $src -Size $sizes[$name] -OutPath (Join-Path $OutDir $name)
}

# Build a real multi-resolution favicon.ico (16, 32, 48 PNG-encoded entries).
$icoSizes = 16, 32, 48
$pngBlobs = @()
foreach ($s in $icoSizes) {
    $tmp = [System.IO.Path]::GetTempFileName() + ".png"
    Resize-ToPng -Image $src -Size $s -OutPath $tmp
    $pngBlobs += ,@{ Size = $s; Bytes = [System.IO.File]::ReadAllBytes($tmp) }
    Remove-Item $tmp
}

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms
# ICONDIR
$bw.Write([uint16]0)               # reserved
$bw.Write([uint16]1)               # type = icon
$bw.Write([uint16]$pngBlobs.Count) # count

# directory entries: 16 bytes each, then image data follows
$dirSize = 6 + ($pngBlobs.Count * 16)
$offset = $dirSize
foreach ($p in $pngBlobs) {
    $w = if ($p.Size -ge 256) { 0 } else { [byte]$p.Size }
    $h = $w
    $bw.Write([byte]$w)             # width (0 = 256)
    $bw.Write([byte]$h)             # height
    $bw.Write([byte]0)              # color count
    $bw.Write([byte]0)              # reserved
    $bw.Write([uint16]1)            # color planes
    $bw.Write([uint16]32)           # bpp
    $bw.Write([uint32]$p.Bytes.Length) # size
    $bw.Write([uint32]$offset)      # offset
    $offset += $p.Bytes.Length
}
foreach ($p in $pngBlobs) { $bw.Write($p.Bytes) }

$bw.Flush()
$icoPath = Join-Path $OutDir "favicon.ico"
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Dispose()
$ms.Dispose()
$src.Dispose()

Write-Host "  wrote $icoPath ($((Get-Item $icoPath).Length) bytes, $($pngBlobs.Count) entries)"
Write-Host "Done."
