param(
  [Parameter(Mandatory = $true)]
  [string]$Prompt
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path "$PSScriptRoot\.."
$taskDir = Join-Path $repoRoot '.agentos\tasks'
New-Item -ItemType Directory -Path $taskDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$file = Join-Path $taskDir "task_$stamp.txt"
Set-Content -Path $file -Value $Prompt -Encoding UTF8
Write-Host "Created $file" -ForegroundColor Green
