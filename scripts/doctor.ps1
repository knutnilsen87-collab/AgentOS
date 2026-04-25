$ErrorActionPreference = 'Stop'

@('C:\Program Files\nodejs', 'C:\Program Files\Git\cmd') |
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

Write-Host '=== AgentOS doctor ===' -ForegroundColor Cyan

Assert-CommandExists -Name 'node.exe'
Assert-CommandExists -Name 'npm.cmd'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
$gitStatus = if ($gitCommand) { 'available' } else { 'missing' }

Write-Host "Node: $(& node.exe --version)"
Write-Host "npm:  $(& npm.cmd --version)"
Write-Host "Repo root: $repoRoot"
Write-Host "git:  $gitStatus"
Write-Host 'Check complete.' -ForegroundColor Green
