$ErrorActionPreference = "Stop"

# CHANGE THIS ROOT PER PROJECT
$ProjectRoot = "F:\prosjekter\NEW_PROJECT"
$ProjectName = "NEW_PROJECT"
$StatusFile  = Join-Path $ProjectRoot "status_bundle.txt"
$ReadmeFile  = Join-Path $ProjectRoot "README_MASTER.md"

if (!(Test-Path $ProjectRoot)) {
    New-Item -ItemType Directory -Path $ProjectRoot -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$status = @"
PROJECT_NAME=$ProjectName
PROJECT_ROOT=$ProjectRoot
SOURCE_OF_TRUTH=README_MASTER.md
WORKFLOW_MODE=PASTE_DIRECTLY_IN_POWERSHELL
STATUS_BUNDLE_IS_PRIMARY_DOCUMENT=true
LAST_UPDATED=$timestamp
CURRENT_PHASE=Bootstrap
LAST_ACTION=Initialized project workflow and status bundle
LAST_RESULT=PASS
NEXT_ACTION=Await next PowerShell block from ChatGPT
BUILD_STATUS=UNKNOWN
COMPILE_STATUS=UNKNOWN
RUNTIME_STATUS=UNKNOWN
DB_STATUS=UNKNOWN
AUTH_STATUS=UNKNOWN
TEST_STATUS=UNKNOWN
CI_STATUS=UNKNOWN
RISKS=
NOTES=All future PowerShell blocks must update this file.

MACHINE_READABLE_JSON_BEGIN
{
  "project_name": "$ProjectName",
  "project_root": "$($ProjectRoot -replace '\\','\\\\')",
  "source_of_truth": "README_MASTER.md",
  "workflow_mode": "paste_directly_in_powershell",
  "status_bundle_is_primary_document": true,
  "last_updated": "$timestamp",
  "current_phase": "Bootstrap",
  "last_action": "Initialized project workflow and status bundle",
  "last_result": "PASS",
  "next_action": "Await next PowerShell block from ChatGPT",
  "build_status": "UNKNOWN",
  "compile_status": "UNKNOWN",
  "runtime_status": "UNKNOWN",
  "db_status": "UNKNOWN",
  "auth_status": "UNKNOWN",
  "test_status": "UNKNOWN",
  "ci_status": "UNKNOWN",
  "risks": [],
  "notes": [
    "All future PowerShell blocks must update this file."
  ]
}
MACHINE_READABLE_JSON_END
"@

$readme = @"
# README_MASTER

## Project
Name: $ProjectName

## Source of truth
- status_bundle.txt for running execution status
- README_MASTER.md for project overview

## Workflow
- Paste PowerShell blocks directly into pwsh
- Each block must update status_bundle.txt
- status_bundle.txt is the primary execution handoff file
"@

Set-Content -Path $StatusFile -Value $status -Encoding UTF8
Set-Content -Path $ReadmeFile -Value $readme -Encoding UTF8

Write-Host ""
Write-Host "PASS: Bootstrap initialized" -ForegroundColor Green
Write-Host "PROJECT ROOT: $ProjectRoot" -ForegroundColor Cyan
Write-Host "STATUS FILE:  $StatusFile" -ForegroundColor Cyan
Write-Host ""
Get-Content $StatusFile
