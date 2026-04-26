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

function Assert-PortFree {
  $portCheck = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
  if ($portCheck) {
    $owners = ($portCheck | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
    throw "Port 5173 is already in use by process id(s): $owners. Stop the existing AgentOS/Vite session before running MVP check."
  }
}

function Wait-ForDevServer {
  $deadline = (Get-Date).AddSeconds(45)
  do {
    try {
      $response = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 750
    }
  } while ((Get-Date) -lt $deadline)

  throw 'Dev server did not return HTTP 200 on http://localhost:5173 within 45 seconds.'
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

Write-Host '=== AgentOS MVP check ===' -ForegroundColor Cyan

Assert-CommandExists -Name 'npm.cmd'
Assert-CommandExists -Name 'git.exe'

Invoke-Checked -Description 'doctor' -Command { npm.cmd run doctor }
Invoke-Checked -Description 'workspace typecheck' -Command { npm.cmd run typecheck }
Invoke-Checked -Description 'workspace build' -Command { npm.cmd run build }
Invoke-Checked -Description 'core smoke test' -Command { npm.cmd run smoke }
Invoke-Checked -Description 'local review' -Command { npm.cmd run review:local }

Assert-PortFree

$stdoutLogPath = Join-Path $repoRoot '.agentos\mvp-check-dev.out.log'
$stderrLogPath = Join-Path $repoRoot '.agentos\mvp-check-dev.err.log'
New-Item -ItemType Directory -Force -Path (Split-Path $stdoutLogPath) | Out-Null
$devProcess = Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-ExecutionPolicy',
  'Bypass',
  '-File',
  (Join-Path $repoRoot 'scripts\dev.ps1')
) -WorkingDirectory $repoRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutLogPath -RedirectStandardError $stderrLogPath

try {
  Wait-ForDevServer
  Write-Host 'Dev server returned HTTP 200 on http://localhost:5173.' -ForegroundColor Green
} finally {
  if ($devProcess -and -not $devProcess.HasExited) {
    & taskkill.exe /PID $devProcess.Id /T /F | Out-Null
  }
}

Write-Host 'MVP automated check complete. Manual Electron click-through is still required for final MVP acceptance.' -ForegroundColor Green
