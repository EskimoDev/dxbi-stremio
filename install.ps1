# dx.bi installer for Stremio Enhanced (Windows)
#   irm https://github.com/notdxbi/dxbi-stremio/releases/latest/download/install.ps1 | iex
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$baseUrl = if ($env:DXBI_BASE_URL) { $env:DXBI_BASE_URL } else { 'https://github.com/notdxbi/dxbi-stremio/releases/latest/download' }
$data = Join-Path $env:APPDATA 'stremio-enhanced'

Write-Host "DX.BI - installing into: $data" -ForegroundColor White
$themes = Join-Path $data 'themes'
$plugins = Join-Path $data 'plugins'
New-Item -ItemType Directory -Force -Path $themes, $plugins | Out-Null

$tmp = Join-Path ([IO.Path]::GetTempPath()) ("dxbi-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null

function Get-DxbiFile($name, $dest) {
    Write-Host ("  downloading {0,-18}" -f $name) -NoNewline
    $file = Join-Path $tmp $name
    Invoke-WebRequest -Uri "$baseUrl/$name" -OutFile $file -UseBasicParsing
    # sanity check: the file must be the real dx.bi mod, not an error page
    $head = Get-Content -Path $file -TotalCount 6 -Raw
    if ($head -notmatch '@name dx\.bi') {
        Write-Host ''
        throw "Download of $name looks wrong - aborting, nothing was changed."
    }
    Move-Item -Force -Path $file -Destination (Join-Path $dest $name)
    Write-Host ' ok' -ForegroundColor Green
}

try {
    Get-DxbiFile 'dxbi.theme.css' $themes
    Get-DxbiFile 'dxbi.plugin.js' $plugins
} finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host 'Done. Now in Stremio Enhanced:' -ForegroundColor White
Write-Host '  1. Restart the app'
Write-Host '  2. Settings -> Enhanced -> Themes  -> Apply  "dx.bi"'
Write-Host '  3. Settings -> Enhanced -> Plugins -> switch "dx.bi" on'
Write-Host ''
Write-Host 'Tip: turn off Dynamic Hero, Horizontal Navigation, Enhanced Covers and Enhanced Title Bar if you use them.'
