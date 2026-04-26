# MVP 1 product readiness

## MVP promise
AgentOS MVP 1 is a local-first desktop workflow that lets one operator:

1. open or default to a local project
2. start local sandbox state before project connection
3. scan the project read-only
4. describe a mission
5. generate a reviewable plan
6. persist the task record locally
7. approve read-only continuation or request rework
8. run a constrained verification command
9. review command evidence, Git evidence, lifecycle events, and verification checks

## What is intentionally included
- Electron + React desktop shell
- stable mission-control UI frame
- local `.agentos/tasks` persistence
- project summary scan
- task planning
- approval decision persistence
- lifecycle events
- verification checks
- Git review summary
- constrained MVP verification via `npm run smoke`

## What is intentionally not included yet
- arbitrary command execution
- file editing or patch application
- true sandbox isolation beyond conservative IPC limits
- installer/signing/update pipeline
- cloud runtime
- multi-user collaboration

## MVP ready checks
Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\validate.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\review-local.ps1
npm run mvp:check
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Manual UI pass:
- confirm the shell opens
- confirm `Platform: win32`
- confirm sandbox status becomes ready before connecting a project
- confirm project scan renders
- generate a plan
- approve read-only or request rework
- run verification from the runtime dock
- confirm the task record updates under `.agentos/tasks`
- record the result in `docs/03_execution/MVP_1_MANUAL_QA.md`

## MVP exit criteria
MVP 1 is ready when automated checks pass and the manual UI pass succeeds once on this machine.
