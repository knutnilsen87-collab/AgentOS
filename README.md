# AgentOS Starter Repo v1

AgentOS is a **desktop-first agentic project operating system** designed to understand, plan, execute, verify, review, and improve work across code, documentation, repo workflows, and automation.

This repository is the **first executable scaffold** for the product. It extends the original Codex-ready bootstrap with:

- a Windows-first monorepo layout
- a desktop app shell scaffold
- package boundaries for the core agent runtime layers
- Codex project instructions, custom agents, and repo-scoped skills
- start-to-finish implementation docs, backlog, and phase gates
- PowerShell helpers for setup, dev, validation, and status updates

## Current maturity

- Product definition: **done**
- High-level architecture: **done**
- Codex onboarding package: **done**
- Phase-1 repo scaffold: **done**
- First desktop shell vertical slice: **implemented in code**
- Dependency install: **verified on this Windows machine**
- First compile/build verification: **verified with `scripts/validate.ps1`**
- Core smoke verification: **verified with `scripts/validate.ps1`**
- Desktop dev launch: **verified to start Vite and Electron processes**
- Production readiness: **no**

## Recommended stack for fastest path

- **Monorepo:** npm workspaces
- **Desktop shell:** Electron + React + TypeScript renderer
- **Core runtime packages:** TypeScript packages with clear boundaries
- **Persistence in phase 1:** filesystem-backed `.agentos/` data
- **Windows ergonomics:** PowerShell entry scripts + `.bat` launchers

## Why this stack

The fastest route to a useful local-first product is a desktop app that can safely orchestrate local file access, shell commands, status tracking, and later sandboxing. Electron is the pragmatic phase-1 choice because it reduces friction for Windows local tooling and terminal integration.

## Repository map

- `apps/desktop/` - desktop shell scaffold
- `packages/shared-types/` - shared domain types
- `packages/policy-engine/` - approval and risk rules
- `packages/task-engine/` - task planning and orchestration helpers
- `packages/project-scanner/` - repo scanning utilities
- `packages/task-store/` - local task/run persistence
- `packages/status-bundle/` - status bundle generation helpers
- `docs/` - product, architecture, execution, ops, UI, ADRs
- `scripts/` - Windows-first setup/dev/validation scripts
- `.agentos/` - local runtime artifacts, memory, tasks, cache
- `.codex/` - project-scoped Codex configuration and custom agents
- `.agents/skills/` - repo-scoped reusable Codex skills

## Source of truth order

1. `status_bundle.txt`
2. `README.md`
3. `README_MASTER.md`
4. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
5. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
6. `docs/03_execution/PHASE_1_BUILD_ORDER.md`
7. `docs/03_execution/FIRST_25_CODEX_TASKS.md`
8. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
9. `AGENTS.md`
10. `.codex/config.toml`

## First run

### Option A - one-click on Windows

1. Double-click `windows/SETUP_AGENTOS_DEV.bat`
2. After dependencies install, double-click `windows/START_AGENTOS_DEV.bat`

### Option B - PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-dev.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\validate.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

## First Codex session

Open this repo in Codex and start with:

```text
Read status_bundle.txt, README.md, AGENTS.md, docs/03_execution/PHASE_1_BUILD_ORDER.md, and docs/03_execution/FIRST_25_CODEX_TASKS.md. Then propose the smallest verified path to get the desktop shell and core packages compiling locally on Windows without breaking repo conventions.
```

## Important truth

This repo is designed to make the project easier to finish, but it is still a **starter repo**. The current real milestone is:

- exercise the first task lifecycle end to end in the desktop UI
- add smoke tests around core package behavior
- improve review output, persistence, and approval handling
