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

Write-Host '=== AgentOS validation ===' -ForegroundColor Cyan

Assert-CommandExists -Name 'npm.cmd'

Invoke-Checked -Description 'workspace typecheck' -Command { npm.cmd run typecheck }
Invoke-Checked -Description 'workspace build' -Command { npm.cmd run build }
Invoke-Checked -Description 'core smoke test' -Command { npm.cmd run smoke }

Write-Host 'Validation complete.' -ForegroundColor Green
