# MVP 1 manual QA

## Purpose
This checklist is the human acceptance pass for MVP 1. Automated checks prove the workspace can build and the local dev server can answer, but the Electron product flow still needs one operator click-through before the MVP is considered accepted.

## Preflight
Run:

```powershell
npm run mvp:check
```

Expected result:
- doctor passes
- typecheck passes
- build passes
- core smoke passes
- local review command runs
- dev server returns HTTP 200 on `http://localhost:5173`

## Click-through
Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Then verify:
- header shows `Platform: win32`
- sandbox state becomes `ready`
- project connection is blocked until sandbox is ready
- `Connect local project` opens the folder picker
- selecting `F:\prosjekter\AgentOS` renders scanner evidence
- mission input can generate a plan
- task record is saved under `.agentos\tasks`
- `Approve read-only` persists an approval decision
- `Request rework` persists a rework decision when used
- `Run verification` executes the constrained smoke command
- verification result is saved back into the selected task
- right rail Git evidence can be refreshed
- review package shows changed files and tracked diff stat

## Current result
Pending. The automated MVP check exists, but a fresh manual Electron click-through must still be performed on this machine.
