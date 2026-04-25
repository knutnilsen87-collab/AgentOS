# Phase-1 UI layout and interaction spec v1

## 1. Purpose
This document defines the **developer-facing UI/UX specification** for the AgentOS phase-1 desktop shell.

It replaces the earlier short layout note and is intended to be concrete enough that a developer or Codex can:
- implement the shell structure without guessing the product intent
- keep the UI aligned with the repo vision, architecture, and safety model
- build the first vertical slice in the right order
- avoid drifting into a generic chat UI

This spec is intentionally scoped to the current repository state:
- desktop-first
- Windows-first
- local-first
- review-first
- conservative autonomy

## 2. Product UI thesis
AgentOS should **not** present itself primarily as a chatbot.

AgentOS should present itself as an **adaptive mission-control workspace** for project tasks.

The UI must communicate these truths at all times:
1. what the current mission is
2. what phase the system is in
3. what the system knows now
4. what it wants to do next
5. whether approval is required
6. what changed
7. what remains unverified

## 3. Core design principles

### 3.1 Goal-first, not chat-first
The primary entry point is the mission/task objective.
The user should start with **what they want to achieve**, not with an unstructured conversation.

### 3.2 State-first, not output-first
The UI must make system state legible before showing long output.
Users should understand status before reading details.

### 3.3 Review-first, not autonomy-first
The UI must make plan review, diff review, and verification more important than agent verbosity.

### 3.4 Adaptive, but structurally stable
The layout should adapt by:
- changing emphasis
- changing density
- changing how much help is visible
- changing which panel content is prioritized

The layout should **not** adapt by randomly moving primary navigation or core controls.

### 3.5 Artifact-aware rendering
Different artifacts must use different primary views:
- task objective -> mission card
- plan -> step list / phase board
- execution -> timeline + live log
- review -> diff / findings
- verification -> checks table + status summary
- prior run -> replay summary

### 3.6 Conservative visual language
The UI should feel premium, calm, and operational.
Avoid playful “AI assistant” styling.
Prefer clear information hierarchy and trust-building restraint.

## 4. Phase-1 UX goals
The phase-1 UI should make the following possible:
- onboard a local project
- display a project summary
- create a mission from natural language
- choose scope and approval mode
- generate a task plan
- save a task record locally
- show reviewable output
- show current approval state

Phase 1 does **not** need:
- full real-time multi-agent visualization
- complete runtime replay engine
- production-level command console
- team collaboration UI
- cloud execution dashboards

## 5. Fixed application frame
The desktop shell must use a stable 5-region frame.

## 5.1 Header
Purpose:
- global project/runtime truth

Required content:
- active project name
- current phase
- active approval mode
- risk badge
- environment/platform badge
- sandbox status
- branch indicator when available later

Rules:
- always visible
- compact
- no scrolling region inside header
- badges must be readable at a glance

## 5.2 Left rail
Purpose:
- stable navigation and project/task access

Required sections:
- projects
- recent tasks
- quick actions
- saved views or later routines placeholder

Rules:
- stable location
- should not collapse automatically on desktop widths >= 1280
- in phase 1, content can be mostly static placeholders if state is unavailable

## 5.3 Center canvas
Purpose:
- main phase workspace

The center canvas changes by phase, not by whim.
It is the primary adaptive region.

## 5.4 Right rail
Purpose:
- evidence, approvals, findings, and supporting context

Required content types:
- approval summary
- scanner summary
- affected files
- warnings
- verification checks
- review findings

Rules:
- the right rail becomes more prominent as risk increases
- this is where trust is built
- do not hide critical warnings behind deep nesting

## 5.5 Runtime dock / bottom strip
Purpose:
- execution telemetry and operational visibility

Phase-1 content:
- command placeholder or last run command
- current task state
- active package/runtime info
- background task count placeholder

Rules:
- can be compact in phase 1
- should be easy to expand later

## 6. Primary workflow model
The UI must reflect this sequence:

1. Project scan
2. Mission input
3. Constraint selection
4. Plan review
5. Execution
6. Review
7. Verification
8. Apply or discard
9. Learn / save memory later

This sequence is more important than any individual component.

## 7. Required screen states
The phase-1 desktop UI must support these major states.

### 7.1 Onboarding state
User has not yet selected a local project.

