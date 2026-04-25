$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path "$PSScriptRoot\.."
$statusFile = Join-Path $repoRoot 'status_bundle.txt'
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$content = @"
PROJECT: AgentOS
PHASE: Phase-1 desktop shell vertical slice
LAST_UPDATED: $timestamp

CURRENT_STATE:
- Product definition exists.
- Codex-ready onboarding exists.
- Phase-1 monorepo scaffold exists.
- Dependency setup has been run on this Windows machine.
- Use scripts/validate.ps1 for the authoritative typecheck, build, and smoke-test status.

NEXT_ACTIONS:
- Run scripts/validate.ps1.
- Run scripts/dev.ps1 for an interactive manual UI pass.
- Use the desktop shell to scan a local project, generate a task plan, and save a task record.
"@

Set-Content -Path $statusFile -Value $content -Encoding UTF8
Write-Host "Updated $statusFile" -ForegroundColor Green
