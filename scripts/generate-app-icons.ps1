<#
    Genere les variantes d'icones de l'application a partir du logo maitre
    assets/splash-logo.png.

    Usage :
        pwsh -File scripts/generate-app-icons.ps1

    Le logo n'est jamais deforme : il est redimensionne en conservant son
    rapport d'aspect, puis centre dans un carre. Aucune dependance npm n'est
    utilisee (System.Drawing fourni par Windows).
#>

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$source = Join-Path $assets 'splash-logo.png'
$lightBackground = '#F8F2E6'   # fond clair de l'application

if (-not (Test-Path $source)) { throw "Logo maitre introuvable : $source" }

function New-IconVariant {
    param(
        [string]$OutputName,
        [int]$Size,
        # Part de la largeur occupee par le logo (marge de securite autour).
        [double]$LogoRatio,
        # $null => fond transparent
        [string]$BackgroundHex = $null,
        # Aplatit le logo en une silhouette blanche (icone monochrome Android)
        [switch]$Monochrome
    )

    $logo = [System.Drawing.Image]::FromFile($source)
    $canvas = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($BackgroundHex) {
        $color = [System.Drawing.ColorTranslator]::FromHtml($BackgroundHex)
        $graphics.Clear($color)
    } else {
        $graphics.Clear([System.Drawing.Color]::Transparent)
    }

    # Contain : le logo entre entierement dans la zone cible, sans etirement.
    $target = $Size * $LogoRatio
    $scale = [Math]::Min($target / $logo.Width, $target / $logo.Height)
    $width = [int][Math]::Round($logo.Width * $scale)
    $height = [int][Math]::Round($logo.Height * $scale)
    $x = [int][Math]::Round(($Size - $width) / 2)
    $y = [int][Math]::Round(($Size - $height) / 2)

    $graphics.DrawImage($logo, $x, $y, $width, $height)
    $graphics.Dispose()

    if ($Monochrome) {
        # Conserve la forme (alpha) et la peint en blanc.
        for ($px = 0; $px -lt $canvas.Width; $px++) {
            for ($py = 0; $py -lt $canvas.Height; $py++) {
                $pixel = $canvas.GetPixel($px, $py)
                if ($pixel.A -gt 0) {
                    $canvas.SetPixel($px, $py, [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255))
                }
            }
        }
    }

    $output = Join-Path $assets $OutputName
    $canvas.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    $logo.Dispose()
    "  $OutputName  ${Size}x${Size}  logo ${LogoRatio}  fond $(if ($BackgroundHex) { $BackgroundHex } else { 'transparent' })"
}

"Generation des icones depuis assets/splash-logo.png :"

# Icone applicative : fond opaque (iOS/Android n'acceptent pas la transparence)
New-IconVariant -OutputName 'icon.png' -Size 1024 -LogoRatio 0.80 -BackgroundHex $lightBackground

# Foreground adaptatif Android : zone sure ~66 % du carre
New-IconVariant -OutputName 'adaptive-icon.png' -Size 1024 -LogoRatio 0.62
New-IconVariant -OutputName 'android-icon-foreground.png' -Size 512 -LogoRatio 0.62
New-IconVariant -OutputName 'android-icon-background.png' -Size 512 -LogoRatio 0.0 -BackgroundHex $lightBackground
New-IconVariant -OutputName 'android-icon-monochrome.png' -Size 432 -LogoRatio 0.62 -Monochrome

# Splash : logo seul, le fond vient de expo.splash.backgroundColor
New-IconVariant -OutputName 'splash-icon.png' -Size 1024 -LogoRatio 0.92

# Favicon web
New-IconVariant -OutputName 'favicon.png' -Size 96 -LogoRatio 0.92

"Termine."
