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

Write-Host '=== AgentOS dev ===' -ForegroundColor Cyan

Assert-CommandExists -Name 'npm.cmd'

$portCheck = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($portCheck) {
  $owners = ($portCheck | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
  throw "Port 5173 is already in use by process id(s): $owners. Stop the existing AgentOS/Vite session before starting a new one."
}

npm.cmd run dev
