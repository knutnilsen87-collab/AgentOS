# Handoff notes

## What changed in this version
- fixed the Electron preload bridge by switching from ESM preload to `preload.cjs`, removing Node path usage from preload, and setting Electron `sandbox: false` with `contextIsolation: true`
- added explicit sandbox initialization before project connection
- disabled project connection until sandbox is ready
- removed automatic project scan before sandbox/project connection
- added a dev preflight that reports port 5173 conflicts clearly
- implemented the first MVP product workflow in code
- added a constrained Electron verification bridge that only runs `npm run smoke`
- added a `Run verification` action in the runtime dock
- task records now capture verification command output, lifecycle event, status, notes, and pass/fail verification result
- documented MVP 1 scope and readiness in `docs/03_execution/MVP_1_PRODUCT_READINESS.md`
- initialized Git for the workspace and configured this path as safe for local Git review
- added Git review summary types and a constrained Electron IPC endpoint for branch/status/diff-stat evidence
- surfaced Git review evidence in the right rail and review package card
- added `scripts/review-local.ps1` plus `npm run review:local`
- ignored historical starter zip/copy artifacts to avoid accidental baseline commits
- added persisted approval decisions, lifecycle events, and verification checks to task records
- added task record update support in `packages/task-store`, Electron main, and preload
- wired right-rail approval actions to save read-only approval and rework decisions
- expanded the core smoke test to verify task update/lifecycle persistence
- verified dev server HTTP 200 after the lifecycle UI changes
- imported updated UI spec files into `docs/05_ui_ux`
- added the `ui-mission-control` repo skill
- refactored the desktop renderer into the spec's 5-region mission-control frame
- added typed UI phases, display profiles, approval state, and verification checks to shared types
- added guided/advanced display profile behavior without moving the core layout
- verified the updated UI with `scripts/validate.ps1` and a Vite HTTP 200 dev-server check
- installed Node.js LTS and Git on the freshly formatted Windows machine using winget
- installed npm workspace dependencies
- fixed TypeScript 6 workspace configuration and package references
- verified workspace typecheck and build across desktop and all core packages
- added and verified a core smoke test for policy, scanner, planner, task-store, and status-bundle behavior
- verified the dev flow starts Vite on `http://localhost:5173` and launches Electron processes
- fixed Electron `repoRoot` resolution so the app points at `F:\prosjekter\AgentOS` instead of `F:\`
- hardened PowerShell scripts so they find standard Node/Git installs and fail on native npm errors
- extended the phase-1 desktop shell from a static scaffold into a task-oriented control room
- added project folder selection through Electron
- added read-only project scanning with top-level entry and manifest summary
- added natural-language task input, richer plan generation, and run-summary generation
- added status bundle rendering for each saved task run
- added local task record persistence to `F:\prosjekter\AgentOS\.agentos\tasks`
- aligned the default project root to `F:\prosjekter\AgentOS`
- tightened PowerShell setup, doctor, validation, and dev scripts with explicit command checks
- refreshed README, README_MASTER, and `status_bundle.txt` to match the actual code state

## Honest current state
The first MVP product slice is now implemented in code and locally validated: dependencies installed, `scripts/doctor.ps1` passes, `scripts/validate.ps1` passes, the core smoke test passes, and the updated mission-control dev shell serves over Vite. The app now starts local sandbox state before enabling project connection; the Electron preload bridge should show `Platform: win32` in the desktop shell after a full Electron restart. The app can scan a project, generate and persist a task plan, persist an approval decision, run constrained smoke verification from the runtime dock, and save command evidence back into the task record. The remaining unverified item is an interactive manual UI pass where a user clicks through the full MVP workflow in the Electron window.

## Exact next operator steps
1. Run `powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1`
2. Confirm the header shows `Platform: win32`
3. Confirm sandbox state becomes `ready`
4. In the desktop shell, open `F:\prosjekter\AgentOS`
5. Confirm the scan summary renders
6. Generate a task plan
7. Click `Approve read-only` or `Request rework`
8. Click `Run verification`
9. Confirm command evidence and verification checks update in the UI
10. Confirm a task record is written and updated under `.agentos\tasks`
11. Run `npm run review:local` before creating the first curated baseline commit

## First milestone after setup
The desktop shell opens against `F:\prosjekter\AgentOS`, scans a selected folder read-only, generates a reviewable task plan, and writes structured task records into `.agentos\tasks`.
