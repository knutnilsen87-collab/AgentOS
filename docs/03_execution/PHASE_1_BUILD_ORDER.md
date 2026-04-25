# Phase 1 build order

## Goal
Get from repository scaffold to a real local-first product slice as fast as possible with the least architectural debt.

## Sequence

### Step 1 — verify bootstrap environment
- run `scripts/setup-dev.ps1`
- confirm Node/npm versions
- install dependencies
- update status bundle

### Step 2 — verify workspace wiring
- run root `typecheck`
- fix package path issues
- fix Electron/Vite config issues
- confirm root scripts are coherent

### Step 3 — launch desktop shell
- run `scripts/dev.ps1`
- confirm the window opens
- confirm preload bridge is visible in UI
- confirm no obvious boot errors

### Step 4 — wire project scanner
- connect the project scanner package to the desktop shell
- show repo summary in the UI
- keep it read-only

### Step 5 — wire task planner
- create a basic task form
- run task classification and plan generation locally
- show plan steps in UI

### Step 6 — persist tasks locally
- save task records to `.agentos/tasks/`
- add a recent task list in the UI

### Step 7 — expose approval model
- show read-only / propose-only / edit-with-approval in the UI
- route planner output through policy checks

### Step 8 — produce first review package
- show task summary
- show touched file list
- show command log placeholder
- update status bundle and handoff notes

## Definition of done for phase 1
A user can open a local project, generate a task plan, save a task run, see approval mode state, and review the output in the desktop shell.
