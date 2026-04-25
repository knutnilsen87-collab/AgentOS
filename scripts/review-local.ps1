$ErrorActionPreference = 'Stop'

@('C:\Program Files\Git\cmd') |
  Where-Object { Test-Path $_ } |
  ForEach-Object { $env:Path = "$_;$env:Path" }

function Assert-CommandExists {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

Assert-CommandExists -Name 'git.exe'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

Write-Host '=== AgentOS local review ===' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host "Branch: $(& git.exe branch --show-current)"
Write-Host ''
Write-Host 'Changed files:' -ForegroundColor Yellow
& git.exe status --short
Write-Host ''
Write-Host 'Tracked diff stat:' -ForegroundColor Yellow
& git.exe diff --stat
