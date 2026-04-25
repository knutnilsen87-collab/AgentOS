# UI implementation sequence v1

## Purpose
Translate the UI spec into the smallest practical implementation order for the current repo.

## Work sequence

### Step 1 — extract the shell frame
Create reusable shell components and move layout out of `App.tsx`.

Files expected:
- `apps/desktop/src/components/shell/AppShell.tsx`
- `apps/desktop/src/components/shell/TopStatusBar.tsx`
- `apps/desktop/src/components/shell/LeftNavRail.tsx`
- `apps/desktop/src/components/shell/RightEvidenceRail.tsx`
- `apps/desktop/src/components/shell/RuntimeDock.tsx`

Verification:
- existing visual shell still renders
- risk and approval pills still show

### Step 2 — add UI phases and display profile types
Add minimal shared types for `UiPhase` and `UiDisplayProfile`.

Files expected:
- `packages/shared-types/src/ui.ts` or equivalent
- export barrel updates

Verification:
- renderer compiles with explicit phase typing

### Step 3 — build onboarding + project summary cards
Implement a readable project summary screen using static or scanner-backed seed data.

Verification:
- no generic empty main panel remains
- project summary contains stack, likely entry points, and next actions

### Step 4 — build mission compose flow
Add mission input + constraint bar in the center canvas.

Verification:
- user can create a mission without leaving the page
- scope and approval mode are visually editable

### Step 5 — render plan state from task engine
Connect current `buildPhaseOnePlan(...)` output into a plan review screen.

Verification:
- plan steps render as a dedicated artifact
- user can see a suggested next action

### Step 6 — render review + verification placeholders
Add review package card and verification checklist.

Verification:
- shell demonstrates the whole lifecycle visually even if execution remains stubbed

### Step 7 — add guided vs advanced toggle
Add display profile handling through a simple toggle or settings state.

Verification:
- layout frame stays stable
- helper text / density changes between profiles

## Keep these rules while implementing
- do not add a large client-side state library in this pass
- do not block on real filesystem integration if shell-state stubs are enough for the UI slice
- prefer typed seed view-models over scattered inline objects
- keep component names aligned with the UI spec