Primary center content:
- connect local project
- open existing task
- run health check

Acceptance criteria:
- new user sees three obvious entry actions
- no empty generic chat view is shown as the main screen

### 7.2 Project summary state
A project has been scanned, but no active mission is running.

Primary center content:
- project summary card
- stack summary
- likely entry points
- recommended next actions

Acceptance criteria:
- user can understand what the system knows about the project
- UI shows at least one suggested next step

### 7.3 Mission compose state
User is defining a new task.

Primary center content:
- mission input field
- lightweight helper suggestions
- prior task context if available later

Constraint bar content:
- scope selector
- approval mode selector
- allowed tools summary
- agent roles summary
- output target summary

Acceptance criteria:
- user can enter a mission without needing a long prompt
- user can constrain the task without leaving the screen

### 7.4 Plan state
System has interpreted the mission and generated a plan.

Primary center content:
- mission card
- ordered plan steps
- step purpose text
- assumptions block
- estimated blast radius

Right rail content:
- candidate files
- policy summary
- warnings

Acceptance criteria:
- user can approve plan, revise plan, or narrow scope
- plan is visually separated from execution and review

### 7.5 Execution state
The system is performing work or simulating work in the first slice.

Primary center content:
- current step
- current role
- progress state
- timeline items

Right rail content:
- files read
- last command or placeholder
- warnings or blockers

Acceptance criteria:
- user can tell what is happening now
- user can tell whether a write or approval boundary has been reached

### 7.6 Review state
The system has produced output for evaluation.

Primary center content:
- changed files list or placeholder review package
- summary of proposed changes
- reason for each change group

Right rail content:
- verification summary
- risk summary
- review actions

Acceptance criteria:
- user can approve, reject, request rework, or inspect details
- review is more important than generic agent prose

### 7.7 Verification state
The system presents evidence of whether the mission is complete.

Primary center content:
- checks table
- pass/fail/pending states
- definition-of-done summary

Right rail content:
- remaining warnings
- confidence level
- suggested next action

Acceptance criteria:
- “done” is not shown without a visible basis
- unresolved items are explicit

## 8. Adaptive UI rules
Adaptation in phase 1 should be intentionally limited and deterministic.

## 8.1 Adaptive dimension: user experience level
The shell should support two display profiles:
- `guided`
- `advanced`

### Guided profile
Use when:
- first run
- no saved tasks exist
- user explicitly chooses guided mode

UI behavior:
- larger headings and cards
- larger mission card
- fewer visible controls at once
- more helper text
- advanced details collapsed by default

### Advanced profile
Use when:
- user explicitly enables it
- later when user has repeated successful use

UI behavior:
- denser spacing
- more visible context in rails
- less helper text
- keyboard-first actions surfaced

Important rule:
These profiles must not rearrange the core layout frame.
They only change density, visible guidance, and default expansion.

## 8.2 Adaptive dimension: workflow phase
The center canvas changes with phase.
The rails remain, but their content priority changes.

Priority by phase:
- onboarding -> left rail low priority, center high priority, right rail minimal
- summary -> center summary high priority, right rail project evidence
- plan -> center plan high priority, right rail risk and affected files
- execution -> center timeline high priority, bottom dock more visible
- review -> right rail increases in prominence, diff/review controls dominate
- verification -> center checks + right rail unresolved risk

## 8.3 Adaptive dimension: risk
As risk rises, the UI must become more explicit.

Low risk:
- compact approval presentation
- modest warning emphasis

Medium risk:
- approval panel pinned
- affected files surfaced prominently

High risk:
- approval controls enlarged
- change impact summary mandatory
- warnings cannot be visually buried
- “apply” must never look casual

Phase 1 may simulate this with simple risk classes from `@agentos/policy-engine`.

## 9. Communication model
The UI must support six communication modes.

### 9.1 Mission input
Primary question shown to user:
**What do you want to achieve?**

### 9.2 Structured constraints
The user refines the mission through structured controls.

### 9.3 Artifact interaction
The user interacts with plans, findings, and review artifacts directly.

### 9.4 Approval actions
Approval is a first-class interaction, not a hidden confirm dialog.

### 9.5 Keyboard and command palette later
Do not block phase 1 on this, but keep layout ready.

### 9.6 Natural language refinement
The user can still explain edge cases, but this should be secondary to the mission-first flow.

