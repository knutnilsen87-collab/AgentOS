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

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command,
    [Parameter(Mandatory = $true)]
    [string]$Description
  )

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Description failed with exit code $LASTEXITCODE."
  }
}

Write-Host '=== AgentOS setup-dev ===' -ForegroundColor Cyan
Write-Host 'Checking Node and npm...' -ForegroundColor Yellow

Assert-CommandExists -Name 'node.exe'
Assert-CommandExists -Name 'npm.cmd'

Invoke-Checked -Description 'node version check' -Command { node.exe --version }
Invoke-Checked -Description 'npm version check' -Command { npm.cmd --version }

Write-Host 'Installing workspace dependencies...' -ForegroundColor Yellow
Invoke-Checked -Description 'npm install' -Command { npm.cmd install }

Write-Host 'Updating status bundle...' -ForegroundColor Yellow
Invoke-Checked -Description 'status bundle update' -Command { powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\update-status-bundle.ps1" }

Write-Host 'Setup complete.' -ForegroundColor Green
