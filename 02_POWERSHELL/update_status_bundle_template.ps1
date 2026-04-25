$ErrorActionPreference = "Stop"

# EXPECTS these to be edited for the specific action
$ProjectRoot   = "F:\prosjekter\NEW_PROJECT"
$StatusFile    = Join-Path $ProjectRoot "status_bundle.txt"
$CurrentPhase  = "Implementation"
$LastAction    = "Describe what this block just did"
$LastResult    = "PASS"
$NextAction    = "Describe the next recommended block/action"
$BuildStatus   = "UNKNOWN"
$CompileStatus = "UNKNOWN"
$RuntimeStatus = "UNKNOWN"
$DbStatus      = "UNKNOWN"
$AuthStatus    = "UNKNOWN"
$TestStatus    = "UNKNOWN"
$CiStatus      = "UNKNOWN"
$Notes         = "Update this text per action"

if (!(Test-Path $StatusFile)) {
    throw "status_bundle.txt not found: $StatusFile"
}

$content = Get-Content $StatusFile -Raw
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Set-LineValue {
    param([string]$Name,[string]$Value,[string]$Text)
    $pattern = "(?m)^" + [regex]::Escape($Name) + "=.*$"
    $replacement = "$Name=$Value"
    if ($Text -match $pattern) {
        return [regex]::Replace($Text, $pattern, $replacement)
    } else {
        return $Text + "`r`n$replacement"
    }
}

$content = Set-LineValue "LAST_UPDATED"   $timestamp      $content
$content = Set-LineValue "CURRENT_PHASE"  $CurrentPhase   $content
$content = Set-LineValue "LAST_ACTION"    $LastAction     $content
$content = Set-LineValue "LAST_RESULT"    $LastResult     $content
$content = Set-LineValue "NEXT_ACTION"    $NextAction     $content
$content = Set-LineValue "BUILD_STATUS"   $BuildStatus    $content
$content = Set-LineValue "COMPILE_STATUS" $CompileStatus  $content
$content = Set-LineValue "RUNTIME_STATUS" $RuntimeStatus  $content
$content = Set-LineValue "DB_STATUS"      $DbStatus       $content
$content = Set-LineValue "AUTH_STATUS"    $AuthStatus     $content
$content = Set-LineValue "TEST_STATUS"    $TestStatus     $content
$content = Set-LineValue "CI_STATUS"      $CiStatus       $content
$content = Set-LineValue "NOTES"          $Notes          $content

$startMarker = "MACHINE_READABLE_JSON_BEGIN"
$endMarker   = "MACHINE_READABLE_JSON_END"

if ($content -match "(?s)$startMarker\s*(\{.*?\})\s*$endMarker") {
    $jsonText = $matches[1]
    $obj = $jsonText | ConvertFrom-Json
    $obj.last_updated   = $timestamp
    $obj.current_phase  = $CurrentPhase
    $obj.last_action    = $LastAction
    $obj.last_result    = $LastResult
    $obj.next_action    = $NextAction
    $obj.build_status   = $BuildStatus
    $obj.compile_status = $CompileStatus
    $obj.runtime_status = $RuntimeStatus
    $obj.db_status      = $DbStatus
    $obj.auth_status    = $AuthStatus
    $obj.test_status    = $TestStatus
    $obj.ci_status      = $CiStatus
    $obj.notes          = @($Notes)

    $newJson = $obj | ConvertTo-Json -Depth 10
    $content = [regex]::Replace(
        $content,
        "(?s)$startMarker\s*\{.*?\}\s*$endMarker",
        "$startMarker`r`n$newJson`r`n$endMarker"
    )
}

Set-Content -Path $StatusFile -Value $content -Encoding UTF8

Write-Host ""
Write-Host "$LastResult: status_bundle.txt updated" -ForegroundColor Green
Write-Host ""
Get-Content $StatusFile