## 10. Required components for phase 1
The following renderer components should exist or be created as phase-1 shell components.

## 10.1 App frame components
- `AppShell`
- `TopStatusBar`
- `LeftNavRail`
- `CenterCanvas`
- `RightEvidenceRail`
- `RuntimeDock`

## 10.2 Mission and planning components
- `MissionInputCard`
- `MissionSummaryCard`
- `ConstraintBar`
- `PlanStepList`
- `AssumptionList`
- `NextActionCard`

## 10.3 Project understanding components
- `ProjectSummaryCard`
- `ScannerFindingsList`
- `StackSummaryCard`
- `EntryPointList`

## 10.4 Review and verification components
- `ReviewPackageCard`
- `AffectedFilesList`
- `ApprovalPanel`
- `VerificationChecklist`
- `RiskBadge`
- `StatusBadge`

## 10.5 Supporting components
- `SectionCard`
- `PillGroup`
- `EmptyStateCard`
- `TimelineList`

## 11. Data contracts the UI depends on
The UI should not invent ad-hoc object shapes inside components.
Shared types should be extended in `packages/shared-types/`.

Recommended shared types for phase 1:
- `ProjectProfile`
- `MissionDraft`
- `TaskPlan`
- `TaskPlanStep`
- `TaskRunSummary`
- `ReviewPackage`
- `VerificationCheck`
- `ApprovalState`
- `UiDisplayProfile`
- `UiPhase`

Suggested `UiPhase` enum values:
- `onboarding`
- `projectSummary`
- `missionCompose`
- `plan`
- `execution`
- `review`
- `verification`

Suggested `UiDisplayProfile` values:
- `guided`
- `advanced`

## 12. Package-to-UI mapping
To match the current repo structure, responsibilities should be split like this.

### `packages/shared-types`
Holds UI-safe shared domain types and enums.

### `packages/project-scanner`
Supplies project summary data for:
- project summary card
- stack summary
- entry points
- scanner findings

### `packages/task-engine`
Supplies:
- mission interpretation output
- phase-1 plan
- plan steps
- next-action recommendation

### `packages/policy-engine`
Supplies:
- approval mode labels
- risk classification
- apply/approve button gating rules

### `packages/task-store`
Supplies:
- saved recent tasks
- run summaries
- later replay metadata

### `packages/status-bundle`
Supplies:
- status-aligned textual summaries later when needed

## 13. Screen-by-screen developer spec

## 13.1 Shell home / onboarding screen
Use when no active project is loaded.

Must include:
- product title
- concise explanation
- 3 primary action cards
- recent project placeholder region

Primary actions:
- Connect local project
- Open existing task
- Run health check

Do not include as primary content:
- raw logs
- generic chat transcript
- dense technical setup panel

## 13.2 Project summary screen
Must include:
- project summary headline
- stack summary
- likely entry points
- status of verification
- suggested next actions

Suggested next actions:
- Understand project deeper
- Fix something concrete
- Set up routines later

## 13.3 Mission compose screen
Must include:
- mission prompt field
- scope chips or selector
- approval mode selector
- allowed tools summary
- agent roles summary or default roles
- submit action

Primary CTA label:
- `Generate plan`

Secondary CTA labels:
- `Narrow scope`
- `Read-only first`

## 13.4 Plan review screen
Must include:
- mission summary
- plan step list
- assumptions section
- blast radius section
- approval choice

Primary actions:
- Approve plan
- Approve read-only only
- Revise plan
- Change scope

## 13.5 Execution screen
Must include:
- current phase badge
- active step title
- current status text
- timeline items
- last command placeholder or actual command later
- current warnings or blockers

Primary actions:
- Stop
- Return to plan
- Continue when applicable

## 13.6 Review screen
Must include:
- summary of what changed or would change
- affected files list
- review reasoning per change group
- approval panel

Primary actions:
- Approve
- Reject
- Request rework
- Inspect details

## 13.7 Verification screen
Must include:
- checks list
- pass/fail/pending badge per check
- mission completion summary
- unresolved risk summary

Primary actions:
- Apply
- Keep in sandbox
- Export patch later
- Discard

## 14. Visual system rules
Phase 1 should extend the current dark premium shell rather than replacing it.

## 14.1 Tone
Desired feel:
- premium
- calm
- precise
- high-trust
- operator-grade

