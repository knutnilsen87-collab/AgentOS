# AGENTS.md

## Repository mission
Build AgentOS into a usable desktop-first agentic project operating system.
This repository is no longer documentation-only. It now contains a **phase-1 implementation scaffold**.

## Source of truth
Read these first and in order:
1. `status_bundle.txt`
2. `README.md`
3. `README_MASTER.md`
4. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
5. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
6. `docs/03_execution/PHASE_1_BUILD_ORDER.md`
7. `docs/03_execution/FIRST_25_CODEX_TASKS.md`
8. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
9. `09_MACHINE_READABLE/project_manifest.json`

## Current repository state
- documented: yes
- codex-ready: yes
- scaffolded: yes
- dependency install verified: no
- compile-ready after install: intended, not yet verified in this environment
- production-ready: no

## Working rules
- Preserve the monorepo boundaries unless a document explicitly changes them.
- Keep changes small, reviewable, and reversible.
- Do not claim build success unless commands were actually run.
- Prefer getting phase-1 packages type-safe and wired before adding new surface area.
- Update `status_bundle.txt` and `handoff_notes.md` after major milestones.
- Use `.agents/skills/` when a skill matches the task.
- Route large tasks through project-scoped agents in `.codex/agents/` when useful.
- Do not add heavyweight dependencies without documenting the reason in `docs/06_adrs/`.

## Default delivery format for meaningful changes
When making a substantial change, include:
- changed files
- what was implemented
- what remains unverified
- exact next command or next task

## Phase-1 priorities
1. install dependencies
2. verify package structure and TypeScript wiring
3. verify desktop shell launches locally
4. connect UI to scanner/task/policy packages
5. implement first end-to-end task lifecycle
6. improve persistence, review output, and approvals

## What not to do yet
- do not build full cloud execution
- do not build enterprise auth/admin
- do not over-engineer sandboxing before the local workflow is proven
- do not replace the stack without documenting the tradeoff
