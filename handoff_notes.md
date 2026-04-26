# Handoff notes

## What changed in this version
- added persistent conversation storage via Electron IPC under `.agentos/conversations`
- added persistent mission-kernel state storage via Electron IPC under `.agentos/missions`
- added append-only audit event writes for task saves, mission saves, and agent command calls under `.agentos/audit/events.jsonl`
- added command intent routing for `/scan`, `/plan`, `/review`, `/verify`, and `/status`
- ignored the raw `agentos-mission-kernel-package.zip` artifact because the package is now integrated as source
- wired the bottom command dock to a real Electron IPC command runtime
- added OpenAI Responses API support in Electron main when `OPENAI_API_KEY` is configured
- kept a Norwegian local fallback response path when no LLM key is present or the LLM call fails
- documented optional `OPENAI_API_KEY` and `OPENAI_MODEL` values in `.env.example`
- kept API keys out of the renderer/preload public surface
- added `ActiveWorkPanel` to show active task chat and job progress in the center canvas
- moved full conversation/job visibility out of the bottom dock and into the main workspace
- kept the bottom conversation dock as a persistent command/input surface
- integrated `agentos-mission-kernel-package` into the app as `packages/mission-kernel`
- added `@agentos/mission-kernel` workspace build/typecheck wiring and desktop dependency wiring
- exposed renderer-safe mission factory/state-machine exports plus node-facing scanner/audit/agent exports
- wired desktop mission generation, task selection, approval, and verification to mission-kernel state
- added a mission-kernel card in the phase workspace so state, phase, allowed transitions, and scoped tools are visible
- extended the core smoke test to verify mission creation and state transitions
- implemented the requested synthwave palette as CSS design tokens in the desktop shell
- mapped the palette into existing UI surfaces, buttons, badges, risk states, focus states, and the bottom command dock without adding a decorative palette panel
- refactored the desktop center canvas into phase-specific views instead of rendering most major cards at once
- made onboarding calm and action-led, with explicit connect/open/health-check actions
- made mission compose the dominant center surface and moved project/constraint details into support roles
- made the right evidence rail phase-aware and compact before plan/review/verification
- added a persistent bottom conversation/command dock with context strip, quick action chips, task-scoped preview, and multiline input
- made Guided mode hide more early detail while Advanced mode keeps denser scanner/evidence metadata visible
- added `npm run mvp:check` as an automated MVP readiness gate
- added `scripts/mvp-check.ps1` to run doctor, typecheck, build, smoke, local review, and a local dev-server HTTP 200 check
- added `docs/03_execution/MVP_1_MANUAL_QA.md` for the required human Electron acceptance pass
- added a right-rail Git evidence refresh action
- surfaced tracked diff stat inside the review package card
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
The first MVP product slice is now implemented in code and locally validated: dependencies installed, `scripts/doctor.ps1` passes, `scripts/validate.ps1` passes, the core smoke test passes, and the updated mission-control dev shell serves over Vite. The app now starts local sandbox state before enabling project connection; the Electron preload bridge should show `Platform: win32` in the desktop shell after a full Electron restart. The app can scan a project, generate and persist a task plan, persist an approval decision, run constrained smoke verification from the runtime dock, refresh Git evidence, and save command evidence back into the task record. The shell is now calmer and phase-based, with a persistent bottom command dock that remains secondary to mission-control surfaces. Automated readiness can now be re-run with `npm run mvp:check`. The remaining unverified item is an interactive manual UI pass where a user clicks through the full MVP workflow in the Electron window.

## Exact next operator steps
1. Run `npm run mvp:check`
2. Run `powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1`
3. Confirm the header shows `Platform: win32`
4. Confirm sandbox state becomes `ready`
5. Confirm onboarding shows only the focused start actions plus compact supporting rails
6. In the desktop shell, open `F:\prosjekter\AgentOS`
7. Confirm the project summary phase renders without heavy review content
8. Continue to mission compose and confirm mission input is the dominant center element
9. Generate a task plan and confirm only plan/review-relevant surfaces are visible
10. Click `Approve read-only` or `Request rework`
11. Click `Run verification`
12. Confirm command evidence, Git evidence, diff stat, and verification checks update in the UI
13. Confirm the bottom command dock stays available but secondary
14. Confirm a task record is written and updated under `.agentos\tasks`
15. Record the result in `docs/03_execution/MVP_1_MANUAL_QA.md`

## First milestone after setup
The desktop shell opens against `F:\prosjekter\AgentOS`, scans a selected folder read-only, generates a reviewable task plan, and writes structured task records into `.agentos\tasks`.