Avoid:
- cartoon AI styling
- excessive neon
- cluttered panels
- chat-bubble-first layout

## 14.2 Information hierarchy
Priority order on screen:
1. mission / phase / truth state
2. next decision
3. evidence
4. details
5. decorative content

## 14.3 Typography
- strong page headline
- visible section headings
- small eyebrow labels for context
- monospaced text only for log/code-specific regions

## 14.4 Spacing
- generous card spacing in guided mode
- denser but still readable spacing in advanced mode
- maintain visible grouping between mission, evidence, and approval

## 14.5 Color semantics
At minimum define tokens or stable semantic uses for:
- neutral/info
- success
- warning
- danger
- pending
- active/accent

Use semantic color meaning more than decorative color variety.

## 15. Accessibility and ergonomics
Even in a phase-1 desktop shell, the following are required:
- visible focus states
- keyboard reachable primary controls
- adequate contrast for status badges
- not relying only on color for pass/fail/warning
- minimum click target comfort for primary action buttons

## 16. State model requirements
The UI must make these states explicit:
- current project state
- current mission state
- current plan state
- current approval mode
- current risk level
- current verification status

The user must never have to infer approval mode from hidden logic.

## 17. Implementation constraints for fastest path
To match the rest of the repo and keep speed high:
- use simple React component composition first
- avoid heavy state-management libraries in phase 1
- use local component state and thin adapters to package data
- keep renderer logic presentation-first
- keep filesystem and runtime knowledge outside renderer where practical
- do not add design-system complexity before the main workflow is proven

## 18. Recommended component tree for the current app
A practical initial structure under `apps/desktop/src/` is:

- `App.tsx`
- `components/shell/AppShell.tsx`
- `components/shell/TopStatusBar.tsx`
- `components/shell/LeftNavRail.tsx`
- `components/shell/RightEvidenceRail.tsx`
- `components/shell/RuntimeDock.tsx`
- `components/mission/MissionInputCard.tsx`
- `components/mission/MissionSummaryCard.tsx`
- `components/mission/ConstraintBar.tsx`
- `components/project/ProjectSummaryCard.tsx`
- `components/project/ScannerFindingsList.tsx`
- `components/plan/PlanStepList.tsx`
- `components/review/ReviewPackageCard.tsx`
- `components/review/VerificationChecklist.tsx`
- `lib/view-models.ts`
- `lib/seed-data.ts`

Phase 1 may start with static seed data and then connect to packages progressively.

## 19. Implementation order for UI work
The UI implementation should follow this order.

### Slice 1
Refactor the current single-file renderer into the fixed application frame.

Definition of done:
- header, left rail, center canvas, right rail exist as separate components
- no functional regression vs current shell

### Slice 2
Implement onboarding + project summary screens using project scanner stub data.

Definition of done:
- user can see a project summary state
- no chat-first landing screen remains

### Slice 3
Implement mission compose + constraint bar.

Definition of done:
- user can enter a mission and see constraints before plan generation

### Slice 4
Implement plan review state from task-engine output.

Definition of done:
- plan is visible as a discrete phase
- user can choose approval path

### Slice 5
Implement review + verification cards using placeholder review data.

Definition of done:
- UI can render a review package and a verification checklist

### Slice 6
Add guided vs advanced density behavior.

Definition of done:
- same layout frame persists
- profile toggle changes density/help level only

## 20. Acceptance criteria summary
This document should be considered implemented for phase 1 when:
- the app no longer reads like a generic AI chat shell
- the main UI follows the 5-region frame
- the user can move through mission -> constraints -> plan -> review -> verification visually
- approval mode and risk are always visible
- project summary and recent tasks are visible in stable places
- the right rail acts as the evidence and approval zone
- guided and advanced profiles exist without layout instability

## 21. Explicit non-goals for this spec
This spec does not require phase 1 to implement:
- real code diff rendering
- true replay engine
- full timeline telemetry
- full accessibility audit completeness
- multi-window orchestration
- mobile responsive app shell

## 22. Notes for Codex and future developers
When implementing this spec:
- prefer small UI slices that map to the build order
- do not introduce architectural drift for visual polish alone
- keep the shell honest about what is simulated vs verified
- preserve the current repo mission: local-first, review-first, conservative, executable
